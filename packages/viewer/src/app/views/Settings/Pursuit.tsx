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

interface State {
  selectCamId?: any;
  activePursuit?: any;
}

interface Props {
  camera?: Camera;
  DataActions?: DataActions<Camera>;
  Data?: DataState;
}

class Pursuit extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { selectCamId: '' };
  }

  async componentDidMount() {}

  render() {
    return (
      <>
        <Box sx={{ my: 2 }}>
          <Card>
            <CardHeader
              title="Takip"
              action={
                <>
                  {/* <IconButton title="Kaydet" onClick={this.handleSave}>
                    <Save />
                  </IconButton> */}
                </>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item md={3}>
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
                              !this.props.camera?.cameras?.find(
                                (y) => y.camId == x.id
                              )
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
                            camera.cameras = [];
                          }

                          if (camera) {
                            camera.cameras?.push({
                              camId: this.state.selectCamId,
                            });

                            this.setState({ selectCamId: '' });
                          }
                        }}
                      >
                        <Add />
                      </IconButton>
                    </ListItem>

                    {this.props.camera
                      ? this.props.camera.cameras?.map((cam, i) => {
                          const camInfo = this.props.Data?.Camera.List.find(
                            (x) => x.id == cam.camId
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
                                      camera.cameras = [];
                                    }

                                    if (camera) {
                                      camera.cameras?.splice(i, 1);

                                      this.setState({ selectCamId: '' });
                                    }
                                  }}
                                >
                                  <Remove />
                                </IconButton>
                              }
                            >
                              <ListItemButton
                                selected={
                                  this.state.activePursuit?.camId == cam.camId
                                }
                                onClick={() => {
                                  this.setState({ activePursuit: cam });
                                }}
                              >
                                <ListItemIcon>
                                  <CameraAlt />
                                </ListItemIcon>
                                <ListItemText primary={camInfo?.name} />
                              </ListItemButton>
                            </ListItem>
                          );
                        })
                      : null}
                  </List>
                </Grid>
                <Divider orientation="vertical" flexItem />
                <Grid item md={8}>
                  {this.state.activePursuit?.camId}
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
