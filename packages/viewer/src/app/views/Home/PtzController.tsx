import {
  Add,
  ArrowBack,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  Remove,
  Settings,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { ICamPosition, ILimit, IPtzLimit } from '../../models/IGlRect';
import { CameraService } from '../../services/CameraService';

type Props = {
  camera?: Camera;
};

type State = {
  velocity?: ICamPosition;
  speed: number;
  step: number;
  decimal: number;
  ptzLimits: IPtzLimit;
  zoomLimits: ILimit;
};

export default class PtzController extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.gotoPosition = this.gotoPosition.bind(this);

    this.state = {
      velocity: { x: 0, y: 1, z: 0 },
      speed: 1,
      step: 0.1,
      decimal: 2,
      ptzLimits: { x: { min: -1, max: 1 }, y: { min: -1, max: 1 } },
      zoomLimits: { min: 0, max: 1 },
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
        <SpeedDial
          style={{
            position: 'absolute',
            zIndex: 9999,
            right: 20,
            bottom: 50,
          }}
          ariaLabel="Ayarlar"
          open={true}
          icon={<Settings />}
          direction={'left'}
        >
          <SpeedDialAction
            icon={<ZoomIn />}
            title={`Z: ${this.state.velocity?.z}`}
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
            title={`Z: ${this.state.velocity?.z}`}
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
          {this.props.camera?.isPtz
            ? [
                <SpeedDialAction
                  key={0}
                  icon={<ArrowDownward />}
                  title={`Y: ${this.state.velocity?.y}`}
                  onClick={async () => {
                    const { velocity } = this.state;
                    if (velocity) {
                      let cuurentValue = 0;
                      try {
                        cuurentValue = parseFloat(velocity.y);
                      } catch {}
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
                />,
                <SpeedDialAction
                  key={1}
                  icon={<ArrowUpward />}
                  title={`Y: ${this.state.velocity?.y}`}
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
                />,

                <SpeedDialAction
                  key={2}
                  icon={<ArrowForward />}
                  title={`X: ${this.state.velocity?.x}`}
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
                      } else {
                        velocity.x = (
                          this.state.ptzLimits.x.min +
                          (Math.abs(movement) -
                            Math.abs(this.state.ptzLimits.x.max))
                        ).toFixed(this.state.decimal);
                        await this.gotoPosition(velocity);
                      }
                    }
                  }}
                />,
                <SpeedDialAction
                  key={3}
                  icon={<ArrowBack />}
                  title={`X: ${this.state.velocity?.x}`}
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
                      } else {
                        velocity.x = (
                          this.state.ptzLimits.x.max -
                          (Math.abs(movement) -
                            Math.abs(this.state.ptzLimits.x.min))
                        ).toFixed(this.state.decimal);
                        await this.gotoPosition(velocity);
                      }
                    }
                  }}
                />,
              ]
            : null}
          <SpeedDialAction
            icon={<Remove />}
            title={`S: ${this.state.step}`}
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
            title={`S: ${this.state.step}`}
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
      </>
    );
  }
}
