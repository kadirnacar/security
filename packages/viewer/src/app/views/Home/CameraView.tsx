import { PlayCircleFilled } from '@mui/icons-material';
import { CircularProgress, Divider, Grid, IconButton } from '@mui/material';
import {
  Camera,
  ICamPosition,
  IGlRect,
  IResulation,
  Settings,
} from '@security/models';
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
  boxes: IGlRect[];
  searchCanvases?: { id: string; canvas: HTMLCanvasElement }[];
  selectedBoxIndex: number;
}

type Props = {
  camera?: Camera;
  DataActions?: DataActions<Camera>;
  Data?: DataState;
  settings: Settings;
  hideControls?: boolean;
  showPtz?: boolean;
  searchBoxes: IGlRect[];
  searchCanvas?: {
    id: string;
    canvas: HTMLCanvasElement;
    camPos: ICamPosition;
    resulation: IResulation;
  };
  onDrawRect?: (rect: IGlRect[]) => void;
  onSearchRect?: (rect: IGlRect[]) => void;
  onSearchRemove?: (index) => void;
  onFindRect?: (rect: IGlRect) => void;
  onSearched?: () => void;
  activateDetection?: boolean;
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
      boxes: [],
      selectedBoxIndex: -1,
    };
  }

  pc?: RTCPeerConnection;
  videoPlayer?;

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
              <Grid item xs={3} key={0}>
                <CameraController
                  onFocalChange={async (val) => {
                    // this.setState({ focal: val });
                    await this.props.DataActions?.updateItem('Camera', {
                      id: this.props.camera?.id,
                      panorama: val,
                    });
                  }}
                  onClearImages={() => {
                    this.setState({ boxes: [] });
                  }}
                  onRemoveImage={(img, index) => {
                    const { boxes } = this.state;
                    boxes.splice(index, 1);
                    this.setState({ boxes });
                  }}
                  onRemoveSearch={(img, index) => {
                    if (this.props.onSearchRemove) {
                      this.props.onSearchRemove(index);
                    }
                  }}
                  selectedBoxIndex={this.state.selectedBoxIndex}
                  onClickImage={async (item, index) => {
                    if (this.props.camera?.isPtz) {
                      const speed = 2.0;
                      await CameraService.pos(
                        this.props.camera?.id || '',
                        item.camPos,
                        {
                          x: speed,
                          y: speed,
                          z: speed,
                        }
                      );
                    }
                    this.setState({ selectedBoxIndex: index + 1 });
                  }}
                  onClickFindImage={(item, index) => {
                    if (this.props.onFindRect) {
                      this.props.onFindRect(item);
                    }
                  }}
                  onCheckPhoto={() => {
                    this.videoPlayer.takePhoto();
                  }}
                  boxes={this.state.boxes}
                  searchBoxes={this.props.searchBoxes}
                  panorama={this.state.focal}
                  camera={this.props.camera}
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
                childRef={(item) => {
                  this.videoPlayer = item;
                }}
                activateDetection={this.props.activateDetection}
                stream={this.state.streamSource}
                camera={this.props.camera}
                settings={this.props.Data?.Settings.CurrentItem}
                focal={this.props.camera?.panorama}
                searchCanvas={this.props.searchCanvas}
                boxes={this.state.boxes}
                searchBoxes={this.props.searchBoxes}
                selectedBoxIndex={this.state.selectedBoxIndex}
                onSearched={() => {
                  this.setState({ searchCanvases: undefined });
                  if (this.props.onSearched) {
                    this.props.onSearched();
                  }
                }}
                onDrawRect={(rects) => {
                  this.setState({
                    boxes: rects,
                    selectedBoxIndex: rects.length,
                  });
                  if (this.props.onDrawRect) {
                    this.props.onDrawRect(rects);
                  }
                }}
                onSearchRect={(rects) => {
                  // this.setState({
                  //   searchBoxes: rects,
                  //   selectedBoxIndex: rects.length,
                  // });
                  if (this.props.onSearchRect) {
                    this.props.onSearchRect(rects);
                  }
                }}
              />
              {this.props.showPtz ? (
                <PtzController
                  camera={this.props.camera}
                  onChangePos={async (pos) => {
                    // if (this.props.camera)
                    // await this.props.DataActions?.getById(
                    //   'Camera',
                    //   this.props.camera.id || ''
                    // );
                    const d = this.props.Data?.Camera.List.find(
                      (x) => x.id == this.props.camera?.id
                    );
                    if (d) {
                      d.position = pos;
                    }
                  }}
                ></PtzController>
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
