import { CircularProgress } from '@mui/material';
import { IGlRect, Settings } from '@security/models';
import React, { Component } from 'react';
import { CamContext } from '../../utils';
import { CameraManagement } from './CameraManagement';

type Props = {
  stream?: MediaStream;
  settings?: Settings;
  focal?: any;
  activateDetection?: boolean;
};

type State = {
  loaded: boolean;
};

export default class VideoPlayer extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.video = React.createRef<HTMLVideoElement>();
    this.canvas = React.createRef<HTMLCanvasElement>();

    this.state = {
      loaded: false,
    };
  }

  static defaultProps = {
    boxes: [],
    searchBoxes: [],
    selectedBoxIndex: -1,
  };
  static contextType = CamContext;
  context!: React.ContextType<typeof CamContext>;

  video: React.RefObject<HTMLVideoElement>;
  canvas: React.RefObject<HTMLCanvasElement>;
  cameraManagement?: CameraManagement;

  async componentDidMount() {
    if (this.canvas.current && this.video.current && this.context.camera) {
      this.cameraManagement = new CameraManagement(
        this.canvas.current,
        this.video.current,
        this.context,
        this.props.settings?.maxBoxes
      );
      this.cameraManagement.init();
      this.context.camOptions.takePhoto = this.cameraManagement.takePhoto.bind(
        this.cameraManagement
      );
      if (this.context.camera.isPtz && this.context.pursuit) {
        this.context.pursuit.getShapshotCanvas = (camId) => {
          if (camId == this.context.camera?.id) {
            return this.canvas.current || undefined;
          }
          return undefined;
        };
      }

      // this.cameraManagement.onSearchRect =
      //   this.handleCameraManagementSearchRect.bind(this);
      if (this.props.activateDetection) {
        this.cameraManagement.initDetection();

        this.cameraManagement.setSpeed(
          this.props.settings?.framePerSecond || 0.5
        );
      }
    }
    this.setState({ loaded: true });
  }

  async componentDidUpdate(prevProp, prevState) {
    if (this.video.current && !this.l) {
      this.video.current.srcObject = this.props.stream || null;
    }

    if (this.cameraManagement) {
      if (this.props.activateDetection) {
        this.cameraManagement.initDetection();
        this.cameraManagement.setContext(this.context);
      }
    }
  }

  async componentWillUnmount() {
    if (this.cameraManagement) {
      this.cameraManagement.stop();
    }
  }

  l = false;

  num = 0;
  isStop = false;
  cachedBoxes: any[] = [];

  render() {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',

          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'center',
          alignContent: 'center',
        }}
      >
        {!this.state.loaded ? (
          <div
            style={{
              position: 'absolute',
              background: '#cccccc70',
              display: 'flex',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
          >
            <CircularProgress style={{ margin: 'auto' }} />
          </div>
        ) : null}
        <canvas
          ref={this.canvas}
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
            margin: 'auto',
          }}
        ></canvas>

        <video
          autoPlay
          controls={false}
          style={{
            width: 0,
            visibility: 'hidden',
            height: 0,
          }}
          ref={this.video}
        ></video>
      </div>
    );
  }
}
