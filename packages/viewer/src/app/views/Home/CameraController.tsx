import {
  Add,
  ArrowBack,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  DirectionsWalk,
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
};

type State = {
  velocity?: { x?: any; y?: any; z?: any };
  showMenu?: boolean;
  speed: number;
  step: number;
  decimal: number;
  showSaveSettings: boolean;
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
      showSaveSettings: false,
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

                  const movement = cuurentValue + this.state.step;

                  if (movement <= 1 && movement >= -1) {
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

                  const mevement = cuurentValue - this.state.step;

                  if (mevement >= -1 && mevement <= 1) {
                    velocity.y = mevement.toFixed(this.state.decimal);
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

                  const mevement = cuurentValue + this.state.step;

                  if (mevement >= -1 && mevement <= 1) {
                    velocity.x = mevement.toFixed(this.state.decimal);
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

                  const mevement = cuurentValue - this.state.step;

                  if (mevement <= 1 && mevement >= -1) {
                    velocity.x = mevement.toFixed(this.state.decimal);
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

                  const mevement = cuurentValue + this.state.step;

                  if (mevement <= 1 && mevement >= 0) {
                    velocity.z = mevement.toFixed(this.state.decimal);
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

                  const mevement = cuurentValue - this.state.step;

                  if (mevement >= 0 && mevement <= 1) {
                    velocity.z = mevement.toFixed(this.state.decimal);
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

                  const mevement = cuurentValue + this.state.step;

                  if (mevement <= 1 && mevement >= 0) {
                    velocity.z = mevement.toFixed(this.state.decimal);
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

                  const mevement = cuurentValue - this.state.step;

                  if (mevement >= 0 && mevement <= 1) {
                    velocity.z = mevement.toFixed(this.state.decimal);
                    await this.gotoPosition(velocity);
                  }
                }
              }}
            />
          </SpeedDial>
        )}
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
                  if (this.props.onSetTolerance) {
                    await this.props.onSetTolerance(tolerance);
                  }
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
                  if (this.props.onSetTolerance) {
                    await this.props.onSetTolerance(tolerance);
                  }
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
    );
  }
}
