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
} from '@mui/material';
import { Camera, Settings as SettingsModel } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { CameraService } from '../../services/CameraService';
import { ApplicationState } from '../../store';
import REGL from 'regl';

let vert = `
precision mediump float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = vec2((1.0 - position.x), position.y);
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }
`;

let fragSingle = `
precision mediump float;
uniform sampler2D uSampler;
varying vec2 uv;
uniform vec3 zoom;
uniform vec3 uLensS;
uniform vec2 uLensF;


vec2 GLCoord2TextureCoord(vec2 glCoord) {
	return glCoord  * vec2(1.0, -1.0)/ 2.0 + vec2(0.5, 0.5);
}

void main() {
  float scale = uLensS.z;
	vec2 vPos = vec2(uv.x * 2.0 - 1.0, (1.0 - uv.y * 2.0));
	float Fx = uLensF.x;
	float Fy = uLensF.y;

	vec2 vMapping = vPos.xy;
	vMapping.x = vMapping.x + ((pow(vPos.y, 2.0)/scale)*vPos.x/scale)*-Fx;
	vMapping.y = vMapping.y + ((pow(vPos.x, 2.0)/scale)*vPos.y/scale)*-Fy;
	vMapping = vMapping * uLensS.xy;

	vMapping = GLCoord2TextureCoord(vMapping/scale);

  vec4 MonA = texture2D(uSampler, vMapping);
  gl_FragColor = MonA;
}
`;
interface State {
  streamSource: string;
  animation?: boolean;
  loaded: boolean;
  playing: boolean;
  showMenu?: boolean;
  velocity?: { x?: any; y?: any; z?: any };
  mode: 'canvas' | 'video';
  speed: number;
  step: number;
  decimal: number;
  showSaveSettings: boolean;
}

type Props = {
  camera?: Camera;
  showSettings?: boolean;
  settings: SettingsModel;
  DataActions?: DataActions<Camera>;
  Data?: DataState;
  boxesView?: any;
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
    this.gotoPosition = this.gotoPosition.bind(this);

    this.boxes = [];
    this.state = {
      streamSource: '',
      loaded: false,
      playing: false,
      velocity: { x: 0, y: 1, z: 0 },
      mode: 'video',
      speed: 1,
      step: 0.1,
      decimal: 2,
      showSaveSettings: false,
    };
  }

  regl?: REGL.Regl;
  animationFrame?: number;
  animationFrameTensor?: number;
  video: React.RefObject<any>;
  canvas: React.RefObject<any>;
  pc?: RTCPeerConnection;
  boxes: { x1: number; x2: number; y1: number; y2: number; score: number }[];

  async componentWillUnmount() {
    if (this.pc) {
      this.pc.close();
    }
    this.isStop = true;
    this.setState({ playing: false });

    if (window['anime']) {
      try {
        window['anime'].cancel();
      } catch (ex: any) {
        console.warn(`Prevented unhandled exception: ${ex?.message}`);
      }
    }
    await CameraService.disconnect(this.props.camera?.id || '');
  }

  async gotoPosition(velocity) {
    if (velocity && this.props['camera']?.id) {
      await CameraService.pos(this.props['camera']?.id, velocity, {
        x: this.state.speed,
        y: this.state.speed,
        z: this.state.speed,
      });
    }
  }

  async componentDidMount() {
    if (this.props.camera?.id) {
      await CameraService.connect(this.props.camera?.id);
    }
    this.animationFrame = undefined;
    this.animationFrameTensor = undefined;

    this.speed = this.props.settings.framePerSecond || 0.5;
    this.setState(
      {
        loaded: true,
        velocity: this.props['camera']?.position || this.state.velocity,
      },
      async () => {
        await this.gotoPosition(this.state.velocity);
      }
    );
  }

  last = 0;
  num = 0;
  speed = 0.5;
  isStop = false;
  isTravel = false;

  render() {
    return this.state.loaded ? (
      <>
        {!this.state.playing ? (
          <div style={{ width: '100%', height: '100%', display: 'flex' }}>
            <IconButton
              style={{ margin: 'auto' }}
              title="Kapat"
              onClick={async () => {
                this.setState(
                  {
                    playing: true,
                  },
                  () => {
                    this.pc = new RTCPeerConnection({});

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
              }}
            ></canvas>
            <div style={{ height: 500 }}>
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
                      const mevement = step - 0.01;

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
                      const mevement = step + 0.01;

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
                onPlayCapture={(ev) => {
                  let gl = this.canvas.current.getContext('webgl2');
                  this.regl = REGL(gl);
                  let pos = [-1, -1, 1, -1, -1, 1, 1, 1, -1, 1, 1, -1];
                  let texture: REGL.Texture2D;
                  
                  let lens = {
                    a: 1.0,
                    b: 1.0,
                    Fx: 0.0,
                    Fy: !this.props.camera?.isPtz ? 0.4 : 0.0,
                    scale: 1.0,
                  };

                  const drawFrame = this.regl({
                    frag: fragSingle,
                    vert: vert,
                    attributes: {
                      position: pos,
                    },
                    uniforms: {
                      uSampler: (ctx, { videoT1 }: any) => {
                        return videoT1;
                      },
                      uLensS: () => {
                        return [lens.a, lens.b, lens.scale];
                      },
                      uLensF: () => {
                        return [lens.Fx, lens.Fy];
                      },
                      zoom: () => {
                        return [1.0, 0.0, 0.0];
                      },
                    },
                    count: pos.length / 2,
                  });

                  if (this.regl) {
                    texture = this.regl.texture(this.video.current);
                    window['anime'] = this.regl.frame(() => {
                      try {
                        if (
                          this.video.current &&
                          this.video.current.videoWidth > 32 &&
                          this.video.current.currentTime > 0 &&
                          !this.video.current.paused &&
                          !this.video.current.ended &&
                          this.video.current.readyState > 2
                        ) {
                          try {
                            texture = texture.subimage(this.video.current);
                          } catch {}
                        } else if (!texture && this.regl) {
                          texture = this.regl.texture();
                        }
                      } catch (ex) {
                        if (this.regl) texture = this.regl.texture();
                        console.warn(ex);
                      }

                      try {
                        if (this.regl)
                          drawFrame({
                            videoT1: texture,
                          });
                      } catch {
                        if (window['anime']) {
                          try {
                            window['anime'].cancel();
                          } catch (ex: any) {
                            console.warn(
                              `Prevented unhandled exception: ${ex?.message}`
                            );
                          }
                        }
                      }
                    });
                  }
                }}
                onLoadedData={async () => {
                  try {
                    this.canvas.current.width = this.video.current.videoWidth;
                    this.canvas.current.height = this.video.current.videoHeight;
                  } catch {}
                  // if (!this.animationFrame) this.runFrame(0);

                  if (this.props.settings.type == 'server') {
                    // this.getTensorServer(0);
                  } else {
                    // this.getTensor(0);
                  }
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
