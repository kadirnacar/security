import { PlayCircleFilled } from '@mui/icons-material';
import { CircularProgress, IconButton } from '@mui/material';
import { Camera, Settings } from '@security/models';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DataActions } from '../../reducers/Data/actions';
import { DataState } from '../../reducers/Data/state';
import { CameraService } from '../../services/CameraService';
import { ApplicationState } from '../../store';
import CameraController from './CameraController';
import VideoPlayer from './VideoPlayer';

interface State {
  streamSource?: MediaStream;
  loaded: boolean;
  playing: boolean;
  focal: any;
}

type Props = {
  camera?: Camera;
  DataActions?: DataActions<Camera>;
  Data?: DataState;
  settings: Settings;
  hideControls?: boolean;
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
      <>
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
              settings={this.props.settings}
              focal={this.state.focal}
            />
            {!this.props.hideControls ? (
              <CameraController
                onFocalChange={(val) => {
                  this.setState({ focal: val });
                }}
                camera={this.props.camera}
                onSavePosition={async (position) => {
                  await this.props.DataActions?.updateItem('Camera', {
                    ...this.props.camera,
                    ...{ position },
                  });
                }}
                onSetTolerance={async (tolerance) => {
                  await this.props.DataActions?.updateItem('Camera', {
                    ...this.props.camera,
                    ...{ tolerance },
                  });
                  await this.props.DataActions?.getById(
                    'Camera',
                    this.props.camera?.id || ''
                  );
                }}
              />
            ) : null}
          </>
        )}
      </>
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
