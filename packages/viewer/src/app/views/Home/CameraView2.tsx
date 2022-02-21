import { Camera } from '@security/models';
import React, { Component } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AppCtx, AppContextInterface } from '../../reducers/Base';
import { DataActions } from '../../reducers/Data/actions';
import { CameraService } from '../../services/CameraService';
import { ApplicationState } from '../../store';
import MinMaxValue from './MinMaxVale';
import SlideValue from './SlideValue';
import { Replay } from 'vimond-replay';
import 'vimond-replay/index.css';
import HlsjsVideoStreamer from 'vimond-replay/video-streamer/hlsjs';
import * as objectDetection from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-cpu';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';

// tfjsWasm.setWasmPaths('assets/wasm/');

interface Props {
  DataActions?: DataActions<Camera>;
  id?: string;
}

interface State {
  range: { min: any; max: any; step: any; speed: any };
  velocity?: { x?: any; y?: any; z?: any };
  action?: 'home';
  streamSource?: any;
  isLoaded?: boolean;
  cameraItem?: Camera;
  objectDetect?: objectDetection.ObjectDetection;
  animation?: boolean;
}

export class CameraView extends Component<
  Props & ApplicationState,
  State,
  AppContextInterface
> {
  constructor(props) {
    super(props);
    this.startStream = this.startStream.bind(this);
    this.savePosition = this.savePosition.bind(this);
    this.connectCam = this.connectCam.bind(this);
    this.disconnectCam = this.disconnectCam.bind(this);
    this.runFrame = this.runFrame.bind(this);
    this.video = React.createRef<HTMLVideoElement>();
    this.canvas = React.createRef<HTMLCanvasElement>();
    this.canvasElement = React.createRef<HTMLCanvasElement>();
    tfjsWasm.setWasmPaths(
      `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
      // 'wasm/'
    );
    this.state = {
      range: { min: -1, max: 1, step: 0.1, speed: 0.8 },
      velocity: { x: 0, y: 1, z: 0 },
      action: undefined,
      cameraItem: undefined,
      objectDetect: undefined,
      animation: true,
    };
  }

  context: AppContextInterface | undefined;
  video: React.RefObject<HTMLVideoElement>;
  canvas: React.RefObject<HTMLCanvasElement>;
  socket?: WebSocket;
  ctx?: CanvasRenderingContext2D;
  canvasElement: React.RefObject<HTMLCanvasElement>;
  animationFrame?: number;

  static contextType = AppCtx;

  async connectCam() {
    if (this.props.id) {
      this.setState({ isLoaded: false });
      await CameraService.connect(this.props.id);
      this.setState({ isLoaded: true });
    }
  }

  async disconnectCam() {
    if (this.props.id) {
      this.setState({ isLoaded: false });
      await CameraService.disconnect(this.props.id);
    }
  }
  async componentDidMount() {
    if (this.props.id) {
      await this.props.DataActions?.getById('Camera', this.props.id);
      if (this.props.Data.Camera.CurrentItem) {
        this.setState({
          velocity: this.props.Data.Camera.CurrentItem.position,
          isLoaded: false,
          cameraItem: this.props.Data.Camera.CurrentItem,
        });
      }

      if (this.canvasElement.current && this.video.current) {
        const rect = this.video.current.getBoundingClientRect();
        this.canvasElement.current.width = rect.width;
        this.canvasElement.current.height = rect.height;
        const ct = this.canvasElement.current.getContext('2d');
        if (ct) {
          this.ctx = ct;
          this.ctx.fillStyle = 'white';
          this.ctx.fillRect(0, 0, rect.width, rect.height);
        }
      }
      await tf.setBackend('wasm');
      await tf.ready();
      const objectDetect = await objectDetection.load({
        // modelUrl: 'assets/models/lite_mobilenet_v2/model.json',
      });
      this.setState({
        objectDetect,
      });
    }
  }
  // async componentDidMount() {
  //   const videoElement: HTMLVideoElement =
  //     this.video.current?.videoRef?.current;
  //   if (this.props.id && videoElement) {
  //     await this.props.DataActions?.getById('Camera', this.props.id);
  //     if (this.props.Data.Camera.CurrentItem?.position) {
  //       this.setState({
  //         velocity: this.props.Data.Camera.CurrentItem.position,
  //       });
  //     }
  //     if (this.canvasElement.current) {
  //       const rect = videoElement.getBoundingClientRect();
  //       this.canvasElement.current.width = rect.width;
  //       this.canvasElement.current.height = rect.height;
  //       const ct = this.canvasElement.current.getContext('2d');
  //       if (ct) {
  //         this.ctx = ct;
  //         this.ctx.fillStyle = 'white';
  //         this.ctx.fillRect(0, 0, rect.width, rect.height);
  //       }
  //     }
  //     const objectDetect = await objectDetection.load({
  //       modelUrl: 'assets/models/lite_mobilenet_v2/model.json',
  //     });
  //     // await tf.setBackend('wasm');
  //     this.setState({
  //       isLoaded: false,
  //       cameraItem: this.props.Data.Camera.CurrentItem,
  //       objectDetect,
  //     });
  //   }
  // }

  componentWillUnmount() {
    if (this.props.id && this.socket) {
      this.socket.close();
    }
  }

  async startStream() {
    if (this.props.id) {
      this.setState({
        streamSource: `http://${location.host}/api/camera/pipe/${this.props.id}`,
      });
    }
  }

  async savePosition() {
    if (this.state.cameraItem) {
      const data = this.state.cameraItem;
      data.position = this.state.velocity;
      await this.props.DataActions?.updateItem('Camera', data);
    }
  }

  async runFrame() {
    if (this.ctx && this.canvasElement.current && this.video.current) {
      if (this.ctx) {
        this.ctx.clearRect(
          0,
          0,
          this.video.current.videoWidth,
          this.video.current.videoHeight
        );
        this.ctx.drawImage(
          this.video.current,
          0,
          0,
          this.video.current.videoWidth,
          this.video.current.videoHeight
        );

        try {
          const pose = await this.state.objectDetect?.detect(
            this.video.current
          );

          if (pose && pose.length > 0) {
            for (let i = 0; i < pose.length; i++) {
              console.log(pose);
              this.ctx.strokeStyle = 'red';
              this.ctx.font = '50px serif';
              // this.ctx.fillText
              this.ctx.fillText(
                pose[i].class,
                pose[i].bbox[0],
                pose[i].bbox[1],
                pose[i].bbox[2]
              );
              this.ctx.strokeRect(
                pose[i].bbox[0],
                pose[i].bbox[1],
                pose[i].bbox[2],
                pose[i].bbox[3]
              );
            }
          }
        } catch {}
      }
    }

    // setTimeout(() => {
    //   this.animationFrame = requestAnimationFrame(this.runFrame);
    // }, 1000);
    if (this.state.animation)
      this.animationFrame = requestAnimationFrame(this.runFrame);
  }
  render() {
    return (
      <Row>
        <Col xs={12}>
          <Container>
            <Row>
              <Col xs="12">
                <Button
                  disabled={this.state.isLoaded}
                  onClick={this.connectCam}
                >
                  Bağlan
                </Button>
                <Button
                  disabled={!this.state.isLoaded}
                  onClick={this.disconnectCam}
                >
                  Sonlandır
                </Button>
                <Button
                  disabled={!this.state.isLoaded}
                  onClick={this.startStream}
                >
                  Görüntü
                </Button>
                {this.state.cameraItem?.isPtz ? (
                  <>
                    <Button
                      onClick={async (ev) => {
                        if (this.props.id) {
                          await CameraService.pos(
                            this.props.id,
                            this.state.velocity,
                            {
                              x: this.state.range.speed,
                              y: this.state.range.speed,
                              z: this.state.range.speed,
                            }
                          );
                        }
                      }}
                    >
                      Git
                    </Button>

                    <Button onClick={this.savePosition}>Pozisyon Kaydet</Button>
                  </>
                ) : null}
              </Col>
            </Row>
            {this.state.cameraItem?.isPtz ? (
              <>
                <Row>
                  <Col xs={12}>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <InputGroup>
                            <MinMaxValue
                              range={this.state.range}
                              onChangeValue={(val) => {
                                const { range } = this.state;
                                range[val.type] = val.value;
                                this.setState({ range });
                              }}
                            />
                          </InputGroup>
                        </Form.Label>
                      </Form.Group>
                    </Form>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Form>
                      <SlideValue
                        range={this.state.range}
                        type="x"
                        value={this.state.velocity?.x}
                        onChangeValue={(val) => {
                          const { velocity } = this.state;
                          if (velocity) {
                            velocity[val.type] = val.value;
                            this.setState({ velocity });
                          }
                        }}
                      />
                      <SlideValue
                        range={this.state.range}
                        type="y"
                        value={this.state.velocity?.y}
                        onChangeValue={(val) => {
                          const { velocity } = this.state;
                          if (velocity) {
                            velocity[val.type] = val.value;
                            this.setState({ velocity });
                          }
                        }}
                      />
                      <SlideValue
                        range={this.state.range}
                        type="z"
                        value={this.state.velocity?.z}
                        onChangeValue={(val) => {
                          const { velocity } = this.state;
                          if (velocity) {
                            velocity[val.type] = val.value;
                            this.setState({ velocity });
                          }
                        }}
                      />
                    </Form>
                  </Col>
                </Row>
              </>
            ) : null}
            <Row>
              <Col xs={12} style={{ position: 'relative' }}>
                {/* <video
                  style={{ width: '100%' }}
                  ref={this.video}
                  controls
                  autoPlay
                  muted
                  src={this.state.streamSource}
                ></video> */}
                {/* <ReactHlsPlayer
                  src="https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
                  autoPlay={false}
                  controls={true}
                  width="100%"
                  height="auto"
                /> */}
                <div
                  style={{
                    height: 0,
                    overflow: 'hidden',
                  }}
                >
                  <video
                    src={this.state.streamSource}
                    autoPlay
                    style={{ width: '100%' }}
                    ref={this.video}
                    onLoadedData={async () => {
                      if (this.canvasElement.current && this.video.current) {
                        this.canvasElement.current.width =
                          this.video.current.videoWidth;
                        this.canvasElement.current.height =
                          this.video.current.videoHeight;
                      }
                      setTimeout(async () => {
                        await this.runFrame();
                      }, 500);
                    }}
                  ></video>
                  {/* <Replay source={this.state.streamSource}></Replay> */}

                  {/* <Replay
                    source={this.state.streamSource}
                    options={{ controls: null }}
                    onStreamStateChange={(evt) => {
                      if (evt.playState == 'playing' && !this.animationFrame) {
                        console.log('runframe');
                        this.runFrame();
                      }
                    }}
                  >
                    <HlsjsVideoStreamer
                      ref={this.video}
                      onReady={(evt) => {
                        console.log(evt);
                      }}
                    />
                  </Replay> */}
                </div>
                <canvas
                  style={{ width: '100%' }}
                  ref={this.canvasElement}
                ></canvas>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
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
