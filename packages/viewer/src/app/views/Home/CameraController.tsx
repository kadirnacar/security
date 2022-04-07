import {
  Add,
  ArrowBack,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  AspectRatio,
  PanoramaHorizontal,
  PanoramaVertical,
  Remove,
  Settings,
  Visibility,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import {
  Slider,
  SliderValueLabel,
  SpeedDial,
  SpeedDialAction,
} from '@mui/material';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { CameraService } from '../../services/CameraService';

type Props = {
  camera?: Camera;
  showPanorama?: boolean;
  panorama?: any;
  onSetTolerance?: (tolerance) => Promise<void>;
  onSavePosition?: (position) => Promise<void>;
  onFocalChange?: (val) => void;
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
    console.log(this.props.camera?.position);
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
      focal: this.props.panorama || { x: 0.0, y: 0.0, scale: 1.0 },
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
              title={`Y: ${this.state.velocity?.y}`}
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
            />

            <SpeedDialAction
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
                  }
                }
              }}
            />
            <SpeedDialAction
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
                  }
                }
              }}
            />
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
            {/* <SpeedDialAction
              icon={<Settings />}
              title={'Kaydet'}
              onClick={async () => {
                const { step } = this.state;
                this.setState({
                  showSaveSettings: !this.state.showSaveSettings,
                });
              }}
            /> */}
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
        {this.props.showPanorama ? (
          <SpeedDial
            style={{
              position: 'absolute',
              zIndex: 9999,
              right: 20,
              bottom: 120,
            }}
            ariaLabel="Optik"
            open={true}
            // open={this.state.showMenu || false}

            icon={<Visibility />}
            onClose={() => {
              this.setState({ showMenu: false });
            }}
            onOpen={() => {
              this.setState({ showMenu: true });
            }}
            direction={'up'}
          >
            <SpeedDialAction
              icon={<PanoramaHorizontal />}
              style={{ margin: '12px 0px' }}
              tooltipTitle={
                <Slider
                  style={{ width: 200 }}
                  size="small"
                  value={this.state.focal.x}
                  max={2.0}
                  min={-2.0}
                  step={0.01}
                  valueLabelDisplay="on"
                  onChange={(ev, val) => {
                    const { focal } = this.state;
                    focal.x = val as number;
                    this.setState({ focal });
                    if (this.props.onFocalChange) {
                      this.props.onFocalChange(focal);
                    }
                  }}
                />
              }
              tooltipOpen={true}
              open={true}
              onClick={async () => {}}
            />
            <SpeedDialAction
              icon={<PanoramaVertical />}
              style={{ margin: '12px 0px' }}
              tooltipTitle={
                <Slider
                  style={{ width: 200 }}
                  size="small"
                  value={this.state.focal.y}
                  max={2.0}
                  min={-2.0}
                  step={0.01}
                  valueLabelDisplay="on"
                  onChange={(ev, val) => {
                    const { focal } = this.state;
                    focal.y = val as number;
                    this.setState({ focal });
                    if (this.props.onFocalChange) {
                      this.props.onFocalChange(focal);
                    }
                  }}
                />
              }
              tooltipOpen={true}
              open={true}
              onClick={async () => {}}
            />
            <SpeedDialAction
              icon={<AspectRatio />}
              style={{ margin: '12px 0px' }}
              tooltipTitle={
                <Slider
                  style={{ width: 200 }}
                  size="small"
                  value={this.state.focal.scale}
                  max={2.0}
                  min={0.0}
                  step={0.01}
                  valueLabelDisplay="on"
                  onChange={(ev, val) => {
                    const { focal } = this.state;
                    focal.scale = val as number;
                    this.setState({ focal });
                    if (this.props.onFocalChange) {
                      this.props.onFocalChange(focal);
                    }
                  }}
                />
              }
              tooltipOpen={true}
              open={true}
              onClick={async () => {}}
            />
          </SpeedDial>
        ) : null}
      </>
    );
  }
}
