import {
  Add,
  ArrowBack,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  Remove,
  Save,
  Settings,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import {
  Button,
  ButtonGroup,
  Container,
  Slider,
  SpeedDial,
  SpeedDialAction,
} from '@mui/material';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { CameraService } from '../../services/CameraService';

type Props = {
  camera?: Camera;
  onSetTolerance: (tolerance) => Promise<void>;
  onSavePosition: (position) => Promise<void>;
  onFocalChange: (val) => void;
};

type State = {
  velocity?: { x?: any; y?: any; z?: any };
  showMenu?: boolean;
  speed: number;
  step: number;
  decimal: number;
  ptzLimits: {
    x: { min: number; max: number };
    y: { min: number; max: number };
  };
  zoomLimits: { min: number; max: number };
  showSaveSettings: boolean;
  focal: { x: number; y: number; scale: number };
};

export default class CameraController extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.gotoPosition = this.gotoPosition.bind(this);

    this.state = {
      velocity: { x: 0, y: 1, z: 0 },
      showMenu: true,
      speed: 1,
      step: 0.1,
      decimal: 2,
      ptzLimits: { x: { min: -1, max: 1 }, y: { min: -1, max: 1 } },
      zoomLimits: { min: 0, max: 1 },
      showSaveSettings: false,
      focal: { x: 0.0, y: 0.0, scale: 1.0 },
    };
  }

  async gotoPosition(velocity) {
    if (velocity && this.props.camera?.id) {
      await CameraService.pos(this.props.camera?.id, velocity, {
        x: this.state.speed,
        y: this.state.speed,
        z: this.state.speed,
      });
      this.setState({ velocity });
    }
  }

  componentDidMount() {
    const ptzLimits =
      this.props.camera?.camInfo.defaultProfile.PTZConfiguration.PanTiltLimits;
    const zoomLimits =
      this.props.camera?.camInfo.defaultProfile.PTZConfiguration.ZoomLimits;

    const minX = parseFloat(ptzLimits?.Range.XRange.Min);
    const maxX = parseFloat(ptzLimits?.Range.XRange.Max);
    const minY = parseFloat(ptzLimits?.Range.YRange.Min);
    const maxY = parseFloat(ptzLimits?.Range.YRange.Max);
    const minZoom = parseFloat(zoomLimits?.Range.XRange.Min);
    const maxZoom = parseFloat(zoomLimits?.Range.XRange.Max);
    this.setState({
      ptzLimits: {
        x: {
          min: isNaN(minX) ? -1 : minX,
          max: isNaN(maxX) ? 1 : maxX,
        },
        y: {
          min: isNaN(minY) ? -1 : minY,
          max: isNaN(maxY) ? 1 : maxY,
        },
      },
      zoomLimits: {
        min: isNaN(minZoom) ? -1 : minZoom,
        max: isNaN(maxZoom) ? 1 : maxZoom,
      },
      velocity: this.props.camera?.position || { x: 0, y: 0, z: 0 },
    });
  }

  render() {
    return (
      <>
        {this.props.camera?.isPtz ? (
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
              icon={<ArrowUpward />}
              title={'Yukarı'}
              onClick={async () => {
                const { velocity } = this.state;
                if (velocity) {
                  let cuurentValue = 0;
                  try {
                    cuurentValue = parseFloat(velocity.y);
                  } catch {}
                  console.log(cuurentValue);
                  const movement = cuurentValue + this.state.step;

                  if (
                    movement <= this.state.ptzLimits.y.max &&
                    movement >= this.state.ptzLimits.y.min
                  ) {
                    velocity.y = movement.toFixed(this.state.decimal);
                    await this.gotoPosition(velocity);
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

                  const movement = cuurentValue - this.state.step;

                  if (
                    movement <= this.state.ptzLimits.y.max &&
                    movement >= this.state.ptzLimits.y.min
                  ) {
                    velocity.y = movement.toFixed(this.state.decimal);
                    await this.gotoPosition(velocity);
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

                  const movement = cuurentValue + this.state.step;

                  if (
                    movement <= this.state.ptzLimits.x.max &&
                    movement >= this.state.ptzLimits.x.min
                  ) {
                    velocity.x = movement.toFixed(this.state.decimal);
                    await this.gotoPosition(velocity);
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

                  const movement = cuurentValue - this.state.step;

                  if (
                    movement <= this.state.ptzLimits.x.max &&
                    movement >= this.state.ptzLimits.x.min
                  ) {
                    velocity.x = movement.toFixed(this.state.decimal);
                    await this.gotoPosition(velocity);
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

                  const movement = cuurentValue + this.state.step;

                  if (
                    movement <= this.state.zoomLimits.max &&
                    movement >= this.state.zoomLimits.min
                  ) {
                    velocity.z = movement.toFixed(this.state.decimal);
                    await this.gotoPosition(velocity);
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
                  let cuurentValue = 0;
                  try {
                    cuurentValue = parseFloat(velocity.z);
                  } catch {}

                  const movement = cuurentValue - this.state.step;

                  if (
                    movement <= this.state.zoomLimits.max &&
                    movement >= this.state.zoomLimits.min
                  ) {
                    velocity.z = movement.toFixed(this.state.decimal);
                    await this.gotoPosition(velocity);
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
                    step: parseFloat(mevement.toFixed(this.state.decimal)),
                  });
                }
              }}
            />
            <SpeedDialAction
              icon={<Add />}
              title={'Hızlan'}
              onClick={async () => {
                const { step } = this.state;
                const mevement = step + 0.01;

                if (mevement <= 1 && mevement >= 0) {
                  this.setState({
                    step: parseFloat(mevement.toFixed(this.state.decimal)),
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
              icon={<ZoomIn />}
              title={'Yaklaş'}
              onClick={async () => {
                const { velocity } = this.state;
                if (velocity) {
                  let cuurentValue = 0;
                  try {
                    cuurentValue = parseFloat(velocity.z);
                  } catch {}

                  const movement = cuurentValue + this.state.step;

                  if (
                    movement <= this.state.zoomLimits.max &&
                    movement >= this.state.zoomLimits.min
                  ) {
                    velocity.z = movement.toFixed(this.state.decimal);
                    await this.gotoPosition(velocity);
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
                  let cuurentValue = 0;
                  try {
                    cuurentValue = parseFloat(velocity.z);
                  } catch {}

                  const movement = cuurentValue - this.state.step;

                  if (
                    movement <= this.state.zoomLimits.max &&
                    movement >= this.state.zoomLimits.min
                  ) {
                    velocity.z = movement.toFixed(this.state.decimal);
                    await this.gotoPosition(velocity);
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
                    step: parseFloat(mevement.toFixed(this.state.decimal)),
                  });
                }
              }}
            />
            <SpeedDialAction
              icon={<Add />}
              title={'Hızlan'}
              onClick={async () => {
                const { step } = this.state;
                const mevement = step + 0.01;

                if (mevement <= 1 && mevement >= 0) {
                  this.setState({
                    step: parseFloat(mevement.toFixed(this.state.decimal)),
                  });
                }
              }}
            />
          </SpeedDial>
        )}
        <div
          style={
            {
              // display: this.state.showSaveSettings ? 'block' : 'none',
            }
          }
        >
          <ButtonGroup
            variant="contained"
            aria-label="outlined primary button group"
          >
            <Button
              onClick={async () => {
                this.props.camera?.position;
                if (this.props.onSavePosition) {
                  await this.props.onSavePosition(this.state.velocity);
                }
              }}
            >
              <Save />
              Orgin
            </Button>
            <Button
              onClick={async () => {
                // if (this.props.camera) {
                //   let tolerance = this.props.camera.tolerance;
                //   if (!tolerance) {
                //     tolerance = {
                //       x: { max: 0, min: 0 },
                //       y: { max: 0, min: 0 },
                //     };
                //   }
                //   tolerance.x.min = this.state.velocity?.x;
                //   tolerance.y.min = this.state.velocity?.y;
                //   if (this.props.onSetTolerance) {
                //     await this.props.onSetTolerance(tolerance);
                //   }
                // }
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
                // if (this.props.camera) {
                //   let tolerance = this.props.camera.tolerance;
                //   if (!tolerance) {
                //     tolerance = {
                //       x: { max: 0, min: 0 },
                //       y: { max: 0, min: 0 },
                //     };
                //   }

                //   tolerance.x.max = this.state.velocity?.x;
                //   tolerance.y.max = this.state.velocity?.y;
                //   if (this.props.onSetTolerance) {
                //     await this.props.onSetTolerance(tolerance);
                //   }
                // }
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
            <div>
              X:{this.state.velocity?.x} Y:{this.state.velocity?.y} Z:
              {this.state.velocity?.z} Step:{this.state.step}
            </div>
            <div>
              <Slider
                size="small"
                defaultValue={0.0}
                max={2.0}
                min={-2.0}
                step={0.05}
                aria-label="Small"
                valueLabelDisplay="auto"
                onChange={(ev, val) => {
                  const { focal } = this.state;
                  focal.x = val as number;
                  this.setState({ focal });
                  if (this.props.onFocalChange) {
                    this.props.onFocalChange(focal);
                  }
                }}
              />
            </div>
            <div>
              <Slider
                size="small"
                defaultValue={0.0}
                max={2.0}
                min={-2.0}
                step={0.05}
                aria-label="Small"
                valueLabelDisplay="auto"
                onChange={(ev, val) => {
                  const { focal } = this.state;
                  focal.y = val as number;
                  this.setState({ focal });
                  if (this.props.onFocalChange) {
                    this.props.onFocalChange(focal);
                  }
                }}
              />
            </div>
            <div>
              <Slider
                size="small"
                defaultValue={1.0}
                max={2.0}
                min={0.0}
                step={0.05}
                aria-label="Small"
                valueLabelDisplay="auto"
                onChange={(ev, val) => {
                  const { focal } = this.state;
                  focal.scale = val as number;
                  this.setState({ focal });
                  if (this.props.onFocalChange) {
                    this.props.onFocalChange(focal);
                  }
                }}
              />
            </div>
          </Container>
        </div>
      </>
    );
  }
}
