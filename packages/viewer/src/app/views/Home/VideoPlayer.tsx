import { CircularProgress } from '@mui/material';
import {
  Camera,
  ICamPosition,
  IGlRect,
  IResulation,
  Settings,
} from '@security/models';
import React, { Component } from 'react';
import { generateGuid } from '../../utils';
import { CameraManagement } from './CameraManagement';

type Props = {
  stream?: MediaStream;
  camera?: Camera;
  settings?: Settings;
  focal?: any;
  activateDetection?: boolean;
  onDrawRect?: (rects: IGlRect[]) => void;
  onSearchRect?: (rects: IGlRect[]) => void;
  onSearched?: () => void;
  searchCanvas?: {
    id: string;
    canvas: HTMLCanvasElement;
    camPos: ICamPosition;
    resulation: IResulation;
  };
  boxes: IGlRect[];
  searchBoxes: IGlRect[];
  selectedBoxIndex?: number;
  childRef: (item) => void;
};

type State = {
  loaded: boolean;
};

export default class VideoPlayer extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.video = React.createRef<HTMLVideoElement>();
    this.canvas = React.createRef<HTMLCanvasElement>();

    if (this.props.childRef) {
      this.props.childRef(this);
    }
    this.state = {
      loaded: false,
    };
  }

  static defaultProps = {
    boxes: [],
    searchBoxes: [],
    selectedBoxIndex: -1,
  };

  video: React.RefObject<HTMLVideoElement>;
  canvas: React.RefObject<HTMLCanvasElement>;
  cameraManagement?: CameraManagement;

  async componentDidMount() {
    if (this.canvas.current && this.video.current && this.props.camera) {
      this.cameraManagement = new CameraManagement(
        this.canvas.current,
        this.video.current,
        this.props.camera,
        this.props.settings?.maxBoxes
      );
      this.cameraManagement.init();
      this.cameraManagement.onDrawRect =
        this.handleCameraManagementDrawRect.bind(this);
      this.cameraManagement.onSearchRect =
        this.handleCameraManagementSearchRect.bind(this);
      this.cameraManagement.setBoxes(this.props.boxes);
      this.cameraManagement.setSearchBoxes(this.props.searchBoxes);

      if (this.props.activateDetection) {
        this.cameraManagement.initDetection();
        this.cameraManagement.setSelectedBoxIndex(this.props.selectedBoxIndex);
        this.cameraManagement.setSpeed(
          this.props.settings?.framePerSecond || 0.5
        );
      }
    }
    this.setState({ loaded: true });
  }

  async handleCameraManagementSearchRect(boxes: IGlRect[]) {
    if (this.props.onSearchRect) {
      await this.props.onSearchRect(boxes);
    }
  }

  async handleCameraManagementDrawRect(boxes: IGlRect[]) {
    if (this.props.onDrawRect) {
      await this.props.onDrawRect(boxes);
    }
  }

  async componentDidUpdate(prevProp, prevState) {
    if (this.video.current && !this.l) {
      this.video.current.srcObject = this.props.stream || null;
    }

    if (this.cameraManagement) {
      if (this.props.activateDetection) {
        this.cameraManagement.initDetection();
      }

      if (this.props.searchCanvas != prevProp.searchCanvas) {
        setTimeout(async () => {
          if (this.cameraManagement) {
            await this.cameraManagement.searchImage(this.props.searchCanvas);
            if (this.props.onSearched) {
              this.props.onSearched();
            }
          }
        }, 500);
      }
      this.cameraManagement.setLens(this.props.focal);
      this.cameraManagement.setBoxes(this.props.boxes);
      this.cameraManagement.setSearchBoxes(this.props.searchBoxes);
      this.cameraManagement.setSelectedBoxIndex(this.props.selectedBoxIndex);
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

  intersect(boxA, boxB) {
    const xA = Math.max(boxA.left, boxB.left);
    const yA = Math.max(boxA.top, boxB.top);
    const xB = Math.min(boxA.right, boxB.right);
    const yB = Math.min(boxA.bottom, boxB.bottom);

    const interArea = Math.max(0, xB - xA + 1) * Math.max(0, yB - yA + 1);

    const boxAArea =
      (boxA.right - boxA.left + 1) * (boxA.bottom - boxA.top + 1);

    return interArea / boxAArea;
  }

  chunkArray(arr, chunkSize) {
    return [].concat.apply(
      [],
      arr.map(function (elem, i) {
        return i % chunkSize ? [] : [arr.slice(i, i + chunkSize)];
      })
    );
  }

  async takePhoto() {
    if (this.canvas.current && this.video.current) {
      let canvas = document.createElement('canvas');

      canvas.width = this.canvas.current?.width;
      canvas.height = this.canvas.current?.height;

      if (canvas.width <= 50 || canvas.height <= 50) {
        return;
      }
      let ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          this.video.current,
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
      // this.isDrawing = false;

      if (this.props.onDrawRect) {
        const id = generateGuid();
        this.props.boxes.push({
          id,
          left: 0,
          top: 0,
          right: canvas.width,
          bottom: canvas.height,
          image: canvas,
          camPos: {
            x: this.props.camera?.position?.x,
            y: this.props.camera?.position?.y,
            z: this.props.camera?.position?.z,
          },
          resulation: { width: canvas.width, height: canvas.height },
        });
        await this.props.onDrawRect(this.props.boxes);
      }
    }
  }

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
