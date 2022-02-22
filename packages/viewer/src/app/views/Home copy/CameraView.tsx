import { Camera } from '@security/models';
import * as bodyDetection from '@tensorflow-models/body-pix';
import * as objectDetection from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-cpu';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import React, { Component } from 'react';
import { Button, Col, Container, Form, InputGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Replay } from 'vimond-replay';
import 'vimond-replay/index.css';
import BasicVideoStreamer from 'vimond-replay/video-streamer/basic';
import { DataActions } from '../../reducers/Data/actions';
import { CameraService } from '../../services/CameraService';
import { ApplicationState } from '../../store';
import MinMaxValue from './MinMaxVale';
import SlideValue from './SlideValue';

interface Props {
  DataActions?: DataActions<Camera>;
  id?: string;
}
tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`
);
interface State {
  range: { min: any; max: any; step: any; speed: any };
  velocity?: { x?: any; y?: any; z?: any };
  action?: 'home';
  streamSource?: any;
  isLoaded?: boolean;
  cameraItem?: Camera;
  objectDetect?: objectDetection.ObjectDetection;
  bodyDetect?: bodyDetection.BodyPix;
  animation?: boolean;
  detectType: 'object' | 'body';
}

export class CameraView extends Component<Props & ApplicationState, State> {
  constructor(props) {
    super(props);
    this.startStream = this.startStream.bind(this);
    this.savePosition = this.savePosition.bind(this);
    this.connectCam = this.connectCam.bind(this);
    this.disconnectCam = this.disconnectCam.bind(this);
    this.runFrame = this.runFrame.bind(this);
    this.video = React.createRef<any>();
    this.canvas = React.createRef<HTMLCanvasElement>();
    this.canvasElement = React.createRef<HTMLCanvasElement>();
    this.infoDiv = React.createRef<HTMLDivElement>();

    // tfjsWasm.setWasmPaths('assets/wasm/');

    this.state = {
      range: { min: -1, max: 1, step: 0.1, speed: 0.8 },
      velocity: { x: 0, y: 1, z: 0 },
      action: undefined,
      cameraItem: undefined,
      objectDetect: undefined,
      animation: true,
      detectType: 'body',
    };
  }

  video: React.RefObject<any>;
  canvas: React.RefObject<HTMLCanvasElement>;
  socket?: WebSocket;
  ctx?: CanvasRenderingContext2D;
  canvasElement: React.RefObject<HTMLCanvasElement>;
  animationFrame?: number;
  infoDiv?: React.RefObject<HTMLDivElement>;

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
    await tf.setBackend('wasm');

    const videoElement: HTMLVideoElement =
      this.video.current?.videoRef?.current;
    if (this.props.id && videoElement) {
      await this.props.DataActions?.getById('Camera', this.props.id);
      if (this.props.Data.Camera.CurrentItem?.position) {
        this.setState({
          velocity: this.props.Data.Camera.CurrentItem.position,
        });
      }
      if (this.canvasElement.current) {
        const rect = videoElement.getBoundingClientRect();
        this.canvasElement.current.width = rect.width;
        this.canvasElement.current.height = rect.height;
        const ct = this.canvasElement.current.getContext('2d');
        if (ct) {
          this.ctx = ct;
          this.ctx.fillStyle = 'white';
          this.ctx.fillRect(0, 0, rect.width, rect.height);
        }
      }
      const bodyFix = await bodyDetection.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2,
      });
      // const objectDetect = await objectDetection.load({
      //   modelUrl: 'assets/models/lite_mobilenet_v2/model.json',
      // });
      this.setState({
        isLoaded: false,
        cameraItem: this.props.Data.Camera.CurrentItem,
        // objectDetect,
        bodyDetect: bodyFix,
      });
    }
  }

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
    const videoElement: HTMLVideoElement =
      this.video.current?.videoRef?.current;
    if (this.infoDiv?.current) {
      this.infoDiv.current.innerText = new Date().toString();
    }
    if (this.ctx && videoElement && this.canvasElement.current) {
      // const pose = await this.state.objectDetect?.detect(videoElement);

      const rect = videoElement.getBoundingClientRect();
      if (this.ctx) {
        this.ctx.clearRect(
          0,
          0,
          videoElement.videoWidth,
          videoElement.videoHeight
        );
        this.ctx.drawImage(
          videoElement,
          0,
          0,
          videoElement.videoWidth,
          videoElement.videoHeight
        );
      }

      if (this.state.detectType == 'object') {
        this.state.objectDetect
          ?.detect(this.canvasElement.current)
          .then((pose) => {
            const rect = videoElement.getBoundingClientRect();
            if (this.ctx) {
              if (this.canvasElement.current) {
                this.canvasElement.current.width = rect.width;
                this.canvasElement.current.height = rect.height;
              }

              this.ctx.clearRect(0, 0, rect.width, rect.height);
              this.ctx.drawImage(videoElement, 0, 0, rect.width, rect.height);

              if (pose && pose.length > 0) {
                for (let i = 0; i < pose.length; i++) {
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
            }
          });
      }
      if (this.state.detectType == 'body' && this.state.bodyDetect) {
        try {
          const pose = await this.state.bodyDetect.segmentPerson(videoElement, {
            flipHorizontal: false,
            internalResolution: 'low',
            segmentationThreshold: 0.7,
          });
          const seg = bodyDetection.toMask(pose);
          if (seg) {
            const maskBlurAmount = 0;
            bodyDetection.drawMask(
              this.canvasElement.current,
              videoElement,
              seg,
              0.7,
              maskBlurAmount,
              false
            );
          }
          // console.log(console.log(seg));
          // if (pose && pose.allPoses.length > 0) {
          //   for (let index = 0; index < pose.allPoses.length; index++) {
          //     const element = pose.allPoses[index];
          //     const xSort = element.keypoints.sort((a, b) => {
          //       if (a.position.x > b.position.x) {
          //         return 1;
          //       } else if (a.position.x < b.position.x) {
          //         return -1;
          //       } else {
          //         return 0;
          //       }
          //     });

          //     const minX = xSort[0].position.x;
          //     const maxX = xSort[xSort.length - 1].position.x;

          //     const ySort = element.keypoints.sort((a, b) => {
          //       if (a.position.y > b.position.y) {
          //         return 1;
          //       } else if (a.position.y < b.position.y) {
          //         return -1;
          //       } else {
          //         return 0;
          //       }
          //     });

          //     const minY = ySort[0].position.y;
          //     const maxY = ySort[ySort.length - 1].position.y;
          //     this.ctx.strokeStyle = 'red';
          //     this.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
          //   }
          // }
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
              <Col xs={12} style={{ position: 'relative' }}>
                <div ref={this.infoDiv} style={{ textAlign: 'right' }}></div>

                <div
                  style={{
                    overflow: 'hidden',
                    height: '0px',
                  }}
                >
                  <Replay
                    source={this.state.streamSource}
                    initialPlaybackProps={{ bitrateCap: 0 }}
                    options={{
                      controls: null,
                      videoStreamer: { liveEdgeMargin: 0 },
                    }}
                    onStreamStateChange={(evt) => {
                      if (evt.playState == 'playing' && !this.animationFrame) {
                        const videoElement: HTMLVideoElement =
                          this.video.current?.videoRef?.current;

                        if (this.canvasElement.current && videoElement) {
                          this.canvasElement.current.width =
                            videoElement.videoWidth;
                          this.canvasElement.current.height =
                            videoElement.videoHeight;
                        }
                        this.runFrame();
                      }
                    }}
                  >
                    <BasicVideoStreamer ref={this.video}></BasicVideoStreamer>
                    {/* <HlsjsVideoStreamer
                      ref={this.video}
                      onReady={(evt) => {
                        console.log(evt);
                      }}
                    /> */}
                  </Replay>
                </div>
                <canvas
                  style={{ width: '100%' }}
                  ref={this.canvasElement}
                ></canvas>
              </Col>
            </Row>
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
