import { Camera as CameraModel } from '@security/models';
import { ChildProcess, spawn } from 'child_process';
import { URL } from 'url';
import * as OnvifManager from '../../onvif-nvt/onvif-nvt';
import Camera = require('../../onvif-nvt/camera');
import EventEmitter = require('events');

export interface IServiceCamera {
  model: CameraModel;
  camera: Camera;
}
export class CameraService {
  static cameraModels: IServiceCamera[] = [];

  static camStreams: { [camId: string]: { reader?: RtspReader } } = {};

  static async endProcess(process) {
    return new Promise((resolve: any) => {
      setTimeout(() => {
        resolve();
      }, 2000);
      if (!process || process.killed) {
        resolve();
      }
      process.on('close', () => resolve());
      process.kill('SIGKILL');
    });
  }

  static async rtspgo(id, sdp, res) {
    const camItem = this.getCamera(id);
    const rtspUrl = new URL(camItem.camera.defaultProfile.StreamUri.Uri);
    const connectionUrl = `rtsp://${camItem.model.username}:${camItem.model.password}@${camItem.model.url}:${camItem.model.rtspPort}${rtspUrl.pathname}${rtspUrl.search}`;

    const goProcess = spawn('go', ['run', '.', id, sdp, connectionUrl], {
      cwd: './rtspgo',
    });

    goProcess.stdout.on('data', async (chunk) => {
      const dataString = chunk.toString('utf8');
      try {
        const data = JSON.parse(dataString);
        if (data.answer) {
          res.status(200).send(data);
        } else if (data.error) {
          console.log('stdout go err', data.error);
          goProcess.kill();
          await this.endProcess(goProcess);
          res.status(501);
        } else {
          res.status(501);
        }
      } catch (e) {
        console.log('stdout err', e);
        res.status(501);
      }
    });

    goProcess.stderr.on('data', (chunk) => {
      console.log('stderr', chunk.toString('utf8'));
    });
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

  async stopStream() {
    return new Promise((resolve: any) => {
      setTimeout(() => {
        resolve();
      }, 2000);
      if (!this.process || this.process.killed) {
        resolve();
      }
      this.process.on('close', () => resolve());
      this.process.kill('SIGKILL');
    });
  }

  async startStream(camItem: IServiceCamera) {
    return new Promise((resolve: any) => {
      resolve();
    });
  }
}
