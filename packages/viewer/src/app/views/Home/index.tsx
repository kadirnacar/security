import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CssBaseline,
  Divider,
  Grid,
  Theme,
} from '@mui/material';
import { createStyles, withStyles } from '@mui/styles';
import { Camera } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withSize } from 'react-sizeme';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { CamContext } from '../../utils';
import CameraView from './CameraView';

interface HomeState {
  ptzCamera?: Camera;
  staticCameras: Camera[];
}
interface Props {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
}

const Tags = {
  CameraView: CameraView,
};

class Home extends Component<Props, HomeState> {
  constructor(props) {
    super(props);

    this.imageDiv = React.createRef<any>();
    this.state = {
      staticCameras: [],
    };
  }

  imageDiv: React.RefObject<any>;

  async componentDidMount() {
    await this.props.DataActions?.getList('Camera');
    await this.props.DataActions?.getItem('Settings');

    const ptzCam = this.props.Data?.Camera.List.find((x) => x.isPtz);
    const staticCams = this.props.Data?.Camera.List.filter((x) => !x.isPtz);

    this.setState({
      staticCameras: staticCams || [],
      ptzCamera: ptzCam,
    });
  }

  render() {
    return (
      <>
        <CssBaseline />
        <Card className={this.props['classes'].root}>
          <CardHeader title="Kameralar"></CardHeader>
        </Card>
        <CamContext.Provider
          value={{
            camera: this.state.ptzCamera,
            camOptions: {},
            detectBoxes: [],
            playerMode: 'detect',
            render: (state) => {
              this.setState({});
            },
          }}
        >
          <Box sx={{ my: 2 }}>
            <Card>
              <CardHeader title="PTZ" />
              <Divider />
              <CardContent
                style={{ maxHeight: 600, height: 600, position: 'relative' }}
              >
                <CameraView
                  hideControls={true}
                  showPtz={true}
                  activateDetection={true}
                  settings={this.props.Data?.Settings.CurrentItem}
                />
              </CardContent>
            </Card>
          </Box>
          <Grid container spacing={0}>
            {this.state.staticCameras.map((scam, i) => {
              return (
                <CamContext.Provider
                  key={i}
                  value={{
                    camera: scam,
                    camOptions: {},
                    detectBoxes: [],
                    playerMode: 'detect',
                    render: (state) => {
                      this.setState({});
                    },
                  }}
                >
                  <Grid
                    item
                    xs={Math.floor(
                      12 /
                        (this.props.Data?.Camera.List.filter((x) => !x.isPtz)
                          .length || 1)
                    )}
                    key={0}
                  >
                    <Box sx={{ my: 2 }}>
                      <Card>
                        <CardHeader title={scam.name} />
                        <Divider />
                        <CardContent
                          style={{
                            maxHeight: 600,
                            height: 600,
                            position: 'relative',
                          }}
                        >
                          <CameraView
                            hideControls={true}
                            showPtz={false}
                            activateDetection={true}
                            settings={this.props.Data?.Settings.CurrentItem}
                          />
                        </CardContent>
                      </Card>
                    </Box>
                  </Grid>
                </CamContext.Provider>
              );
            })}
          </Grid>
        </CamContext.Provider>
      </>
    );
  }
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
  });

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default withSize({ refreshMode: 'debounce', refreshRate: 60 })(
  withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Home))
);
