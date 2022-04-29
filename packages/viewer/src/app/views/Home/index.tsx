import {
  Box,
  Card,
  CardContent,
  CardHeader,
  colors,
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
import { PursuitController } from './PursuitController';
import { AutoSizer, List } from 'react-virtualized';
interface HomeState {
  ptzCamera?: Camera;
  staticCameras: Camera[];
  pursuit?: PursuitController;
  pursuitItems: any[];
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
    });
  }

  componentWillUnmount() {
    if (this.state.pursuit) {
      this.state.pursuit.stop();
    }
  }

  render() {
    return (
      <>
        <CssBaseline />
        <Card className={this.props.classes.root}>
          <CardHeader title="Kameralar"></CardHeader>
        </Card>
        <CamContext.Provider
          value={{
            camera: this.state.ptzCamera,
            camOptions: {},
            detectBoxes: [],
            playerMode: 'detect',
            pursuit: this.state.pursuit,
            pursuitItems: this.state.pursuitItems,
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
                <Grid container spacing={1} style={{ height: '100%' }}>
                  <Grid item xs={4} className={this.props.classes.list}>
                    <AutoSizer>
                      {({ width, height }) => (
                        <List
                          width={width}
                          height={height}
                          rowCount={this.state.pursuitItems.length}
                          rowHeight={60}
                          rowRenderer={(row) => {
                            return (
                              <div key={row.key} style={row.style}>
                                {JSON.stringify(
                                  this.state.pursuitItems[row.index]
                                )}
                              </div>
                            );
                          }}
                        />
                        // <List
                        //   ref="List"
                        //   height={listHeight}
                        //   overscanRowCount={overscanRowCount}
                        //   noRowsRenderer={this._noRowsRenderer}
                        //   rowCount={rowCount}
                        //   rowHeight={
                        //     useDynamicRowHeight
                        //       ? this._getRowHeight
                        //       : listRowHeight
                        //   }
                        //   rowRenderer={this._rowRenderer}
                        //   scrollToIndex={scrollToIndex}
                        //   width={width}
                        // />
                      )}
                    </AutoSizer>
                  </Grid>
                  <Grid item xs={8}>
                    <CameraView
                      hideControls={true}
                      showPtz={true}
                      activateDetection={false}
                      settings={this.props.Data?.Settings.CurrentItem}
                    />
                  </Grid>
                </Grid>
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
