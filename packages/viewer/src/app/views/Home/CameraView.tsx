import {
  ArrowBack,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  DirectionsWalk,
  PlayCircleFilled,
  Settings,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import { CircularProgress, IconButton } from '@mui/material';
import { Camera, Settings as SettingsModel } from '@security/models';
import * as bodyDetection from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-backend-wasm';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import React, { Component } from 'react';
import { CameraService } from '../../services/CameraService';

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);

interface State {
  streamSource: string;
  animation?: boolean;
  bodyDetect?: bodyDetection.BodyPix;
  loaded: boolean;
  playing: boolean;
  showMenu?: boolean;
  velocity?: { x?: any; y?: any; z?: any };
  mode: 'canvas' | 'video';
  boxes: any[];
}

type Props = {
  camera?: Camera;
  showSettings?: boolean;
  settings: SettingsModel;
};

class CameraView extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.video = React.createRef<any>();
    this.canvas = React.createRef<any>();
    this.runFrame = this.runFrame.bind(this);
    this.getTensorServer = this.getTensorServer.bind(this);
    this.getTensor = this.getTensor.bind(this);
    this.state = {
      streamSource: '',
      loaded: false,
      playing: false,
      velocity: { x: 0, y: 1, z: 0 },
      mode: 'video',
      boxes: [],
    };
  }

  animationFrame?: number;
  animationFrameTensor?: number;
  video: React.RefObject<any>;
  canvas: React.RefObject<any>;
  ctx?: any;
  pc?: RTCPeerConnection;

  async componentWillUnmount() {
    if (this.pc) {
      this.pc.close();
    }
    this.isStop = true;
    this.setState({ playing: false });
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.animationFrameTensor) {
      cancelAnimationFrame(this.animationFrameTensor);
    }
    await CameraService.disconnect(this.props.camera?.id || '');
  }

  async componentDidMount() {
    await tf.setBackend('webgl');
    if (this.props.camera?.id) {
      await CameraService.connect(this.props.camera?.id);
    }
    this.animationFrame = undefined;
    this.animationFrameTensor = undefined;
    const videoElement: HTMLVideoElement = this.video?.current;

    const bodyFix = await bodyDetection.load({
      architecture: this.props.settings.architecture || 'MobileNetV1',
      outputStride: this.props.settings.outputStride || 16,
      multiplier:
        this.props.settings.architecture == 'MobileNetV1'
          ? this.props.settings.multiplier || 0.75
          : undefined,
      quantBytes: this.props.settings.quantBytes || 2,
    });

    this.speed = this.props.settings.framePerSecond || 0.5;
    this.setState({
      bodyDetect: bodyFix,
      loaded: true,
      velocity: this.props['camera']?.position || this.state.velocity,
      // streamSource: `http://${location.host}/api/camera/pipe/${this.props.camera.id}`,
    });
  }

  boxes: any[] = [];
  last = 0;
  num = 0;
  speed = 0.5;
  isStop = false;
  async getTensorServer(timeStamp) {
    let timeInSecond = timeStamp / 1000;

    if (timeInSecond - this.last >= this.speed) {
      try {
        const result = await CameraService.getTensor(
          this.props.camera?.id || ''
        );
        let boxes: any = [];
        for (let index = 0; index < result.value.length; index++) {
          const points: any[] = result.value[index].keypoints;
          // .filter(
          //   (x) => x.score > 0.5
          // );

          if (points.length > 0) {
            points.sort(function (a, b) {
              return a.position.x - b.position.x;
            });
            const minX = points[0].position;
            const maxX = points[points.length - 1].position;

            points.sort(function (a, b) {
              return a.position.y - b.position.y;
            });
            const minY = points[0].position;
            const maxY = points[points.length - 1].position;
            boxes.push({
              x1: minX.x,
              y1: minY.y,
              x2: maxX.x,
              y2: maxY.y,
            });
          }
        }
        this.boxes = boxes;
        // this.setState({ boxes });
      } catch {
        this.boxes = [];
        // this.setState({ boxes: [] });
      }
      this.last = timeInSecond;
    }
    if (!this.isStop) {
      this.animationFrameTensor = requestAnimationFrame(this.getTensorServer);
    }
    // this.getTensor();
  }
  async getTensor(timeStamp) {
    let timeInSecond = timeStamp / 1000;

    if (timeInSecond - this.last >= this.speed) {
      try {
        const videoElement = this.video?.current;
        if (videoElement) {
          if (this.state.bodyDetect) {
            const pose = await this.state.bodyDetect.segmentPerson(
              videoElement,
              {
                flipHorizontal: false,
                internalResolution:
                  this.props.settings.internalResolution || 'high',
                segmentationThreshold:
                  this.props.settings.segmentationThreshold || 0.7,
                maxDetections: this.props.settings.maxDetections,
                nmsRadius: this.props.settings.nmsRadius,
                scoreThreshold: this.props.settings.scoreThreshold,
              }
            );

            const poses: any[] = pose.allPoses.filter((x) => x.score > 0.2);

            let boxes: any = [];
            for (let index = 0; index < poses.length; index++) {
              const points: any[] = poses[index].keypoints;
              // .filter(
              //   (x) => x.score > 0.5
              // );

              if (points.length > 0) {
                points.sort(function (a, b) {
                  return a.position.x - b.position.x;
                });
                const minX = points[0].position;
                const maxX = points[points.length - 1].position;

                points.sort(function (a, b) {
                  return a.position.y - b.position.y;
                });
                const minY = points[0].position;
                const maxY = points[points.length - 1].position;
                boxes.push({
                  x1: minX.x,
                  y1: minY.y,
                  x2: maxX.x,
                  y2: maxY.y,
                });
              }
            }
            this.boxes = boxes;
            // this.setState({ boxes });

            // this.setState({ boxes });
          }
        }
      } catch {
        this.boxes = [];
        // this.setState({ boxes: [] });
      }

      this.last = timeInSecond;
    }
    if (!this.isStop) {
      this.animationFrameTensor = requestAnimationFrame(this.getTensor);
    }
  }

  async runFrame(timeStamp) {
    const videoElement: HTMLVideoElement = this.video?.current;
    if (videoElement && this.canvas.current) {
      // this.ctx.clearRect(
      //   0,
      //   0,
      //   this.canvas.current.width,
      //   this.canvas.current.height
      // );
      this.ctx.drawImage(videoElement, 0, 0);

      // const { boxes } = this.state;
      const diff = 0;
      for (let index = 0; index < this.boxes.length; index++) {
        const box = this.boxes[index];
        this.ctx.beginPath();
        this.ctx.moveTo(box.x1, box.y1 - diff);
        this.ctx.lineTo(box.x2, box.y1 - diff);
        this.ctx.lineTo(box.x2, box.y2 - diff);
        this.ctx.lineTo(box.x1, box.y2 - diff);
        this.ctx.lineTo(box.x1, box.y1 - diff);
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = 'red';

        this.ctx.stroke();
      }
    }

    if (!this.isStop) {
      this.animationFrame = requestAnimationFrame(this.runFrame);
    }
  }

  render() {
    const speed = 1;
    const step = 0.05;
    return this.state.loaded ? (
      <>
        {!this.state.playing ? (
          <div style={{ width: '100%', height: '100%', display: 'flex' }}>
            <IconButton
              style={{ margin: 'auto' }}
              title="Kapat"
              onClick={async () => {
                // await CameraService.getInfo(this.props['camera'].id);
                // return;

                this.setState(
                  {
                    playing: true,
                    // streamSource: `http://${location.host}/api/camera/pipe/${this.props['camera'].id}`,
                  },
                  () => {
                    this.ctx = this.canvas.current.getContext('2d');

                    this.pc = new RTCPeerConnection({
                      iceServers: [
                        {
                          urls: ['stun:stun.l.google.com:19302'],
                        },
                      ],
                    });

                    this.pc.onnegotiationneeded = async (ev) => {
                      if (this.pc) {
                        let offer = await this.pc.createOffer();
                        await this.pc.setLocalDescription(offer);
                        const response = await fetch(
                          `http://${location.host}/api/camera/rtspgo/${this.props['camera']?.id}`,
                          {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              data: btoa(this.pc.localDescription?.sdp || ''),
                            }),
                          }
                        );
                        const data = await response.json();
                        // console.log(Buffer.from(data.answer, 'base64'));
                        this.pc.setRemoteDescription(
                          new RTCSessionDescription({
                            type: 'answer',
                            sdp: atob(data.answer),
                          })
                        );
                      }
                    };
                    this.pc.addTransceiver('video', {
                      direction: 'sendrecv',
                    });

                    this.pc.ontrack = (event) => {
                      let stream = new MediaStream();
                      stream.addTrack(event.track);
                      this.video.current.srcObject = stream;
                      // stream.addTrack(event.track);
                      // videoElem.srcObject = stream;
                      console.log(event.streams.length + ' track is delivered');
                    };
                  }
                );
              }}
            >
              <PlayCircleFilled style={{ fontSize: 120 }} />
            </IconButton>
          </div>
        ) : (
          <>
            <canvas
              ref={this.canvas}
              style={{
                width: '100%',
                // visibility: this.state.mode == 'video' ? 'hidden' : 'visible',
                // display: this.state.mode == 'video' ? 'none' : 'block',
              }}
            ></canvas>
            <div style={{ overflow: 'hidden', height: 0 }}>
              {this.props['camera']?.isPtz ? (
                <SpeedDial
                  style={{
                    position: 'absolute',
                    zIndex: 9999,
                    right: 20,
                    bottom: 50,
                  }}
                  ariaLabel="Ayarlar"
                  open={this.state.showMenu || false}
                  icon={<Settings />}
                  onClose={() => {
                    this.setState({ showMenu: false });
                  }}
                  onOpen={() => {
                    this.setState({ showMenu: true });
                  }}
                  direction={'up'}
                >
                  <SpeedDialAction
                    icon={<DirectionsWalk />}
                    title={'Dedektör'}
                    onClick={async () => {
                      this.setState({
                        mode: this.state.mode == 'canvas' ? 'video' : 'canvas',
                      });
                    }}
                  />
                  <SpeedDialAction
                    icon={<ArrowUpward />}
                    title={'Yukarı'}
                    onClick={async () => {
                      const { velocity } = this.state;
                      if (velocity) {
                        let cuurentValue = 0;
                        try {
                          cuurentValue = parseFloat(velocity.y);
                        } catch {}
                        if (cuurentValue < 1) {
                          velocity.y = cuurentValue + step;
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: speed,
                              y: speed,
                              z: speed,
                            }
                          );
                        }
                      }
                    }}
                  />
                  <SpeedDialAction
                    icon={<ArrowDownward />}
                    title={'Aşağı'}
                    onClick={async () => {
                      const { velocity } = this.state;
                      if (velocity) {
                        let cuurentValue = 0;
                        try {
                          cuurentValue = parseFloat(velocity.y);
                        } catch {}
                        if (cuurentValue > -1) {
                          velocity.y = cuurentValue - step;
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: speed,
                              y: speed,
                              z: speed,
                            }
                          );
                        }
                      }
                    }}
                  />

                  <SpeedDialAction
                    icon={<ArrowBack />}
                    title={'Sol'}
                    onClick={async () => {
                      const { velocity } = this.state;
                      if (velocity) {
                        let cuurentValue = 0;
                        try {
                          cuurentValue = parseFloat(velocity.x);
                        } catch {}
                        if (cuurentValue < 1) {
                          velocity.x = cuurentValue - step;
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: speed,
                              y: speed,
                              z: speed,
                            }
                          );
                        }
                      }
                    }}
                  />
                  <SpeedDialAction
                    icon={<ArrowForward />}
                    title={'Sağ'}
                    onClick={async () => {
                      const { velocity } = this.state;
                      if (velocity) {
                        let cuurentValue = 0;
                        try {
                          cuurentValue = parseFloat(velocity.x);
                        } catch {}
                        if (cuurentValue > -1) {
                          velocity.x = cuurentValue + step;
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: speed,
                              y: speed,
                              z: speed,
                            }
                          );
                        }
                      }
                    }}
                  />
                  <SpeedDialAction
                    icon={<ZoomIn />}
                    title={'Yaklaş'}
                    onClick={async () => {
                      const { velocity } = this.state;
                      if (velocity) {
                        let cuurentValue = 0;
                        try {
                          cuurentValue = parseFloat(velocity.z);
                        } catch {}
                        if (cuurentValue < 1) {
                          velocity.z = cuurentValue + step;
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: speed,
                              y: speed,
                              z: speed,
                            }
                          );
                        }
                      }
                    }}
                  />
                  <SpeedDialAction
                    icon={<ZoomOut />}
                    title={'Uzaklaş'}
                    onClick={async () => {
                      const { velocity } = this.state;
                      if (velocity) {
                        let cuurentValue = step;
                        try {
                          cuurentValue = parseFloat(velocity.z);
                        } catch {}
                        if (cuurentValue > 0) {
                          velocity.z = cuurentValue - step;
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: speed,
                              y: speed,
                              z: speed,
                            }
                          );
                        }
                      }
                    }}
                  />
                </SpeedDial>
              ) : (
                <SpeedDial
                  style={{
                    position: 'absolute',
                    zIndex: 9999,
                    right: 20,
                    bottom: 50,
                  }}
                  ariaLabel="Ayarlar"
                  open={this.state.showMenu || false}
                  icon={<Settings />}
                  onClose={() => {
                    this.setState({ showMenu: false });
                  }}
                  onOpen={() => {
                    this.setState({ showMenu: true });
                  }}
                  direction={'up'}
                >
                  <SpeedDialAction
                    icon={<DirectionsWalk />}
                    title={'Dedektör'}
                    onClick={async () => {
                      this.setState({
                        mode: this.state.mode == 'canvas' ? 'video' : 'canvas',
                      });
                    }}
                  />
                </SpeedDial>
              )}
              <video
                src={this.state.streamSource}
                autoPlay
                controls={false}
                style={{
                  width: '100%',
                  visibility: 'hidden', //canvas' ? 'hidden' : 'visible',
                }}
                ref={this.video}
                onLoadedData={async () => {
                  try {
                    this.canvas.current.width = this.video.current.videoWidth;
                    this.canvas.current.height = this.video.current.videoHeight;
                  } catch {}
                  if (!this.animationFrame) this.runFrame(0);

                  if (this.props.settings.type == 'server') {
                    this.getTensorServer(0);
                  } else {
                    this.getTensor(0);
                  }
                }}
              ></video>
            </div>
          </>
        )}
      </>
    ) : (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <CircularProgress style={{ margin: 'auto' }} />
      </div>
    );
  }
}

export default CameraView;
