import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  colors,
  CssBaseline,
  Divider,
  Grid,
  IconButton,
  Theme,
  Typography,
} from '@mui/material';
import { createStyles, withStyles } from '@mui/styles';
import { Camera, Capture } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withSize } from 'react-sizeme';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { ApplicationState } from '../../store';
import { CamContext } from '../../utils';
import CameraView from './CameraView';
import { PursuitController } from './PursuitController';
import { AutoSizer, List } from 'react-virtualized';
import { PlayArrow, SkipNext, SkipPrevious } from '@mui/icons-material';
import moment from 'moment';
interface HomeState {
  ptzCamera?: Camera;
  staticCameras: Camera[];
  pursuit?: PursuitController;
  pursuitItems: Capture[];
}
interface Props {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
  classes: any;
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
      pursuitItems: [],
    };
  }

  imageDiv: React.RefObject<any>;

  async componentDidMount() {
    await this.props.DataActions?.getList('Camera');
    await this.props.DataActions?.getItem('Settings');

    const ptzCam = this.props.Data?.Camera.List.find((x) => x.isPtz);

    if (ptzCam) {
      await this.props.DataActions?.getList('Capture', ptzCam.id);
    }

    const staticCams = this.props.Data?.Camera.List.filter((x) => !x.isPtz);
    const settings = this.props.Data?.Settings.CurrentItem;
    const pursuit = new PursuitController(ptzCam, settings?.pursuitTimeout);
    pursuit.onPursuit = (item) => {
      const { pursuitItems } = this.state;
      pursuitItems.push(item);
      this.setState({ pursuitItems });
    };
    this.setState({
      staticCameras: staticCams || [],
      ptzCamera: ptzCam,
      pursuit,
      pursuitItems: [],
    });
  }

  componentWillUnmount() {
    if (this.state.pursuit) {
      this.state.pursuit.stop();
    }
  }

  render() {
    const imageHeight = 150;
    const ratio = 1920 / 1080;
    return (
      <>
        <CssBaseline />
        <CamContext.Provider
          value={{
            camera: this.state.ptzCamera,
            camOptions: {},
            detectBoxes: [],
            playerMode: 'detect',
            pursuit: this.state.pursuit,
            render: (state) => {
              this.setState({});
            },
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <AutoSizer>
                {({ width, height }) => (
                  <List
                    width={width}
                    height={height}
                    className={this.props.classes.list}
                    rowCount={this.state.pursuitItems.length}
                    rowHeight={imageHeight + 30}
                    style={{ padding: 10, margin: 0 }}
                    rowRenderer={(row) => {
                      const ix = this.state.pursuitItems.length - 1;
                      const data = this.state.pursuitItems[ix - row.index];
                      return (
                        <div key={row.key} style={row.style}>
                          <Card
                            sx={{
                              display: 'flex',
                            }}
                          >
                            <CardMedia
                              component="img"
                              style={{
                                height: imageHeight,
                                width: imageHeight * ratio,
                              }}
                              image={`/api/camera/capture/image/${this.state.ptzCamera?.id}/${data.id}/${imageHeight}`}
                            />
                            <Box sx={{}}>
                              <CardContent sx={{ flex: '1', padding: 1 }}>
                                <Typography component="div" variant="subtitle2">
                                  {moment(data.date).format(
                                    'HH:mm:ss DD.MM.YYYY'
                                  )}
                                </Typography>

                                <Typography
                                  variant="subtitle1"
                                  color="text.secondary"
                                  component="div"
                                >
                                  {data.plateResult &&
                                  data.plateResult.results &&
                                  data.plateResult.results.length > 0 ? (
                                    data.plateResult.results.map((item, i) => {
                                      return <p key={i}>Plaka: {item.plate}</p>;
                                    })
                                  ) : (
                                    <p>Şahıs: Bilinmiyor</p>
                                  )}
                                </Typography>
                              </CardContent>
                            </Box>
                          </Card>
                        </div>
                      );
                    }}
                  />
                )}
              </AutoSizer>
            </Grid>
            <Grid item xs={8}>
              <Grid container spacing={1}>
                <Grid item xs={12} key={0}>
                  <Box sx={{}}>
                    <Card>
                      <CardHeader subheader="PTZ" style={{ height: 40 }} />
                      <Divider />
                      <CardContent
                        style={{
                          position: 'relative',
                          height: 450,
                        }}
                      >
                        <CameraView
                          hideControls={true}
                          showPtz={true}
                          activateDetection={false}
                          settings={this.props.Data?.Settings.CurrentItem}
                        />
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
                {this.state.staticCameras.map((scam, i) => {
                  return (
                    <CamContext.Provider
                      key={i}
                      value={{
                        camera: scam,
                        camOptions: {},
                        detectBoxes: [],
                        playerMode: 'detect',
                        pursuit: this.state.pursuit,
                        render: (state) => {
                          this.setState({});
                        },
                      }}
                    >
                      <Grid
                        item
                        xs={Math.floor(
                          12 /
                            (this.props.Data?.Camera.List.filter(
                              (x) => !x.isPtz
                            ).length || 1)
                        )}
                        key={0}
                      >
                        <Box sx={{}}>
                          <Card>
                            <CardHeader
                              subheader={scam.name}
                              style={{ height: 40 }}
                            />
                            <Divider />
                            <CardContent
                              style={{
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
            </Grid>
          </Grid>
        </CamContext.Provider>
      </>
    );
  }
}

const styles = (theme: Theme) => {
  return createStyles({
    root: {
      width: '100%',
    },
    list: {
      background: theme.palette.grey[800],
      borderRadius: 10,
    },
  });
};
const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default withSize({ refreshMode: 'debounce', refreshRate: 60 })(
  withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Home))
);
