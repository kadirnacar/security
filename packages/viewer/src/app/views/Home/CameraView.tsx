import { CircularProgress, IconButton } from '@material-ui/core';
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
} from '@material-ui/icons';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import { Camera } from '@security/models';
import * as bodyDetection from '@tensorflow-models/body-pix';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import * as tf from '@tensorflow/tfjs-core';
import React, { Component } from 'react';
import 'vimond-replay/index.css';
import { CameraService } from '../../services/CameraService';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-wasm';

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
  camera: Camera;
  showSettings?: boolean;
};

class CameraView extends Component<Props & any, State> {
  constructor(props) {
    super(props);
    this.video = React.createRef<any>();
    this.canvas = React.createRef<any>();
    this.runFrame = this.runFrame.bind(this);
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
  video: React.RefObject<any>;
  canvas: React.RefObject<any>;
  ctx?: any;

  async componentWillUnmount() {
    await CameraService.disconnect(this.props['camera'].id);
  }

  async componentDidMount() {
    await tf.setBackend('wasm');

    if (this.props['camera'].id) {
      await CameraService.connect(this.props['camera'].id);
    }

    const videoElement: HTMLVideoElement = this.video?.current;

    const bodyFix = await bodyDetection.load({
      architecture: 'ResNet50',
      outputStride: 16,
      multiplier: 1,
      quantBytes: 2,
    });

    this.setState({
      bodyDetect: bodyFix,
      loaded: true,
      velocity: this.props['camera']?.position || this.state.velocity,
      // streamSource: `http://${location.host}/api/camera/pipe/${this.props.camera.id}`,
    });
  }

  async getTensor() {
    try {
      const result = await CameraService.getInfo(this.props['camera'].id);
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
      this.setState({ boxes });
    } catch {
      this.setState({ boxes: [] });
    }
    this.getTensor();
  }

  async runFrame() {
    const videoElement: HTMLVideoElement = this.video?.current;
    if (videoElement && this.canvas.current) {
      this.ctx.clearRect(
        0,
        0,
        this.canvas.current.width,
        this.canvas.current.height
      );
      this.ctx.drawImage(videoElement, 0, 0);

      const { boxes } = this.state;
      const diff = 100;
      for (let index = 0; index < boxes.length; index++) {
        const box = boxes[index];
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
    this.animationFrame = requestAnimationFrame(this.runFrame);
  }

  async runFrame2() {
    const videoElement: HTMLVideoElement = this.video?.current;
    if (videoElement) {
      if (this.state.bodyDetect) {
        try {
          const pose = await this.state.bodyDetect.segmentPerson(videoElement, {
            flipHorizontal: false,
            internalResolution: 'full',
            scoreThreshold: 0.3,
            segmentationThreshold: 0.3,
          });
          console.log(pose);
          const seg = bodyDetection.toMask(pose);
          if (seg && this.state.mode == 'canvas') {
            bodyDetection.drawMask(
              this.canvas.current,
              this.video.current,
              seg,
              0.7,
              0,
              false
            );
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
    setTimeout(async () => {
      // await this.runFrame();
      this.animationFrame = requestAnimationFrame(this.runFrame);
    }, 100);
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

                    const pc = new RTCPeerConnection({
                      iceServers: [
                        {
                          urls: ['stun:stun.l.google.com:19302'],
                        },
                      ],
                    });

                    pc.onnegotiationneeded = async (ev) => {
                      let offer = await pc.createOffer();
                      await pc.setLocalDescription(offer);
                      const response = await fetch(
                        `http://${location.host}/api/camera/rtspgo/${this.props['camera'].id}`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            data: btoa(pc.localDescription?.sdp || ''),
                          }),
                        }
                      );
                      const data = await response.json();
                      // console.log(Buffer.from(data.answer, 'base64'));
                      pc.setRemoteDescription(
                        new RTCSessionDescription({
                          type: 'answer',
                          sdp: atob(data.answer),
                        })
                      );
                    };
                    pc.addTransceiver('video', {
                      direction: 'sendrecv',
                    });

                    pc.ontrack = (event) => {
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
            {this.props['camera'].isPtz ? (
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
                  tooltipTitle={'Dedektör'}
                  onClick={async () => {
                    this.setState({
                      mode: this.state.mode == 'canvas' ? 'video' : 'canvas',
                    });
                  }}
                />
                <SpeedDialAction
                  icon={<ArrowUpward />}
                  tooltipTitle={'Yukarı'}
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
                          this.props['camera'].id,
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
                  tooltipTitle={'Aşağı'}
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
                          this.props['camera'].id,
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
                  tooltipTitle={'Sol'}
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
                          this.props['camera'].id,
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
                  tooltipTitle={'Sağ'}
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
                          this.props['camera'].id,
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
                  tooltipTitle={'Yaklaş'}
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
                          this.props['camera'].id,
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
                  tooltipTitle={'Uzaklaş'}
                  onClick={async () => {
                    const { velocity } = this.state;
                    if (velocity) {
                      let cuurentValue = step;
                      try {
                        cuurentValue = parseFloat(velocity.z);
                      } catch {}
                      console.log(cuurentValue,velocity)
                      if (cuurentValue > 0) {
                        velocity.z = cuurentValue - step;
                        this.setState({ velocity });
                        await CameraService.pos(
                          this.props['camera'].id,
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
                  tooltipTitle={'Dedektör'}
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
                  if (!this.animationFrame)
                    requestAnimationFrame(this.runFrame);

                  this.getTensor();
                }}
                // onPause={() => {
                //   this.setState({
                //     playing: false,
                //     streamSource: '',
                //   });
                // }}
                // onError={() => {
                //   this.setState({
                //     playing: false,
                //     streamSource: '',
                //   });
                // }}
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
