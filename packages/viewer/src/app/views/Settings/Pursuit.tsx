import { Add, CameraAlt, Remove } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { withRouter } from '../../withRouter';
import CameraView from '../Home/CameraView';

interface State {
  selectCamId?: string;
  activePursuit?: string;
  activeCamera?: Camera;
  canvases: { id: string; canvas: HTMLCanvasElement }[];
}

interface Props {
  camera?: Camera;
  DataActions?: DataActions<Camera>;
  Data?: DataState;
  searchCanvas?: { id: string; canvas: HTMLCanvasElement }[];
  onPursuit?: (val) => void;
}

export class Pursuit extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { selectCamId: '', activeCamera: undefined, canvases: [] };
  }

  async componentDidMount() {
    await this.props.DataActions?.getItem('Settings');
  }

  render() {
    return (
      <>
        <Box sx={{ my: 2 }}>
          <Card>
            <CardHeader title="Takip" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item md={2}>
                  <List>
                    <ListItem disablePadding>
                      <FormControl fullWidth variant="standard">
                        <Select
                          label="Kamera"
                          value={this.state.selectCamId}
                          onChange={(ev) => {
                            this.setState({ selectCamId: ev.target.value });
                          }}
                        >
                          {this.props.Data?.Camera.List.filter(
                            (x) =>
                              !x.isPtz &&
                              !this.props.camera?.cameras[x.id || '']
                          ).map((cam, i) => {
                            return (
                              <MenuItem key={i} value={cam.id}>
                                {cam.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                      <IconButton
                        size="small"
                        title="Ekle"
                        onClick={() => {
                          const { camera } = this.props;
                          if (camera && !camera?.cameras) {
                            camera.cameras = {};
                          }
                          if (camera) {
                            camera.cameras[this.state.selectCamId || ''] = [];
                            this.setState({ selectCamId: '' });
                            if (this.props.onPursuit) {
                              this.props.onPursuit(camera.cameras);
                            }
                          }
                        }}
                      >
                        <Add />
                      </IconButton>
                    </ListItem>

                    {this.props.camera
                      ? Object.keys(this.props.camera?.cameras).map(
                          (camId, i) => {
                            const camInfo = this.props.Data?.Camera.List.find(
                              (x) => x.id == camId
                            );
                            return (
                              <ListItem
                                key={i}
                                disablePadding
                                secondaryAction={
                                  <IconButton
                                    title="Kaydet"
                                    onClick={() => {
                                      const { camera } = this.props;
                                      if (camera && !camera?.cameras) {
                                        camera.cameras = {};
                                      }

                                      if (camera) {
                                        delete camera.cameras[camId];

                                        this.setState({ selectCamId: '' });
                                      }
                                    }}
                                  >
                                    <Remove />
                                  </IconButton>
                                }
                              >
                                <ListItemButton
                                  selected={this.state.activePursuit == camId}
                                  onClick={() => {
                                    const camera =
                                      this.props.Data?.Camera.List.find(
                                        (x) => x.id == camId
                                      );
                                    this.setState({
                                      activePursuit: camId,
                                      activeCamera: camera,
                                    });
                                  }}
                                >
                                  <ListItemIcon>
                                    <CameraAlt />
                                  </ListItemIcon>
                                  <ListItemText primary={camInfo?.name} />
                                </ListItemButton>
                              </ListItem>
                            );
                          }
                        )
                      : null}
                  </List>
                </Grid>
                <Grid item md={10}>
                  {this.state.activePursuit ? (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              p: 2,
                              border: '1px dashed grey',
                              position: 'relative',
                            }}
                          >
                            <CameraView
                              camera={this.state.activeCamera}
                              hideControls={false}
                              showPanorama={!this.state.activeCamera?.isPtz}
                              searchCanvas={this.props.searchCanvas}
                              searchBoxes={
                                this.props.camera?.cameras[
                                  this.state.activePursuit
                                ]
                              }
                              onSearchRect={(boxes) => {
                                console.log(boxes);
                              }}
                              onSearchRemove={(index) => {
                                const { camera } = this.props;
                                if (camera && !camera?.cameras) {
                                  camera.cameras = {};
                                }
                                if (camera) {
                                  console.log(
                                    camera,
                                    this.state.activePursuit,
                                    index
                                  );
                                  camera.cameras[
                                    this.state.activePursuit || ''
                                  ].splice(index, 1);
                                  if (this.props.onPursuit) {
                                    this.props.onPursuit(camera.cameras);
                                  }
                                }
                              }}
                            />
                          </Box>
                        </Grid>
                        {/* <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 2,
                              border: '1px dashed grey',
                              position: 'relative',
                            }}
                          >
                            <CameraView
                              camera={this.props.camera}
                              hideControls={false}
                              settings={this.props.Data?.Settings.CurrentItem}
                            />
                          </Box>
                        </Grid> */}
                      </Grid>
                    </>
                  ) : null}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Pursuit)
);
