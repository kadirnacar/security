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
  onDrawRect?: (boxe: IGlRect) => void;
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

      if (this.props.onDrawRect) {
        this.cameraManagement.onDrawRect = this.props.onDrawRect;
      }

      // this.cameraManagement.onSearchRect =
      //   this.handleCameraManagementSearchRect.bind(this);
      // this.cameraManagement.setSearchBoxes(this.props.searchBoxes);
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
      }

      // this.cameraManagement.setContext(this.context);

      // if (this.props.searchCanvas != prevProp.searchCanvas) {
      //   setTimeout(async () => {
      //     if (this.cameraManagement) {
      //       await this.cameraManagement.searchImage(this.props.searchCanvas);
      //       if (this.props.onSearched) {
      //         this.props.onSearched();
      //       }
      //     }
      //   }, 500);
      // }
      // this.cameraManagement.setLens(this.props.focal);
      this.cameraManagement.setContext(this.context);
      // this.cameraManagement.setSearchBoxes(this.props.searchBoxes);
      // this.cameraManagement.setSelectedBoxIndex(this.props.selectedBoxIndex);
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
