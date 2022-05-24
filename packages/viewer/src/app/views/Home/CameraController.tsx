import {
  AutoAwesomeMotion,
  BorderOuter,
  PhotoCamera,
  Visibility,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Slider,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { ICamPosition, IRectLimits } from '@security/models';
import React, { Component } from 'react';
import { CamContext } from '../../utils';

type Props = {
  selectedBoxIndex?: number;
  onClickImage?: (item, index) => void;
};

type State = {
  focal: ICamPosition;
  activeTab: number;
  activePosition: any;
  autoPhoto: {
    interval: number;
    xStep: number;
    yStep: number;
  };
};

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index?: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const tabStyle = {
    position: 'absolute',
    width: '100%',
    top: 50,
    bottom: 0,
  };
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ position: 'absolute', width: '100%', top: 50, bottom: 0 }}
      {...other}
    >
      {value === index && (
        <Box
          sx={{ p: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

export default class CameraController extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.recursiveParentTakePhoto = this.recursiveParentTakePhoto.bind(this);
    this.handleSetPosition = this.handleSetPosition.bind(this);
    this.recursiveParentTakePhoto = this.recursiveParentTakePhoto.bind(this);

    this.state = {
      focal: { x: 0.0, y: 0.0, z: 1.0 },
      activeTab: 0,
      activePosition: null,
      autoPhoto: { interval: 3000, xStep: 0.1, yStep: 0.1 },
    };
  }
  static contextType = CamContext;
  context!: React.ContextType<typeof CamContext>;

  componentDidMount() {
    this.setState({
      focal: this.context.camera?.panorama || { x: 0.0, y: 0.0, z: 1.0 },
    });
  }

  componentDidUpdate() {
    this.context.onDrawEnd = async (box) => {
      if (this.state.activePosition) {
        if (this.context.parent) {
          this.context.parent.limitPosition = this.state.activePosition;

          if (
            this.state.activePosition &&
            this.context.parent.camera &&
            this.context.camera &&
            this.context.camera.id &&
            this.context.parent.camera.cameras[this.context.camera.id]
          ) {
            let d: IRectLimits | undefined =
              this.context.parent.camera.cameras[this.context.camera.id].limits;

            if (d) {
              if (!d[this.state.activePosition]) {
                d[this.state.activePosition] = {};
              }
              d[this.state.activePosition].coord = { x: box.x, y: box.y };
            }
            this.context.parent.camera.cameras[this.context.camera.id].limits =
              d;
            this.context.parent.render({});
          }
        }
      }
    };
  }

  recursiveInterval;

  getFloat(value) {
    let cuurentValue: number = 0;
    try {
      cuurentValue = parseFloat(value);
    } catch {}
    return isNaN(cuurentValue) ? 0 : cuurentValue;
  }

  getBetween(val, min, max) {
    if (val <= max && val >= min) {
      return val;
    } else {
      return min + (Math.abs(val) - Math.abs(max));
    }
  }

  calculateDiff(left, right, min, max) {
    const leftValue = this.getBetween(left, min, max);
    const rightValue = this.getBetween(right, min, max);
    if (rightValue < 0 && leftValue >= 0) {
      return max - leftValue - (min - rightValue);
    } else {
      return rightValue - leftValue;
    }
  }

  async recursiveParentTakePhoto() {
    const { autoPhoto } = this.state;

    if (!this.recursiveInterval) {
      let rangeLimits: IRectLimits | undefined;
      let location: ICamPosition = { x: 0, y: 0, z: 0 };
      if (
        this.context.parent?.camera &&
        this.context.camera &&
        this.context.camera.id &&
        this.context.parent.camera.cameras[this.context.camera.id] &&
        this.context.parent.camera.cameras[this.context.camera.id].limits
      ) {
        this.context.parent.camera.cameras[this.context.camera?.id].boxes = [];

        rangeLimits =
          this.context.parent.camera.cameras[this.context.camera.id].limits;

        const ptzLimitsXml =
          this.context.parent.camera?.camInfo.defaultProfile.PTZConfiguration
            .PanTiltLimits;
        const zoomLimitsXml =
          this.context.parent.camera?.camInfo.defaultProfile.PTZConfiguration
            .ZoomLimits;

        const minX = parseFloat(ptzLimitsXml?.Range.XRange.Min);
        const maxX = parseFloat(ptzLimitsXml?.Range.XRange.Max);
        const minY = parseFloat(ptzLimitsXml?.Range.YRange.Min);
        const maxY = parseFloat(ptzLimitsXml?.Range.YRange.Max);
        const minZoom = parseFloat(zoomLimitsXml?.Range.XRange.Min);
        const maxZoom = parseFloat(zoomLimitsXml?.Range.XRange.Max);

        const ptzLimits = {
          x: {
            min: isNaN(minX) ? -1 : minX,
            max: isNaN(maxX) ? 1 : maxX,
          },
          y: {
            min: isNaN(minY) ? -1 : minY,
            max: isNaN(maxY) ? 1 : maxY,
          },
        };
        const zoomLimits = {
          min: isNaN(minZoom) ? 0 : minZoom,
          max: isNaN(maxZoom) ? 1 : maxZoom,
        };

        if (rangeLimits) {
          location = {
            x: rangeLimits.leftTop.pos.x,
            y: rangeLimits.leftTop.pos.y,
            z: rangeLimits.leftTop.pos.z,
          };
        }

        let minLeft = this.getFloat(rangeLimits?.leftTop.pos.x);
        let minLeftCoord = this.getFloat(rangeLimits?.leftTop.coord.x);
        let maxRight = this.getFloat(rangeLimits?.rightBottom.pos.x);
        let maxRightCoord = this.getFloat(rangeLimits?.rightBottom.coord.x);
        let xLength = this.calculateDiff(
          minLeft,
          maxRight,
          ptzLimits.x.min,
          ptzLimits.x.max
        );
        let coordXLength = maxRightCoord - minLeftCoord;

        let minTop = this.getFloat(rangeLimits?.leftTop.pos.y);
        let minTopCoord = this.getFloat(rangeLimits?.leftTop.coord.y);
        let maxBottom = this.getFloat(rangeLimits?.rightBottom.pos.y);
        let maxBottomCoord = this.getFloat(rangeLimits?.rightBottom.coord.y);
        let yLength = this.calculateDiff(
          minTop,
          maxBottom,
          ptzLimits.y.min,
          ptzLimits.y.max
        );
        let coordYLength = maxBottomCoord - minTopCoord;

        if (this.context.parent?.camOptions.gotoPosition) {
          await this.context.parent?.camOptions.gotoPosition({
            x: Number(minLeft).toFixed(2),
            y: Number(minTop).toFixed(2),
            z: Number(location.z).toFixed(2),
          });
        }

        this.recursiveInterval = async () => {
          if (this.context.parent?.camOptions.gotoPosition && location) {
            const boxes =
              this.context.parent.camera?.cameras[this.context.camera?.id || '']
                .boxes;

            const diffX = this.calculateDiff(
              minLeft,
              location.x,
              ptzLimits.x.min,
              ptzLimits.x.max
            );

            const x = parseFloat(
              (minLeftCoord + (diffX * coordXLength) / xLength).toFixed(2)
            );
            const y = parseFloat(
              (
                minTopCoord +
                ((location.y - minTop) * coordYLength) / yLength
              ).toFixed(2)
            );

            boxes?.push({
              pos: {
                x: Number(location.x).toFixed(2),
                y: Number(location.y).toFixed(2),
                z: Number(location.z).toFixed(2),
              },
              coord: {
                x,
                y,
              },
            });
            this.context.parent.render({});

            if (location) {
              let cuurentValue: number = 0;

              try {
                cuurentValue = parseFloat(location.x);
              } catch {}

              let movement =
                (isNaN(cuurentValue) ? 0 : cuurentValue) + autoPhoto.xStep;

              location.x = this.getBetween(
                movement,
                ptzLimits.x.min,
                ptzLimits.x.max
              );

              if (
                ((maxRight < 0 && location.x < 0) ||
                  (maxRight >= 0 && location.x >= 0)) &&
                location.x > maxRight
              ) {
                location.x = minLeft;
                cuurentValue = 0;
                try {
                  cuurentValue = parseFloat(location.y);
                } catch {}
                movement =
                  (isNaN(cuurentValue) ? 0 : cuurentValue) - autoPhoto.yStep;

                location.y = this.getBetween(
                  movement,
                  ptzLimits.y.min,
                  ptzLimits.y.max
                );
                if (movement <= maxBottom) {
                  // clearInterval(this.recursiveInterval);
                  this.recursiveInterval = undefined;
                  this.setState({});
                  return;
                }
              }
            }
            // await this.context.parent?.camOptions.gotoPosition({
            //   x: Number(location.x).toFixed(2),
            //   y: Number(location.y).toFixed(2),
            //   z: Number(location.z).toFixed(2),
            // });
          }
          // }, autoPhoto.interval);

          this.setState({});
          this.recursiveInterval();
        };
        this.recursiveInterval();
      } else {
        // clearInterval(this.recursiveInterval);
        this.recursiveInterval = undefined;
        this.setState({});
      }
    }
  }
  async handleSetPosition(evt, value) {
    this.setState({ activePosition: value });

    if (this.context.parent) {
      this.context.parent.limitPosition = value;

      if (
        value &&
        this.context.parent.camera &&
        this.context.camera &&
        this.context.camera.id &&
        this.context.parent.camera.cameras[this.context.camera.id]
      ) {
        let cam = this.context.parent.camera.cameras[this.context.camera.id];
        let d: any = cam.limits;

        if (!d) {
          d = {
            leftBottom: { coord: { x: 0, y: this.context.resulation?.height } },
            leftTop: { coord: { x: 0, y: 0 } },
            rightBottom: {
              coord: {
                x: this.context.resulation?.width,
                y: this.context.resulation?.height,
              },
            },
            rightTop: { coord: { x: this.context.resulation?.width, y: 0 } },
          };
          this.context.parent.camera.cameras[this.context.camera.id].limits = d;
        }

        if (d && d[value]) {
          // d[value].pos = { ...this.context.parent.camera.position };
          this.context.detectBoxes = [
            {
              left: d[value].coord.x,
              top: d[value].coord.y,
              width: 10,
              height: 10,
            },
          ];
          this.context.render({ detectBoxes: this.context.detectBoxes });
        } else {
          this.context.detectBoxes = [];
        }
        if (this.context.parent?.camOptions.gotoPosition && d && d[value]) {
          await this.context.parent?.camOptions.gotoPosition(d[value].pos);
        }
      }
    }
  }
  render() {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={this.state.activeTab}
            onChange={(ev, val) => {
              this.setState({ activeTab: val, activePosition: undefined });
            }}
          >
            {!this.context.parent ? <Tab label={<PhotoCamera />} /> : null}
            {this.context.parent ? <Tab label={<AutoAwesomeMotion />} /> : null}
            <Tab label={<Visibility />} />
            {this.context.parent ? <Tab label={<BorderOuter />} /> : null}
          </Tabs>
        </Box>
        {this.context.parent ? (
          <TabPanel value={this.state.activeTab} index={0}>
            <Box></Box>
          </TabPanel>
        ) : null}
        <TabPanel value={this.state.activeTab} index={1}>
          <Typography id="input-slider" gutterBottom>
            Yatay
          </Typography>
          <Slider
            style={{ width: '100%' }}
            size="medium"
            value={this.state.focal.x}
            max={2.0}
            min={-2.0}
            step={0.01}
            valueLabelDisplay="on"
            onChange={(ev, val) => {
              const { focal } = this.state;
              focal.x = val as number;
              if (this.context.camera) {
                this.context.camera.panorama = focal;
              }
              this.setState({ focal });
            }}
          />
          <Typography id="input-slider" gutterBottom>
            Dikey
          </Typography>
          <Slider
            style={{ width: '100%' }}
            size="medium"
            value={this.state.focal.y}
            max={2.0}
            min={-2.0}
            step={0.01}
            valueLabelDisplay="on"
            onChange={(ev, val) => {
              const { focal } = this.state;
              focal.y = val as number;
              if (this.context.camera) {
                this.context.camera.panorama = focal;
              }
              this.setState({ focal });
            }}
          />
          <Typography id="input-slider" gutterBottom>
            Boyut
          </Typography>
          <Slider
            style={{ width: '100%' }}
            size="medium"
            value={this.state.focal.z}
            max={2.0}
            min={0.0}
            step={0.01}
            valueLabelDisplay="on"
            onChange={(ev, val) => {
              const { focal } = this.state;
              focal.z = val as number;
              if (this.context.camera) {
                this.context.camera.panorama = focal;
              }
              this.setState({ focal });
            }}
          />
        </TabPanel>
        {this.context.parent ? (
          <TabPanel value={this.state.activeTab} index={2}>
            <Grid container spacing={2} style={{ height: '100%' }}>
              <Grid item xs={12}>
                <ToggleButtonGroup
                  value={this.state.activePosition}
                  exclusive
                  onChange={this.handleSetPosition}
                  aria-label="text alignment"
                >
                  <ToggleButton value="leftTop" aria-label="left aligned">
                    Sol Üst
                  </ToggleButton>
                  <ToggleButton value="rightTop" aria-label="centered">
                    Sağ Üst
                  </ToggleButton>
                  <ToggleButton value="leftBottom" aria-label="right aligned">
                    Sol Alt
                  </ToggleButton>
                  <ToggleButton value="rightBottom" aria-label="justified">
                    Sağ Alt
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Oto Foto Süre"
                  type="number"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={this.state.autoPhoto.interval}
                  variant="standard"
                  inputProps={{ min: 500, max: 10000, step: 500 }}
                  onChange={(event) => {
                    const { autoPhoto } = this.state;
                    autoPhoto.interval = parseFloat(event.target.value);
                    this.setState({ autoPhoto });
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="X Adım"
                  type="number"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={this.state.autoPhoto.xStep}
                  variant="standard"
                  inputProps={{ min: 0.01, max: 0.5, step: 0.01 }}
                  onChange={(event) => {
                    const { autoPhoto } = this.state;
                    autoPhoto.xStep = parseFloat(event.target.value);
                    this.setState({ autoPhoto });
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Y Adım"
                  type="number"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={this.state.autoPhoto.yStep}
                  variant="standard"
                  inputProps={{ min: 0.01, max: 0.5, step: 0.01 }}
                  onChange={(event) => {
                    const { autoPhoto } = this.state;

                    autoPhoto.yStep = parseFloat(event.target.value);

                    this.setState({ autoPhoto });
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  onClick={this.recursiveParentTakePhoto}
                  style={{ width: '100%' }}
                  color={this.recursiveInterval ? 'error' : 'primary'}
                  variant="contained"
                >
                  Tara
                </Button>
              </Grid>
              <Grid item xs={12} style={{ height: '50%', overflow: 'auto' }}>
                <List component="nav">
                  {(
                    this.context.parent.camera?.cameras[
                      this.context.camera?.id || ''
                    ].boxes || []
                  ).map((item, index) => {
                    return (
                      <ListItemButton
                        key={index}
                        selected={
                          this.context.parent?.selectedPointIndex === index
                        }
                        onClick={async (event) => {
                          if (this.context.parent) {
                            this.context.parent.selectedPointIndex = index;
                            if (this.context.parent?.camOptions.gotoPosition)
                              await this.context.parent?.camOptions.gotoPosition(
                                {
                                  x: Number(item.pos.x).toFixed(2),
                                  y: Number(item.pos.y).toFixed(2),
                                  z: Number(item.pos.z).toFixed(2),
                                }
                              );
                          }
                          this.setState({});
                        }}
                      >
                        <ListItemText
                          secondary={`${JSON.stringify(item.coord)}`}
                          secondaryTypographyProps={{ fontSize: 12 }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Grid>
            </Grid>
          </TabPanel>
        ) : null}
      </div>
    );
  }
}
