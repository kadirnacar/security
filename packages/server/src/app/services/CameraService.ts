import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { Camera as CameraModel } from '@security/models';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { URL } from 'url';
import * as OnvifManager from '../../onvif-nvt/onvif-nvt';
import Camera = require('../../onvif-nvt/camera');
export class CameraService {
  static cameraModels: { model: CameraModel; camera: Camera }[] = [];

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
          this.cameraModels.push({ model: cameraModel, camera: cam });
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

  public static async startStream(id: string) {
    const camItem = this.getCamera(id);
    if (camItem && camItem.camera) {
      const rtspUrl = new URL(camItem.camera.defaultProfile.StreamUri.Uri);
      const connectionUrl = `rtsp://${camItem.model.username}:${camItem.model.password}@${camItem.model.url}:${camItem.model.rtspPort}${rtspUrl.pathname}${rtspUrl.search}`;
      const outStream = fs.createWriteStream('output.mp4');
      const proc = spawn(ffmpegInstaller.path, [
        '-rtsp_transport',
        'tcp',
        '-i',
        connectionUrl,
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-movflags',
        'frag_keyframe+empty_moov',
        '-f',
        'mp4',
        // '-f',
        // 'segment',
        // '-segment_time',
        // '5',
        // '-segment_format',
        // 'mp4',
        '-',
      ]);

      proc.stdout.pipe(outStream);

      proc.stdout.on('data', function (chunk) {
        console.log('stdout:', chunk);
      });

      proc.stderr.on('data', function (chunk) {
        var textChunk = chunk.toString('utf8');
        console.error('stderr', textChunk);
      });

      proc.on('close', function () {
        console.log('finished');
      });
    }
  }
}
