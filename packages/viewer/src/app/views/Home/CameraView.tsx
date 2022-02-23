import { CircularProgress, IconButton } from '@material-ui/core';
import {
  ArrowBack,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  PlayCircleFilled,
  ZoomIn,
  ZoomOut,
  DirectionsWalk,
  Settings,
} from '@material-ui/icons';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import { Camera } from '@security/models';
import * as bodyDetection from '@tensorflow-models/body-pix';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import * as tf from '@tensorflow/tfjs-core';
import React, { Component } from 'react';
import 'vimond-replay/index.css';
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
    };
  }

  animationFrame?: number;
  video: React.RefObject<any>;
  canvas: React.RefObject<any>;

  async componentDidMount() {
    await tf.setBackend('wasm');

    if (this.props['camera'].id) {
      await CameraService.connect(this.props['camera'].id);
    }

    const videoElement: HTMLVideoElement = this.video?.current;

    const bodyFix = await bodyDetection.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2,
    });

    this.setState({
      bodyDetect: bodyFix,
      loaded: true,
      velocity: this.props['camera']?.position || this.state.velocity,
      // streamSource: `http://${location.host}/api/camera/pipe/${this.props.camera.id}`,
    });
  }

  async runFrame() {
    const videoElement: HTMLVideoElement = this.video?.current;
    if (videoElement) {
      if (this.state.bodyDetect) {
        try {
          const pose = await this.state.bodyDetect.segmentPerson(videoElement, {
            flipHorizontal: false,
            internalResolution: 'low',
            segmentationThreshold: 0.7,
          });
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
        } catch {}
      }
    }
    this.animationFrame = requestAnimationFrame(this.runFrame);
  }

  render() {
    const speed = 0.8;
    const step = 0.1;

    return this.state.loaded ? (
      <>
        {!this.state.playing ? (
          <div style={{ width: '100%', height: '100%', display: 'flex' }}>
            <IconButton
              style={{ margin: 'auto' }}
              title="Kapat"
              onClick={() => {
                this.setState({
                  playing: true,
                  streamSource: `http://${location.host}/api/camera/pipe/${this.props['camera'].id}`,
                });
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
                visibility: this.state.mode == 'video' ? 'hidden' : 'visible',
                display: this.state.mode == 'video' ? 'none' : 'block',
              }}
            ></canvas>
            <video
              src={this.state.streamSource}
              autoPlay
              controls={false}
              style={{
                width: '100%',
                visibility: this.state.mode == 'canvas' ? 'hidden' : 'visible',
              }}
              ref={this.video}
              onLoadedData={async () => {
                try {
                  this.canvas.current.width = this.video.current.videoWidth;
                  this.canvas.current.height = this.video.current.videoHeight;
                } catch {}
                if (!this.animationFrame) await this.runFrame();
              }}
              onPause={() => {
                this.setState({
                  playing: false,
                  streamSource: '',
                });
              }}
              onError={() => {
                this.setState({
                  playing: false,
                  streamSource: '',
                });
              }}
            ></video>
            {this.props['camera'].isPtz ? (
              <SpeedDial
                style={{
                  position: 'absolute',
                  zIndex: 9999,
                  right: 20,
                  top: 50,
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
                direction={'down'}
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
                      let cuurentValue = 0;
                      try {
                        cuurentValue = parseFloat(velocity.z);
                      } catch {}
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
                  top: 50,
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
                direction={'down'}
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
