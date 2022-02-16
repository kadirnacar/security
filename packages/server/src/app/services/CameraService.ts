import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { Camera as CameraModel } from '@security/models';
import { spawn } from 'child_process';
import { URL } from 'url';
import * as OnvifManager from '../../onvif-nvt/onvif-nvt';
import Camera = require('../../onvif-nvt/camera');
import * as queryString from 'query-string';
import * as WebSocket from 'ws';
import { createUuidV4 } from '../../onvif-nvt/utils/util';

export class CameraService {
  static cameraModels: { model: CameraModel; camera: Camera }[] = [];

  static socketUsers: { [key: string]: { socket: WebSocket } } = {};

  public static initWebSocket(server) {
    const websocketServer = new WebSocket.Server({
      noServer: true,
      path: '/watch',
    });

    server.on('upgrade', (request, socket, head) => {
      websocketServer.handleUpgrade(request, socket, head, (websocket) => {
        websocketServer.emit('connection', websocket, request);
      });
    });

    websocketServer.on(
      'connection',
      (websocketConnection, connectionRequest) => {
        const [_path, params] = connectionRequest?.url?.split('?');
        const connectionParams = queryString.parse(params);

        const userId = createUuidV4();

        websocketConnection.send(JSON.stringify({ type: 'init', userId }));

        websocketConnection.on('close', () => {
          delete this.socketUsers[userId];
        });

        websocketConnection.on('message', function (message, isBinary) {
          let dataString = '';

          if (isBinary) {
            dataString = message.toString('utf8');
          } else {
            dataString = message?.toString();
          }

          let parsedMessage = {};
          try {
            parsedMessage = JSON.parse(dataString);
          } catch (err) {
            parsedMessage = dataString;
          }
        });
        this.socketUsers[userId] = { socket: websocketConnection };
      }
    );
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

      //Add -vf format=yuv420p (or the alias -pix_fmt yuv420p) to make the output use a widely compatible pixel format.

      const proc = spawn(ffmpegInstaller.path, [
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
        '-movflags',
        'frag_keyframe+empty_moov',
        '-f',
        'mp4',
        '-',
      ]);

      // const outStream = fs.createWriteStream('output.mp4');
      // proc.stdout.pipe(outStream);

      proc.stdout.on('data', function (chunk) {
        // console.log('stdout:', chunk);
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
