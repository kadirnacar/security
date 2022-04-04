import { ExpandMore, Save } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  CssBaseline,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
} from '@mui/material';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import ReactJson from 'react-json-view';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { WithRouter, withRouter } from '../../withRouter';
import CameraView from '../Home/CameraView';
import Pursuit from './Pursuit';

interface State {
  camera?: Camera;
  expand?: boolean;
  expandView?: boolean;
}

interface Props {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
}

class Form extends Component<Props & WithRouter, State> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.state = { camera: undefined, expand: false, expandView: false };
  }

  async componentDidMount() {
    await this.props.DataActions?.getList('Camera', true);
    await this.props.DataActions?.getItem('Settings');
    if (
      this.props.params &&
      this.props.params['id'] &&
      this.props.params['id'] != 'new'
    ) {
      await this.props.DataActions?.getById('Camera', this.props.params['id']);
      if (this.props.Data?.Camera.CurrentItem)
        this.setState({ camera: this.props.Data.Camera.CurrentItem });
    } else {
      this.setState({ camera: { name: '' } });
    }
  }

  handleChange = (event) => {
    let camera: any = this.state.camera;
    if (!camera) {
      camera = {};
    }
    camera[event.target.name] = event.target.value;
    this.setState({ camera });
  };

  handleCheck = (event) => {
    let camera: any = this.state.camera;
    if (!camera) {
      camera = {};
    }
    camera[event.target.name] = event.target.checked;
    this.setState({ camera });
  };

  async handleSave() {
    if (this.state.camera?.id) {
      await this.props.DataActions?.updateItem('Camera', this.state.camera);
    } else {
      await this.props.DataActions?.createItem('Camera', this.state.camera);
    }
  }

  render() {
    return (
      <>
        <CssBaseline />
        <Card>
          <CardHeader
            title="Kameralar"
            action={
              <IconButton title="Kaydet" onClick={this.handleSave}>
                <Save />
              </IconButton>
            }
          ></CardHeader>
        </Card>
        <Box sx={{ my: 2 }}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item md={12}>
                  <TextField
                    fullWidth
                    label="Adı"
                    margin="normal"
                    name="name"
                    type="text"
                    onChange={this.handleChange}
                    value={this.state.camera?.name || ''}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6}>
                  <TextField
                    fullWidth
                    label="Adres"
                    margin="normal"
                    value={this.state.camera?.url || ''}
                    onChange={this.handleChange}
                    name="url"
                    type="text"
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={3}>
                  <TextField
                    fullWidth
                    label="Port"
                    margin="normal"
                    value={this.state.camera?.port || ''}
                    onChange={this.handleChange}
                    name="port"
                    type="number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={3}>
                  <TextField
                    fullWidth
                    label="RTSP Port"
                    margin="normal"
                    value={this.state.camera?.rtspPort || ''}
                    onChange={this.handleChange}
                    name="rtspPort"
                    type="number"
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6}>
                  <TextField
                    fullWidth
                    label="Kullanıcı Adı"
                    margin="normal"
                    value={this.state.camera?.username || ''}
                    onChange={this.handleChange}
                    name="username"
                    type="text"
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6}>
                  <TextField
                    fullWidth
                    label="Şifre"
                    margin="normal"
                    value={this.state.camera?.password || ''}
                    onChange={this.handleChange}
                    name="password"
                    type="password"
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          this.state.camera?.isPtz != undefined
                            ? this.state.camera?.isPtz
                            : false
                        }
                        onChange={this.handleCheck}
                        name="isPtz"
                        color="primary"
                      />
                    }
                    label="PTZ"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ my: 2 }}>
          <Card>
            <CardHeader
              title="Kamera Sistem Bilgisi"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                this.setState({ expand: !this.state.expand });
              }}
              action={
                <>
                  <IconButton
                    title="Ayrıntılar"
                    onClick={() => {
                      this.setState({ expand: !this.state.expand });
                    }}
                  >
                    <ExpandMore />
                  </IconButton>
                </>
              }
            />
            <Divider />
            <Collapse in={this.state.expand} timeout="auto" unmountOnExit>
              <CardContent style={{ maxHeight: 600, overflow: 'auto' }}>
                <ReactJson
                  src={this.state.camera?.camInfo}
                  theme="monokai"
                  collapsed={1}
                />
              </CardContent>
            </Collapse>
          </Card>
        </Box>
        <Box sx={{ my: 2 }}>
          <Card>
            <CardHeader
              title="Kamera İzle"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                this.setState({ expandView: !this.state.expandView });
              }}
              action={
                <>
                  <IconButton
                    title="Ayrıntılar"
                    onClick={() => {
                      this.setState({ expandView: !this.state.expandView });
                    }}
                  >
                    <ExpandMore />
                  </IconButton>
                </>
              }
            />
            <Divider />
            <Collapse in={this.state.expandView} timeout="auto" unmountOnExit>
              <CardContent
                style={{ maxHeight: 600, height: 600, position: 'relative' }}
              >
                <CameraView
                  camera={this.state.camera}
                  hideControls={false}
                  settings={this.props.Data?.Settings.CurrentItem}
                />
              </CardContent>
            </Collapse>
          </Card>
        </Box>
        {this.state.camera?.isPtz ? (
          <Pursuit camera={this.state.camera} />
        ) : null}
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Form));
