import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { Camera as CameraModel } from '@security/models';
import { ChildProcess, spawn } from 'child_process';
import { URL } from 'url';
import * as OnvifManager from '../../onvif-nvt/onvif-nvt';
import Camera = require('../../onvif-nvt/camera');
import * as queryString from 'query-string';
import * as WebSocket from 'ws';
import { createUuidV4 } from '../../onvif-nvt/utils/util';
import EventEmitter = require('events');

export interface IServiceCamera {
  model: CameraModel;
  camera: Camera;
}
export class CameraService {
  static cameraModels: IServiceCamera[] = [];

  static socketUsers: { [key: string]: { socket: WebSocket; streams: any[] } } =
    {};
  static camStreams: { [key: string]: { reader: RtspReader } } = {};

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

        websocketConnection.on('error', () => {
          delete this.socketUsers[userId];
        });

        websocketConnection.on('message', async (message, isBinary) => {
          let dataString = '';

          if (isBinary) {
            dataString = message.toString('utf8');
          } else {
            dataString = message?.toString();
          }

          let parsedMessage: any = {};
          try {
            parsedMessage = JSON.parse(dataString);
          } catch (err) {
            parsedMessage = dataString;
          }
          console.log(parsedMessage);

          if (parsedMessage && parsedMessage.type) {
            switch (parsedMessage.type) {
              case 'stop':
                if (this.camStreams[parsedMessage.camId]) {
                  this.camStreams[parsedMessage.camId].reader.stopStream();
                  delete this.camStreams[parsedMessage.camId];
                }
                break;
              case 'connect':
                if (!this.camStreams[parsedMessage.camId]) {
                  const rtspReader = new RtspReader();
                  const camItem = this.getCamera(parsedMessage.camId);
                  rtspReader.addListener('data', (ev) => {
                    if (this.socketUsers[userId]) {
                      this.socketUsers[userId].socket.send(
                        JSON.stringify({
                          camId: parsedMessage.camId,
                          data: ev.data,
                        })
                      );
                    }
                  });
                  await rtspReader.startStream(camItem);
                  this.camStreams[parsedMessage.camId] = { reader: rtspReader };
                } else {
                  this.camStreams[parsedMessage.camId].reader.addListener(
                    'data',
                    (ev) => {
                      if (this.socketUsers[userId])
                        this.socketUsers[userId].socket.send({
                          camId: parsedMessage.camId,
                          data: ev.data,
                        });
                    }
                  );
                }

                this.socketUsers[userId].streams.push(parsedMessage.camId);

                break;
              default:
                break;
            }
          }
        });
        this.socketUsers[userId] = { socket: websocketConnection, streams: [] };
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
}

export class RtspReader extends EventEmitter {
  constructor() {
    super();
  }

  process: ChildProcess;

  stopStream() {
    console.log('killl');
    this.process.kill();
  }

  async startStream(camItem: IServiceCamera) {
    if (camItem && camItem.camera) {
      const rtspUrl = new URL(camItem.camera.defaultProfile.StreamUri.Uri);
      const connectionUrl = `rtsp://${camItem.model.username}:${camItem.model.password}@${camItem.model.url}:${camItem.model.rtspPort}${rtspUrl.pathname}${rtspUrl.search}`;

      //Add -vf format=yuv420p (or the alias -pix_fmt yuv420p) to make the output use a widely compatible pixel format.

      this.process = spawn(ffmpegInstaller.path, [
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

      this.process.stdout.on('data', (chunk) => {
        this.emit('data', { data: chunk });
      });

      this.process.stderr.on('data', function (chunk) {
        var textChunk = chunk.toString('utf8');
        console.error('stderr', textChunk);
      });

      this.process.on('close', function () {
        console.log('finished');
      });
    }
  }
}
