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

export interface IServiceCamera {
  model: CameraModel;
  camera: Camera;
}
export class CameraService {
  static cameraModels: IServiceCamera[] = [];

  static socketUsers: { [key: string]: { socket: WebSocket; streams: any[] } } =
    {};
  static camStreams: { [camId: string]: { [userId: string]: RtspReader } } = {};

  static async pipeRes(camId, userId, res) {
    if (!this.camStreams[camId] || !this.camStreams[camId][userId]) {
      const rtspReader = new RtspReader();
      const camItem = this.getCamera(camId);
      await rtspReader.startStream(camItem);

      if (!this.camStreams[camId]) {
        this.camStreams[camId] = {};
      }
      this.camStreams[camId][userId] = rtspReader;
      rtspReader.setPipe(res);
    } else {
      this.camStreams[camId][userId].setPipe(res);
    }
  }

  static async stopRes(camId, userId, res) {
    if (this.camStreams[camId] && this.camStreams[camId][userId]) {
      await this.camStreams[camId][userId].stopStream();
      delete this.camStreams[camId];
    }
  }

  public static async connect(cameraModel: CameraModel) {
    const connected = this.cameraModels.find(
      (x) => x.model && x.model.id == cameraModel.id
    );
    if (!connected) {
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
          // const rtspReader = new RtspReader();
          // await rtspReader.startStream(camItem);

          this.camStreams[cameraModel.id] = {};
        }
        return cam;
      } catch (ex) {
        throw ex;
      }
    } else {
      return connected.camera;
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
  firstChunk: any[] = [];
  streams: any[] = [];
  mp4frag;

  async stopStream() {
    // spawn('taskkill', ['/pid', this.process.pid.toString(), '/f', '/t']);
    return new Promise((resolve: any) => {
      if (!this.process || this.process.killed) {
        resolve();
      }

      this.process.on('close', () => resolve());

      this.process.kill('SIGKILL');
      // this.process = void 0;
      execSync(`kill -9 ${this.process.pid}`);
    });
  }

  setPipe(res) {
    // console.log('setpipe');
    this.streams.push(res);
    console.log(this.mp4frag.initialization);
    if(this.mp4frag.initialization){
      res.write(this.mp4frag.initialization)
    }
    // if (this.firstChunk) {
    //   for (let index = 0; index < this.firstChunk.length; index++) {
    //     const element = this.firstChunk[index];
    //     res.write(element);
    //   }
    // }
    // this.process.stdout.pipe(res);
    // if (this.process) {
    //   if (!this.stream) {
    //     this.stream = new PassThrough();
    //     this.process.stdout.pipe(this.stream);
    //   }
    //   this.stream.pipe(res);
    // }
  }

  unpipe(res) {
    console.log('unpipe');
    if (this.process) {
    }
  }

  async startStream(camItem: IServiceCamera) {
    console.log('spawn');
    if (camItem && camItem.camera && !this.process) {
      const rtspUrl = new URL(camItem.camera.defaultProfile.StreamUri.Uri);
      const connectionUrl = `rtsp://${camItem.model.username}:${camItem.model.password}@${camItem.model.url}:${camItem.model.rtspPort}${rtspUrl.pathname}${rtspUrl.search}`;
      // const connectionUrl =
      //   'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4';

      //Add -vf format=yuv420p (or the alias -pix_fmt yuv420p) to make the output use a widely compatible pixel format.

      //   var args = [
      //     "-f", "dshow",
      //     "-i",  "video=Integrated Webcam" ,
      //     "-framerate", this.options.fps,
      //     "-video_size", this.options.width + 'x' + this.options.height,
      //     '-pix_fmt',  'yuv420p',
      //     '-c:v',  'libx264',
      //     '-b:v', '600k',
      //     '-bufsize', '600k',
      //     '-vprofile', 'baseline',
      //     '-tune', 'zerolatency',
      //     '-f' ,'rawvideo',
      //     '-'
      // ];
      // const outStream = fs.createWriteStream('output.mp4');
      this.process = spawn(ffmpegInstaller.path, [
        // '-probesize',
        // '64',
        '-analyzeduration',
        '100000',
        '-reorder_queue_size',
        '5',
        '-rtsp_transport',
        'tcp',
        '-i',
        connectionUrl,
        '-c:v',
        'copy',
        // with audio params
        // '-c:a',
        // 'aac',
        // without audio param
        '-an',
        '-f',
        'mp4',
        '-movflags',
        '+frag_every_frame+empty_moov+default_base_moof',
        '-reset_timestamps',
        '1',
        //'frag_keyframe+empty_moov+faststart',
        'pipe:',
      ]);
      this.mp4frag = new Mp4Frag({
        segmentCount: 10,
      });
      this.process.stdout.pipe(this.mp4frag);

      // mp4frag.on('segment', (data) => {
      //   console.log('---- segment ----');
      //   console.log(data);
      //   for (let index = 0; index < this.streams.length; index++) {
      //     const element = this.streams[index];
      //     element.write(data.segment);
      //   }
      // });

      let count = 0;
      this.process.stdout.on('data', (chunk) => {
        // if (count < 3) {
        //   this.firstChunk.push(chunk);
        //   count++;
        // }
        for (let index = 0; index < this.streams.length; index++) {
          const element = this.streams[index];
          element.write(chunk);
        }
      });
      // this.process.stdout.pipe(this.stream, { end: false });
      this.process.stderr.on('data', function (chunk) {
        var textChunk = chunk.toString('utf8');
        // console.error('stderr', textChunk);
      });

      this.process.on('close', function () {
        console.log('finished');
      });
    }
  }
}
