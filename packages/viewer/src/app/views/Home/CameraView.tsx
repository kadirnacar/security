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
import CameraController from './CameraController';
import PtzController from './PtzController';
import VideoPlayer from './VideoPlayer';

interface State {
  streamSource?: MediaStream;
  loaded: boolean;
  playing: boolean;
  focal?: any;
}

type Props = {
  camera?: Camera;
  DataActions?: DataActions<Camera>;
  Data?: DataState;
  settings: Settings;
  hideControls?: boolean;
  showPtz?: boolean;
};

class CameraView extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.handleConnectVideo = this.handleConnectVideo.bind(this);

    this.state = {
      streamSource: undefined,
      loaded: false,
      playing: false,
      focal: { x: 0, y: 0, scale: 1 },
    };
  }

  pc?: RTCPeerConnection;

  async componentWillUnmount() {
    if (this.pc) {
      this.pc.close();
    }
    this.setState({ playing: false });

    await CameraService.disconnect(this.props.camera?.id || '');
  }

  async componentDidMount() {
    if (this.props.camera?.id) {
      await CameraService.connect(this.props.camera?.id);
    }

    this.setState({
      loaded: true,
      focal: this.props.camera?.panorama || { x: 0, y: 0, scale: 1 },
    });
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
              `http://${location.host}/api/camera/rtspgo/${this.props['camera']?.id}`,
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
              <Grid item xs={4} key={0}>
                <CameraController
                  onFocalChange={async (val) => {
                    this.setState({ focal: val });
                    await this.props.DataActions?.updateItem('Camera', {
                      id: this.props.camera?.id,
                      panorama: val,
                    });
                  }}
                  panorama={this.state.focal}
                  camera={this.props.camera}
                  // onSavePosition={async (position) => {
                  //   await this.props.DataActions?.updateItem('Camera', {
                  //     ...this.props.camera,
                  //     ...{ position },
                  //   });
                  // }}
                  // onSetTolerance={async (tolerance) => {
                  //   await this.props.DataActions?.updateItem('Camera', {
                  //     ...this.props.camera,
                  //     ...{ tolerance },
                  //   });
                  //   await this.props.DataActions?.getById(
                  //     'Camera',
                  //     this.props.camera?.id || ''
                  //   );
                  // }}
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
          xs={this.props.hideControls ? 12 : 8}
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
                stream={this.state.streamSource}
                camera={this.props.camera}
                settings={this.props.Data?.Settings.CurrentItem}
                focal={this.state.focal}
              />
              {this.props.showPtz ? (
                <PtzController camera={this.props.camera}></PtzController>
              ) : null}
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
