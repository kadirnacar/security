import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { Camera as CameraModel } from '@security/models';
import { ChildProcess, execSync, spawn } from 'child_process';
import { URL } from 'url';
import * as OnvifManager from '../../onvif-nvt/onvif-nvt';
import Camera = require('../../onvif-nvt/camera');
import * as queryString from 'query-string';
import * as WebSocket from 'ws';
import { createUuidV4 } from '../../onvif-nvt/utils/util';
import EventEmitter = require('events');
import { PassThrough, Writable } from 'stream';
import * as fs from 'fs';
import * as Mp4Frag from 'mp4frag';
import path = require('path');

export interface IServiceCamera {
  model: CameraModel;
  camera: Camera;
}
export class CameraService {
  static cameraModels: IServiceCamera[] = [];

  static socketUsers: { [key: string]: { socket: WebSocket; streams: any[] } } =
    {};
  static camStreams: { [camId: string]: { reader?: RtspReader } } = {};

  static async getPlaylist(camId, res) {
    if (this.camStreams[camId]) {
      this.camStreams[camId].reader.getPlaylist(res);
    }
  }

  static async getHeader(camId, res) {
    if (this.camStreams[camId]) {
      this.camStreams[camId].reader.getHeader(res);
    }
  }

  static async getSegment(camId, segId, res) {
    if (this.camStreams[camId]) {
      this.camStreams[camId].reader.getSegment(res, segId);
    }
  }

  static async setPipe(camId, res) {
    if (this.camStreams[camId]) {
      await this.camStreams[camId].reader.setPipe(res);
    }
  }

  static async stopRes(camId, userId, res) {
    if (this.camStreams[camId] && this.camStreams[camId][userId]) {
      await this.camStreams[camId][userId].stopStream();
      delete this.camStreams[camId];
    }
  }

  public static async disconnect(cameraModel: CameraModel) {
    const connected = this.cameraModels.findIndex(
      (x) => x.model && x.model.id == cameraModel.id
    );
    if (
      this.camStreams[cameraModel.id] &&
      this.camStreams[cameraModel.id].reader
    ) {
      this.camStreams[cameraModel.id].reader.stopStream();
    }
    if (connected && connected > -1) {
      this.cameraModels.splice(connected, 1);
    }
  }

  public static async connect(cameraModel: CameraModel) {
    const connectedIndex = this.cameraModels.findIndex(
      (x) => x.model && x.model.id == cameraModel.id
    );
    if (
      this.camStreams[cameraModel.id] &&
      this.camStreams[cameraModel.id].reader
    ) {
      await this.camStreams[cameraModel.id].reader.stopStream();
    }

    if (connectedIndex && connectedIndex > -1) {
      this.cameraModels.splice(connectedIndex, 1);
    }

    try {
      const cam = await OnvifManager.connect(
        cameraModel.url,
        cameraModel.port,
        cameraModel.username,
        cameraModel.password
      );
      if (cam) {
        const camItem = { model: cameraModel, camera: cam };
        this.cameraModels.push(camItem);
        const rtspReader = new RtspReader();
        await rtspReader.startStream(camItem);

        this.camStreams[cameraModel.id] = { reader: rtspReader };
      }
      return cam;
    } catch (ex) {
      throw ex;
    }
  }

  public static getCamera(id: string) {
    const camItem = this.cameraModels.find((x) => x.model && x.model.id == id);
    return camItem;
  }
}

export class RtspReader extends EventEmitter {
  constructor() {
    super();
  }

  process: ChildProcess;
  mp4frag;

  async stopStream() {
    return new Promise((resolve: any) => {
      setTimeout(() => {
        resolve();
      }, 2000);
      if (!this.process || this.process.killed) {
        resolve();
      }
      this.mp4frag.resetCache();
      // this.process.stdio[1].unpipe(this.mp4frag);
      this.process.on('close', () => resolve());
      this.process.kill('SIGKILL');
      // execSync(`kill -9 ${this.process.pid}`);
    });
  }

  getPlaylist(res) {
    if (this.mp4frag.m3u8) {
      res.writeHead(200, { 'Content-Type': 'application/vnd.apple.mpegurl' });
      res.end(this.mp4frag.m3u8);
    } else {
      res.sendStatus(503);
    }
  }

  getHeader(res) {
    if (this.mp4frag.initialization) {
      res.writeHead(200, { 'Content-Type': 'video/mp4' });
      res.end(this.mp4frag.initialization);
    } else {
      res.sendStatus(503);
    }
  }

  getSegment(res, id) {
    const segmentObject = this.mp4frag.getSegmentObject(id);
    if (segmentObject) {
      res.writeHead(200, { 'Content-Type': 'video/mp4' });
      res.end(segmentObject.segment);
    } else {
      res.sendStatus(503);
    }
  }

  async setPipe(res) {
    res.writeHead(200, { 'Content-Type': 'video/mp4' });
    res.write(this.mp4frag.initialization)
    this.mp4frag.pipe(res);
  }

  unpipe(res) {
    if (this.process) {
    }
  }


  async startStream(camItem: IServiceCamera) {
    return new Promise((resolve: any) => {
      if (camItem && camItem.camera && !this.process) {
        const rtspUrl = new URL(camItem.camera.defaultProfile.StreamUri.Uri);
        const connectionUrl = `rtsp://${camItem.model.username}:${camItem.model.password}@${camItem.model.url}:${camItem.model.rtspPort}${rtspUrl.pathname}${rtspUrl.search}`;

        this.process = spawn(
          ffmpegInstaller.path,
          [
            '-rtsp_transport',
            'tcp',
            '-re',
            '-i',
            connectionUrl,
            '-an',
            '-c:v',
            'copy',
            '-f',
            'mp4',
            '-movflags',
            '+frag_keyframe+empty_moov+default_base_moof+faststart',
            '-tune',
            'zerolatency',
            '-reset_timestamps',
            '1',
            'pipe:1',
          ],
          { stdio: ['ignore', 'pipe', 'ignore', 'pipe'] }
        );
        this.mp4frag = new Mp4Frag({});

        this.process.stdio[1].pipe(this.mp4frag);

        // this.process.stderr.on('data', (chunk) => {
        //   console.log('stderr',chunk.toString('utf8'));
        // });

        this.mp4frag.on('initialized', (params) => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
