import { Camera as CameraModel } from '@security/models';
import { ChildProcess, spawn } from 'child_process';
import { URL } from 'url';
import connect from '../../onvif-nvt/onvif-nvt';
import Camera from '../../onvif-nvt/camera';
import * as EventEmitter from 'events';
import path from 'path';
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
    if (camItem) {
      const rtspUrl = new URL(camItem.camera.defaultProfile.StreamUri.Uri);
      const connectionUrl = `rtsp://${camItem.model.username}:${camItem.model.password}@${camItem.model.url}:${camItem.model.rtspPort}${rtspUrl.pathname}${rtspUrl.search}`;
      const goProcess = spawn('go', ['run', '.', id, sdp, connectionUrl], {
        cwd: path.resolve(__dirname, 'rtspgo'),
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

      goProcess.stderr.on('data', async (chunk) => {
        const msg: string = chunk.toString('utf8');
        console.log('stderr', msg);

        if (msg.includes('Stream Codec Not Found')) {
          goProcess.kill();
          await this.endProcess(goProcess);
          // } else if (msg.includes('Stream Exit Rtsp Disconnect')) {
          //   goProcess.kill();
          //   await this.endProcess(goProcess);
        } else if (msg.includes('WebRTC Client Offline')) {
          goProcess.kill();
          await this.endProcess(goProcess);
        } else if (msg.includes('noVideo')) {
          // goProcess.kill();
          // await this.endProcess(goProcess);
          // this.rtspgo(id, sdp, res);
        }
      });
    } else {
      res.status(200).send({ msg: 'can not find camera' });
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
    const ids = [
      '3516d3-EKS-2I36D-IR-AI/00000170',
      '3519a1-EKS-8I2BIR/00000482',
      '3519a1-EKS-8I2BIR/00000606',
      '88/DS-2CD5B86G0-IZSUHK20210823AAWRG36527177',
      '88/DS-2CD5B86G0-IZSUHK20210823AAWRG36527635',
      '88/DS-2DF8242IX-AEL20210608CCWRT3G16243193',
    ];
    if (connectedIndex && connectedIndex > -1) {
      this.cameraModels.splice(connectedIndex, 1);
    }

    try {
      // OnvifManager.add('discovery');
      // OnvifManager.discovery.startProbe().then((deviceList) => {
      //   console.log(deviceList);
      //   // 'deviceList' contains all ONVIF devices that have responded.ç
      //   // If it is empty, then no ONVIF devices
      //   // responded back to the broadcast.
      // });
      const cam = await connect.connect(
        cameraModel.url,
        cameraModel.port,
        cameraModel.username,
        cameraModel.password
      );

      if (cam) {
        const identity =
          cam.deviceInformation.HardwareId +
          '/' +
          cam.deviceInformation.SerialNumber;

        if (!ids.includes(identity)) {
          throw 'Licence Error';
        }

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

  public static async getSnapshot(id: string): Promise<any> {
    return new Promise((resolve) => {
      const camItem = this.getCamera(id);
      camItem.camera.add('snapshot');
      camItem.camera.snapshot
        .getSnapshot()
        .then((results) => {
          let mimeType = results.mimeType;
          let rawImage = results.image;
          let prefix = 'data:' + mimeType + ';base64,';
          let base64Image = Buffer.from(rawImage, 'binary').toString('base64');
          let image = prefix + base64Image;
          resolve({ rawImage, mimeType });
          // 'image' is now ready to be displayed on a web page
          // ...
        })
        .catch((err) => {
          console.log('getSnapshot', err);
          resolve(null);
        });

      // camItem.camera.
      // if (camItem && camItem.nodeCam) {
      //   camItem.nodeCam
      //     .fetchSnapshot()
      //     .then((res) => {
      //       resolve(res.body);
      //     })
      //     .catch((error) => {
      //       console.error(error);
      //       resolve(null);
      //     });
      // } else {
      // }
    });
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
