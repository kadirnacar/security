import {
  Add,
  ArrowBack,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  DirectionsWalk,
  PlayCircleFilled,
  Remove,
  Save,
  Settings,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import {
  Button,
  ButtonGroup,
  CircularProgress,
  Container,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  Typography,
} from '@mui/material';
import { Camera, Settings as SettingsModel } from '@security/models';
import * as bodyDetection from '@tensorflow-models/body-pix';
import { Pose } from '@tensorflow-models/body-pix/dist/types';
import '@tensorflow/tfjs-backend-wasm';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import React, { Component, PointerEvent, PointerEventHandler } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { CameraService } from '../../services/CameraService';
import { ApplicationState } from '../../store';
import CanvasView from './CanvasView';

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
  boxes: { x1: number; x2: number; y1: number; y2: number }[];
  speed: number;
  step: number;
  decimal: number;
  showSaveSettings: boolean;
  poses: bodyDetection.SemanticPersonSegmentation[];
}

type Props = {
  camera?: Camera;
  showSettings?: boolean;
  settings: SettingsModel;
  DataActions?: DataActions<Camera>;
  Data?: DataState;
  pos?: {
    x: number;
    y: number;
    width: number;
    height: number;
    boxHeight: number;
  };
  onClickPose?: (
    x: number,
    y: number,
    width: number,
    height: number,
    boxheight: number
  ) => void;
};

class CameraView extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.video = React.createRef<any>();
    this.canvas = React.createRef<any>();
    this.runFrame = this.runFrame.bind(this);
    this.getTensorServer = this.getTensorServer.bind(this);
    this.getTensor = this.getTensor.bind(this);
    this.handlecanvasClick = this.handlecanvasClick.bind(this);
    this.gotoPosition = this.gotoPosition.bind(this);

    this.boxes = [];
    this.state = {
      streamSource: '',
      loaded: false,
      playing: false,
      velocity: { x: 0, y: 1, z: 0 },
      mode: 'video',
      boxes: [],
      speed: 1,
      step: 0.1,
      decimal: 2,
      showSaveSettings: false,
      poses: [],
    };
  }

  animationFrame?: number;
  animationFrameTensor?: number;
  video: React.RefObject<any>;
  canvas: React.RefObject<any>;
  ctx?: CanvasRenderingContext2D;
  pc?: RTCPeerConnection;
  boxes: { x1: number; x2: number; y1: number; y2: number }[];

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

  async syncCameraPosition() {
    const { velocity } = this.state;
    if (velocity) {
      await CameraService.pos(this.props['camera']?.id || '', velocity, {
        x: this.state.speed,
        y: this.state.speed,
        z: this.state.speed,
      });
    }
  }
  calculatePos() {
    if (this.props.pos && this.props.camera) {
    }
  }
  async gotoPosition() {
    if (!this.props.pos) {
      await this.syncCameraPosition();
    } else if (this.props.camera?.tolerance) {
      const diffX =
        this.props.camera?.tolerance.x.max - this.props.camera.tolerance.x.min;
      const diffY =
        this.props.camera?.tolerance.y.min - this.props.camera.tolerance.y.max;

      const resultX = (diffX * this.props.pos.x) / this.props.pos.width;
      const resultY = (diffY * this.props.pos.y) / this.props.pos.height;

      const zoomFactor =
        parseFloat(this.props.pos.boxHeight.toString()) /
        parseFloat(this.props.pos.height.toString());
      const velocity = {
        x: (
          parseFloat(this.props.camera.tolerance.x.min.toString() || '0') +
          resultX
        ).toFixed(2),
        y: (
          parseFloat(this.props.camera.tolerance.y.min.toString() || '0') -
          resultY
        ).toFixed(2),
        z: 0,
      };

      this.setState(
        {
          velocity,
        },
        async () => {
          await this.syncCameraPosition();
        }
      );
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      !this.props.onClickPose &&
      this.props.pos &&
      this.props.pos.x != prevProps.pos?.x
    ) {
      await this.gotoPosition();
    }
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
    this.setState(
      {
        bodyDetect: bodyFix,
        loaded: true,
        velocity: this.props['camera']?.position || this.state.velocity,
        // streamSource: `http://${location.host}/api/camera/pipe/${this.props.camera.id}`,
      },
      async () => {
        await this.gotoPosition();
      }
    );
  }

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
            const pose: bodyDetection.SemanticPersonSegmentation =
              await this.state.bodyDetect.segmentPerson(videoElement, {
                flipHorizontal: false,
                internalResolution:
                  this.props.settings.internalResolution || 'high',
                segmentationThreshold:
                  this.props.settings.segmentationThreshold || 0.7,
                maxDetections: this.props.settings.maxDetections,
                nmsRadius: this.props.settings.nmsRadius,
                scoreThreshold: this.props.settings.scoreThreshold,
              });

            const poses: Pose[] = pose.allPoses.filter((x) => x.score > 0.2);

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
    if (videoElement && this.canvas.current && this.ctx) {
      // this.ctx.clearRect(
      //   0,
      //   0,
      //   this.canvas.current.width,
      //   this.canvas.current.height
      // );
      this.ctx?.drawImage(videoElement, 0, 0);

      // const { boxes } = this.state;
      const diff = 0;
      for (let index = 0; index < this.boxes.length; index++) {
        const box = this.boxes[index];
        // for (let index = 0; index < this.boxes.length; index++) {
        //   const box = this.boxes[index];
        this.ctx?.beginPath();
        this.ctx?.moveTo(box.x1, box.y1 - diff);
        this.ctx?.lineTo(box.x2, box.y1 - diff);
        this.ctx?.lineTo(box.x2, box.y2 - diff);
        this.ctx?.lineTo(box.x1, box.y2 - diff);
        this.ctx?.lineTo(box.x1, box.y1 - diff);
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = 'red';

        this.ctx?.stroke();
      }
    }

    if (!this.isStop) {
      this.animationFrame = requestAnimationFrame(this.runFrame);
    }
  }

  getRelativeMousePosition = (event, target) => {
    target = target || event.target;
    const rect = target.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  getNoPaddingNoBorderCanvasRelativeMousePosition = (event, target) => {
    target = target || event.target;
    const pos = this.getRelativeMousePosition(event, target);

    const d = target.width / target.clientWidth;
    const d2 = target.height / target.clientHeight;

    pos.x = pos.x * d;
    pos.y = pos.y * d2;

    return pos;
  };

  async handlecanvasClick(event: PointerEvent<HTMLCanvasElement>) {
    const pos = this.getNoPaddingNoBorderCanvasRelativeMousePosition(
      event,
      event.target
    );

    for (let index = 0; index < this.boxes.length; index++) {
      const box = this.boxes[index];

      if (
        pos.x > box.x1 &&
        pos.x < box.x2 &&
        pos.y > box.y1 &&
        pos.y < box.y2
      ) {
        if (this.props.onClickPose) {
          await this.props.onClickPose(
            box.x1,
            box.y1,
            this.canvas.current.width,
            this.canvas.current.height,
            box.y2 - box.y1
          );
        }
      }
    }
  }

  render() {
    return this.state.loaded ? (
      <>
        {/* <Button
          onClick={async () => {
            if (this.props.camera?.id)
              await CameraService.getInfo(this.props.camera?.id);
          }}
        >
          Get info
        </Button> */}
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
                      // iceServers: [
                      //   {
                          // urls: ['stun:stun.l.google.com:19302'],
                        // },
                      // ],
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
              onPointerDown={this.handlecanvasClick}
              style={{
                width: '100%',
                // visibility: this.state.mode == 'video' ? 'hidden' : 'visible',
                // display: this.state.mode == 'video' ? 'none' : 'block',
              }}
            ></canvas>
            <div style={{ overflow: 'auto', height: 500 }}>
              {this.props['camera']?.isPtz ? (
                <SpeedDial
                  style={{
                    position: 'absolute',
                    zIndex: 9999,
                    right: 20,
                    bottom: 50,
                  }}
                  ariaLabel="Ayarlar"
                  open={true}
                  // open={this.state.showMenu || false}
                  icon={<Settings />}
                  onClose={() => {
                    this.setState({ showMenu: false });
                  }}
                  onOpen={() => {
                    this.setState({ showMenu: true });
                  }}
                  direction={'left'}
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

                        const movement = cuurentValue + this.state.step;

                        if (movement <= 1 && movement >= -1) {
                          velocity.y = movement.toFixed(this.state.decimal);
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: this.state.speed,
                              y: this.state.speed,
                              z: this.state.speed,
                            }
                          );
                        }
                      }
                    }}
                  />
                  {/* <Typography>{this.state.velocity?.y} </Typography> */}
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

                        const mevement = cuurentValue - this.state.step;

                        if (mevement >= -1 && mevement <= 1) {
                          velocity.y = mevement.toFixed(this.state.decimal);
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: this.state.speed,
                              y: this.state.speed,
                              z: this.state.speed,
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

                        const mevement = cuurentValue + this.state.step;

                        if (mevement >= -1 && mevement <= 1) {
                          velocity.x = mevement.toFixed(this.state.decimal);
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: this.state.speed,
                              y: this.state.speed,
                              z: this.state.speed,
                            }
                          );
                        }
                      }
                    }}
                  />
                  {/* <Typography>{this.state.velocity?.x} </Typography> */}
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

                        const mevement = cuurentValue - this.state.step;

                        if (mevement <= 1 && mevement >= -1) {
                          velocity.x = mevement.toFixed(this.state.decimal);
                          this.setState({ velocity });

                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: this.state.speed,
                              y: this.state.speed,
                              z: this.state.speed,
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

                        const mevement = cuurentValue + this.state.step;

                        if (mevement <= 1 && mevement >= 0) {
                          velocity.z = mevement.toFixed(this.state.decimal);
                          this.setState({ velocity });

                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: this.state.speed,
                              y: this.state.speed,
                              z: this.state.speed,
                            }
                          );
                        }
                      }
                    }}
                  />
                  {/* <Typography>{this.state.velocity?.z} </Typography> */}
                  <SpeedDialAction
                    icon={<ZoomOut />}
                    title={'Uzaklaş'}
                    onClick={async () => {
                      const { velocity } = this.state;
                      if (velocity) {
                        let cuurentValue = 0;
                        try {
                          cuurentValue = parseFloat(velocity.z);
                        } catch {}

                        const mevement = cuurentValue - this.state.step;

                        if (mevement >= 0 && mevement <= 1) {
                          velocity.z = mevement.toFixed(this.state.decimal);
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: this.state.speed,
                              y: this.state.speed,
                              z: this.state.speed,
                            }
                          );
                        }
                      }
                    }}
                  />
                  <SpeedDialAction
                    icon={<Remove />}
                    title={'Yavaşla'}
                    onClick={async () => {
                      const { step } = this.state;
                      const mevement = step - 0.05;

                      if (mevement <= 1 && mevement >= 0) {
                        this.setState({
                          step: parseFloat(
                            mevement.toFixed(this.state.decimal)
                          ),
                        });
                      }
                    }}
                  />
                  {/* <Typography>{this.state.step} </Typography> */}
                  <SpeedDialAction
                    icon={<Add />}
                    title={'Hızlan'}
                    onClick={async () => {
                      const { step } = this.state;
                      const mevement = step + 0.05;

                      if (mevement <= 1 && mevement >= 0) {
                        this.setState({
                          step: parseFloat(
                            mevement.toFixed(this.state.decimal)
                          ),
                        });
                      }
                    }}
                  />
                  <SpeedDialAction
                    icon={<Settings />}
                    title={'Kaydet'}
                    onClick={async () => {
                      const { step } = this.state;
                      this.setState({
                        showSaveSettings: !this.state.showSaveSettings,
                      });
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
                  open={true}
                  // open={this.state.showMenu || false}
                  icon={<Settings />}
                  onClose={() => {
                    this.setState({ showMenu: false });
                  }}
                  onOpen={() => {
                    this.setState({ showMenu: true });
                  }}
                  direction={'left'}
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
                    icon={<ZoomIn />}
                    title={'Yaklaş'}
                    onClick={async () => {
                      const { velocity } = this.state;
                      if (velocity) {
                        let cuurentValue = 0;
                        try {
                          cuurentValue = parseFloat(velocity.z);
                        } catch {}

                        const mevement = cuurentValue + this.state.step;

                        if (mevement <= 1 && mevement >= 0) {
                          velocity.z = mevement.toFixed(this.state.decimal);
                          this.setState({ velocity });

                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: this.state.speed,
                              y: this.state.speed,
                              z: this.state.speed,
                            }
                          );
                        }
                      }
                    }}
                  />
                  {/* <Typography>{this.state.velocity?.z} </Typography> */}
                  <SpeedDialAction
                    icon={<ZoomOut />}
                    title={'Uzaklaş'}
                    onClick={async () => {
                      const { velocity } = this.state;
                      if (velocity) {
                        let cuurentValue = 0;
                        try {
                          cuurentValue = parseFloat(velocity.z);
                        } catch {}

                        const mevement = cuurentValue - this.state.step;

                        if (mevement >= 0 && mevement <= 1) {
                          velocity.z = mevement.toFixed(this.state.decimal);
                          this.setState({ velocity });
                          await CameraService.pos(
                            this.props['camera']?.id || '',
                            velocity,
                            {
                              x: this.state.speed,
                              y: this.state.speed,
                              z: this.state.speed,
                            }
                          );
                        }
                      }
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
                  // visibility: 'hidden', //canvas' ? 'hidden' : 'visible',
                }}
                ref={this.video}
                onLoadedData={async () => {
                  console.log('video load');
                  // try {
                  //   this.canvas.current.width = this.video.current.videoWidth;
                  //   this.canvas.current.height = this.video.current.videoHeight;
                  // } catch {}
                  // if (!this.animationFrame) this.runFrame(0);

                  // if (this.props.settings.type == 'server') {
                  //   this.getTensorServer(0);
                  // } else {
                  //   this.getTensor(0);
                  // }
                }}
              ></video>
            </div>
            <div
              style={{
                display: this.state.showSaveSettings ? 'block' : 'none',
              }}
            >
              <ButtonGroup
                variant="contained"
                aria-label="outlined primary button group"
              >
                <Button
                  onClick={async () => {
                    this.props.camera?.position;
                    await this.props.DataActions?.updateItem('Camera', {
                      ...this.props.camera,
                      ...{ position: this.state.velocity },
                    });
                  }}
                >
                  <Save></Save>Orgin
                </Button>
                <Button
                  onClick={async () => {
                    if (this.props.camera) {
                      let tolerance = this.props.camera.tolerance;
                      if (!tolerance) {
                        tolerance = {
                          x: { max: 0, min: 0 },
                          y: { max: 0, min: 0 },
                        };
                      }
                      tolerance.x.min = this.state.velocity?.x;
                      tolerance.y.min = this.state.velocity?.y;
                      await this.props.DataActions?.updateItem('Camera', {
                        ...this.props.camera,
                        ...{ tolerance },
                      });
                      await this.props.DataActions?.getById(
                        'Camera',
                        this.props.camera?.id || ''
                      );
                    }
                  }}
                >
                  <Save></Save>
                  <label>X</label>
                  <label
                    style={{
                      fontSize: 12,
                      verticalAlign: 'sub',
                      height: 10,
                    }}
                  >
                    0
                  </label>
                  <label>Y</label>
                  <label
                    style={{
                      fontSize: 12,
                      verticalAlign: 'sub',
                      height: 10,
                    }}
                  >
                    0
                  </label>
                </Button>
                <Button
                  onClick={async () => {
                    if (this.props.camera) {
                      let tolerance = this.props.camera.tolerance;
                      if (!tolerance) {
                        tolerance = {
                          x: { max: 0, min: 0 },
                          y: { max: 0, min: 0 },
                        };
                      }

                      tolerance.x.max = this.state.velocity?.x;
                      tolerance.y.max = this.state.velocity?.y;
                      await this.props.DataActions?.updateItem('Camera', {
                        ...this.props.camera,
                        ...{ tolerance },
                      });
                      await this.props.DataActions?.getById(
                        'Camera',
                        this.props.camera?.id || ''
                      );
                    }
                  }}
                >
                  <Save></Save>
                  <label>X</label>
                  <label
                    style={{
                      fontSize: 12,
                      verticalAlign: 'sub',
                      height: 10,
                    }}
                  >
                    1
                  </label>
                  <label>Y</label>
                  <label
                    style={{
                      fontSize: 12,
                      verticalAlign: 'sub',
                      height: 10,
                    }}
                  >
                    1
                  </label>
                </Button>
              </ButtonGroup>
              <Container>
                <div>X:{this.state.velocity?.x}</div>
                <div>Y:{this.state.velocity?.y}</div>
                <div>Z:{this.state.velocity?.z}</div>
                <div>Step:{this.state.step}</div>
              </Container>
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

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraView);
