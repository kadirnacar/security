import {
  AutoAwesomeMotion,
  BorderOuter,
  Close,
  FindInPage,
  MoveToInbox,
  Photo,
  PhotoCamera,
  Screenshot,
  Visibility,
} from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  ImageList,
  ImageListItem,
  Slider,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { ICamPosition, ICoord, IRectLimits } from '@security/models';
import React, { Component } from 'react';
import { CamContext, generateGuid } from '../../utils';

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

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ position: 'relative', width: '100%', height: '100%' }}
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

    this.handlePhoto = this.handlePhoto.bind(this);
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

  handlePhoto(item) {}

  getBoxes() {
    if (this.context.parent && this.context.parent.boxes) {
      const bxs =
        this.context.parent.camera?.cameras[this.context.camera?.id || '']
          .boxes || [];

      return bxs.concat(
        // this.context.boxes
        //   .filter((x) => !bxs.find((y) => y.id == x.id))
        //   .concat(
        //     this.context.parent.camera
        //       ? this.context.parent.boxes.filter(
        //           (x) =>
        //             !this.context.boxes.find((y) => y.id == x.id) &&
        //             !bxs.find((y) => y.id == x.id)
        //         )
        //       : []
        //   )
      );
    } else {
      return [];
    }
  }

  recursiveInterval;

  getFloat(value) {
    let cuurentValue: number = 0;
    try {
      cuurentValue = parseFloat(value);
    } catch {}
    return isNaN(cuurentValue) ? 0 : cuurentValue;
  }

  async recursiveParentTakePhoto() {
    // const x= this.
    // setInterval(async () => {
    //   // const x=
    //   if (this.context.parent?.camOptions.takePhoto) {
    //     if (this.context.parent?.camOptions.gotoPosition) {
    //       // await this.context.parent?.camOptions.gotoPosition(
    //       //   item.camPos
    //       // );
    //       setTimeout(() => {
    //         const box = this.context.parent?.camOptions.takePhoto();
    //         if (box && this.context.parent) {
    //           this.context.parent?.boxes.push(box);
    //           this.context.parent.camOptions.selectedBoxIndex = 0;
    //           this.context.parent?.render({
    //             boxes: this.context.parent?.boxes,
    //             camOptions: this.context.parent?.camOptions,
    //           });
    //         }
    //       }, 1000);
    //     }
    //   }
    // }, 3000);
    const { autoPhoto } = this.state;

    if (!this.recursiveInterval) {
      let limits: IRectLimits | undefined;
      let location: ICamPosition = { x: 0, y: 0, z: 0 };
      if (
        this.context.parent?.camera &&
        this.context.camera &&
        this.context.camera.id &&
        this.context.parent.camera.cameras[this.context.camera.id] &&
        this.context.parent.camera.cameras[this.context.camera.id].limits
      ) {
        limits =
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
          min: isNaN(minZoom) ? -1 : minZoom,
          max: isNaN(maxZoom) ? 1 : maxZoom,
        };

        if (limits) {
          location = {
            x: limits.leftTop.pos.x,
            y: limits.leftTop.pos.y,
            z: limits.leftTop.pos.z,
          };
        }

        let minLeft = this.getFloat(limits?.leftTop.pos.x);
        let maxRight = this.getFloat(limits?.rightBottom.pos.x);
        let xLength =
          minLeft < 0 || maxRight < 0
            ? Math.abs(maxRight - minLeft)
            : maxRight - minLeft;

        let minTop = this.getFloat(limits?.leftTop.pos.y);
        let maxBottom = this.getFloat(limits?.rightBottom.pos.y);

        let yLength =
          minTop < 0 || maxBottom < 0
            ? Math.abs(maxBottom - minTop)
            : maxBottom - minTop;

        await this.context.parent?.camOptions.gotoPosition({
          x: location.x,
          y: location.y,
          z: location.z,
        });

        this.recursiveInterval = setInterval(async () => {
          if (this.context.parent?.camOptions.gotoPosition && location) {
            if (this.context.parent?.camOptions.takePhoto) {
              const box = this.context.parent.camOptions.takePhoto();
              if (box) {
                this.context.boxes.push(box);
                this.context.camOptions.selectedBoxIndex =
                  this.context.boxes.length;
                this.context.render({
                  boxes: this.context.boxes,
                  camOptions: this.context.camOptions,
                });
              }
            }

            await this.context.parent?.camOptions.gotoPosition({
              x: location.x,
              y: location.y,
              z: location.z,
            });

            let newX = this.getFloat(location.x) + autoPhoto.xStep;
            if (newX <= ptzLimits.x.max && newX >= ptzLimits.x.min) {
            } else {
              newX =
                ptzLimits.x.min + (Math.abs(newX) - Math.abs(ptzLimits.x.max));
            }

            let currentXLength =
              minLeft < 0 || newX < 0
                ? Math.abs(newX - minLeft)
                : newX - minLeft;

            if (currentXLength > xLength) {
              location.x = minLeft.toFixed(2);
              location.y = (
                this.getFloat(location.y) + autoPhoto.yStep
              ).toFixed(2);
            } else {
              location.x = newX.toFixed(2);
            }

            let currentYLength =
              minTop < 0 || maxBottom < 0
                ? Math.abs(location.y - minTop)
                : location.y - minTop;
            if (currentYLength > yLength) {
              clearInterval(this.recursiveInterval);
              this.recursiveInterval = undefined;
              this.setState({});
            }
          }
        }, autoPhoto.interval);
        this.setState({});
      }
    } else {
      clearInterval(this.recursiveInterval);
      this.recursiveInterval = undefined;
      this.setState({});
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
        this.context.parent.camera.cameras[this.context.camera.id] &&
        this.context.parent.camera.cameras[this.context.camera.id].limits
      ) {
        const d =
          this.context.parent.camera.cameras[this.context.camera.id].limits;

        if (this.context.parent?.camOptions.gotoPosition && d && d[value]) {
          await this.context.parent?.camOptions.gotoPosition(d[value].pos);
          this.context.boxes = [
            {
              top: d[value].coord.y,
              id: generateGuid(),
              left: d[value].coord.x,
              right: d[value].coord.x + 10,
              bottom: d[value].coord.y + 10,
            },
          ];
          this.context.camOptions.selectedBoxIndex = undefined;
          this.context.render({ boxes: this.context.boxes });
        }
      }
    }
  }
  render() {
    return (
      <>
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
        {!this.context.parent ? (
          <TabPanel value={this.state.activeTab} index={0}>
            <IconButton
              title="Çek"
              onClick={() => {
                if (this.context.camOptions.takePhoto) {
                  const box = this.context.camOptions.takePhoto();
                  if (box) {
                    this.context.boxes.push(box);
                    this.context.camOptions.selectedBoxIndex =
                      this.context.boxes.length;
                    this.context.render({
                      boxes: this.context.boxes,
                      camOptions: this.context.camOptions,
                    });
                  }
                }
              }}
            >
              <Screenshot />
            </IconButton>
            <Box>
              <ImageList cols={3} variant="masonry">
                {this.context.boxes.map((item, index) => (
                  <ImageListItem
                    key={index}
                    style={{
                      border:
                        this.props.selectedBoxIndex == index
                          ? '1px solid red'
                          : '',
                    }}
                  >
                    <IconButton
                      style={{ position: 'absolute', right: 0 }}
                      onClick={() => {
                        this.context.boxes.splice(index, 1);
                        this.context.render({ boxes: this.context.boxes });
                      }}
                    >
                      <Close />
                    </IconButton>
                    {/* <IconButton
                    style={{ position: 'absolute', right: 25 }}
                    onClick={() => {
                      // if (this.context.camOptions.onFindImage) {
                      //   this.context.camOptions.onFindImage(item);
                      // }
                    }}
                  >
                    <FindInPage />
                  </IconButton> */}
                    <img
                      src={item.image?.toDataURL()}
                      // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                      // alt={item.title}
                      loading="lazy"
                      onClick={this.props.onClickImage?.bind(this, item, index)}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          </TabPanel>
        ) : null}
        {this.context.parent ? (
          <TabPanel value={this.state.activeTab} index={0}>
            <Box>
              <ImageList cols={2} variant="masonry">
                {this.context.parent && this.context.parent.boxes ? (
                  this.getBoxes().map((item, index) => (
                    <ImageListItem
                      key={index}
                      style={{
                        border:
                          this.props.selectedBoxIndex == index
                            ? '1px solid red'
                            : '1px solid gray',
                      }}
                    >
                      <IconButton
                        style={{
                          position: 'absolute',
                          right: 0,
                          color: 'red',
                        }}
                        onClick={() => {
                          // if (this.context.parent) {
                          //   const i = this.context.parent?.boxes.findIndex(
                          //     (x) => x.id == item.id
                          //   );
                          //   const i2 = this.context.boxes.findIndex(
                          //     (x) => x.id == item.id
                          //   );
                          //   const i3 = this.context.parent?.camera?.cameras[
                          //     this.context.camera?.id || ''
                          //   ].boxes.findIndex((x) => x.id == item.id);
                          //   if (i > -1) this.context.parent?.boxes.splice(i, 1);
                          //   if (i2 > -1) this.context.boxes.splice(i2, 1);
                          //   if (i3 != undefined && i3 > -1)
                          //     this.context.parent?.camera?.cameras[
                          //       this.context.camera?.id || ''
                          //     ].boxes.splice(i3, 1);

                          //   this.context.parent?.render({
                          //     boxes: this.context.parent.boxes,
                          //   });
                          //   this.context.render({
                          //     boxes: this.context.boxes,
                          //   });
                          // }
                        }}
                      >
                        <Close />
                      </IconButton>
                      <IconButton
                        style={{
                          position: 'absolute',
                          right: 25,
                          color: 'red',
                        }}
                        onClick={async () => {
                          const img = await this.context.camOptions.onFindImage(
                            item
                          );
                          // if (
                          //   this.context.parent &&
                          //   this.context.parent.camera &&
                          //   this.context.camera
                          // ) {
                          //   this.context.parent.camera.cameras[
                          //     this.context.camera?.id || ''
                          //   ] = [...this.context.boxes];
                          // }
                        }}
                      >
                        <FindInPage />
                      </IconButton>
                      <IconButton
                        style={{
                          position: 'absolute',
                          right: 50,
                          color: 'red',
                        }}
                        onClick={async () => {
                          // if (this.context.parent?.camOptions.gotoPosition) {
                          //   await this.context.parent?.camOptions.gotoPosition(
                          //     item.camPos
                          //   );
                          // }
                        }}
                      >
                        <MoveToInbox />
                      </IconButton>
                      {/* {item.image ? (
                        <img
                          src={item.image?.toDataURL()}
                          // srcSet={`${item.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                          // alt={item.title}
                          loading="lazy"
                          onClick={this.props.onClickImage?.bind(
                            this,
                            item,
                            index
                          )}
                        />
                      ) : ( */}
                        <Photo
                          style={{ minWidth: 120, minHeight: 70 }}
                          onClick={this.props.onClickImage?.bind(
                            this,
                            item,
                            index
                          )}
                        ></Photo>
                      {/* )} */}
                    </ImageListItem>
                  ))
                ) : (
                  <ImageListItem>
                    <img loading="lazy" />
                  </ImageListItem>
                )}
              </ImageList>
            </Box>
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
            <Grid container spacing={2}>
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
                  inputProps={{ min: 0.05, max: 0.1, step: 0.5 }}
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
                  value={this.state.autoPhoto.xStep}
                  variant="standard"
                  inputProps={{ min: 0.05, max: 0.1, step: 0.5 }}
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
            </Grid>
          </TabPanel>
        ) : null}
      </>
    );
  }
}
