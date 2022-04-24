import { PlayCircleFilled } from '@mui/icons-material';
import { CircularProgress, Divider, Grid, IconButton } from '@mui/material';
import { Camera, Settings } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { CameraService } from '../../services/CameraService';
import { ApplicationState } from '../../store';
import { CamContext } from '../../utils';
import CameraController from './CameraController';
import PtzController from './PtzController';
import VideoPlayer from './VideoPlayer';

interface State {
  streamSource?: MediaStream;
  loaded: boolean;
  playing: boolean;
  focal?: any;
  selectedBoxIndex: number;
  connected: boolean;
}

type Props = {
  DataActions?: DataActions<Camera>;
  Data?: DataState;
  settings: Settings;
  hideControls?: boolean;
  showPtz?: boolean;
  activateDetection?: boolean;
};

class CameraView extends Component<Props, State, typeof CamContext> {
  constructor(props) {
    super(props);
    this.handleConnectVideo = this.handleConnectVideo.bind(this);

    this.state = {
      streamSource: undefined,
      loaded: false,
      playing: false,
      focal: { x: 0, y: 0, scale: 1 },
      selectedBoxIndex: -1,
      connected: false,
    };
  }
  static contextType = CamContext;
  context!: React.ContextType<typeof CamContext>;
  pc?: RTCPeerConnection;
  videoPlayer?;

  async componentWillUnmount() {
    if (this.pc) {
      this.pc.close();
    }
    this.setState({ playing: false });

    await CameraService.disconnect(this.context.camera?.id || '');
  }

  async componentDidMount() {
    if (this.context.camera?.id) {
      await CameraService.connect(this.context.camera?.id);
      this.setState({
        loaded: true,
        connected: true,
        focal: this.context.camera?.panorama || { x: 0, y: 0, scale: 1 },
      });
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if (!this.state.connected && this.context.camera?.id) {
      await CameraService.connect(this.context.camera?.id);
      this.setState({
        loaded: true,
        connected: true,
        focal: this.context.camera?.panorama || { x: 0, y: 0, scale: 1 },
      });
    }
  }

  handleConnectVideo() {
    this.setState(
      {
        playing: true,
      },
      () => {
        this.pc = new RTCPeerConnection({});

        this.pc.onnegotiationneeded = async (ev) => {
          if (this.pc) {
            let offer = await this.pc.createOffer();
            await this.pc.setLocalDescription(offer);
            const response = await fetch(
              `http://${location.host}/api/camera/rtspgo/${this.context['camera']?.id}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  data: btoa(this.pc.localDescription?.sdp || ''),
                }),
              }
            );
            const data = await response.json();
            this.pc.setRemoteDescription(
              new RTCSessionDescription({
                type: 'answer',
                sdp: atob(data.answer),
              })
            );
          }
        };
        this.pc.addTransceiver('video', {
          direction: 'sendrecv',
        });

        this.pc.ontrack = (event) => {
          let stream = new MediaStream();
          stream.addTrack(event.track);
          this.setState({ streamSource: stream });
        };
      }
    );
  }

  render() {
    return this.state.loaded ? (
      <Grid
        container
        spacing={0}
        justifyContent="center"
        alignItems="top"
        style={{ height: '100%' }}
      >
        {!this.props.hideControls
          ? [
              <Grid item xs={3} key={0}>
                <CameraController
                  selectedBoxIndex={this.context.camOptions.selectedBoxIndex}
                  onClickImage={async (item, index) => {
                    this.context.camOptions.selectedBoxIndex = index;
                    if (this.context.camOptions.gotoPosition) {
                      await this.context.camOptions.gotoPosition(item.camPos);
                    }
                    if (this.context.parent?.camOptions.gotoPosition) {
                      await this.context.parent?.camOptions.gotoPosition(
                        item.camPos
                      );
                    }
                    this.context.render({});
                    // this.context.render({
                    //   camOptions: this.context.camOptions,
                    // });
                  }}
                />
              </Grid>,
              <Divider
                key={1}
                orientation="vertical"
                style={{ marginRight: -1 }}
              ></Divider>,
            ]
          : null}
        <Grid
          item
          xs={this.props.hideControls ? 12 : 9}
          style={{ height: '100%' }}
        >
          {!this.state.playing ? (
            <div style={{ width: '100%', height: '100%', display: 'flex' }}>
              <IconButton
                style={{ margin: 'auto' }}
                title="Kapat"
                onClick={this.handleConnectVideo}
              >
                <PlayCircleFilled style={{ fontSize: 120 }} />
              </IconButton>
            </div>
          ) : (
            <>
              <VideoPlayer
                activateDetection={this.props.activateDetection}
                stream={this.state.streamSource}
                settings={this.props.Data?.Settings.CurrentItem}
                // onDrawRect={
                //   this.context.parent
                //     ? (box) => {
                //         box.camPos = this.context.parent?.camera?.position;

                //         if (
                //           this.context.parent?.limitPosition &&
                //           this.context.camera &&
                //           this.context.parent.camera?.cameras[
                //             this.context.camera?.id || ''
                //           ]
                //         ) {
                //           let limits: any =
                //             this.context.parent.camera?.cameras[
                //               this.context.camera?.id || ''
                //             ].limits;

                //           if (!limits) {
                //             limits = {};
                //           }
                //           limits[this.context.parent?.limitPosition] = {
                //             coord: { x: box.left, y: box.top },
                //             pos: { ...box.camPos },
                //           };
                //           this.context.parent.camera.cameras[
                //             this.context.camera?.id || ''
                //           ].limits = limits;
                //         }
                //         this.context.render({});
                //       }
                //     : undefined
                // }
              />
              {this.props.showPtz ? <PtzController></PtzController> : null}
            </>
          )}
        </Grid>
      </Grid>
    ) : (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <CircularProgress style={{ margin: 'auto' }} />
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => state;

const mapDispatchToProps = (dispatch) => {
  return {
    DataActions: bindActionCreators({ ...new DataActions<Camera>() }, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CameraView);
