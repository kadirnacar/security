import { CircularProgress } from '@mui/material';
import { Camera, Settings } from '@security/models';
import React, { Component } from 'react';
import { IGlRect } from '../../models/IGlRect';
import { generateGuid } from '../../utils';
import { CameraManagement } from './CameraManagement';

type Props = {
  stream?: MediaStream;
  camera?: Camera;
  settings?: Settings;
  focal?: any;
  activateDetection?: boolean;
  onDrawRect?: (id: string, rect: IGlRect, canvas: HTMLCanvasElement) => void;
  searchCanvas?: { id: string; canvas: HTMLCanvasElement };
  boxes: any[];
  childRef: (item) => void;
};

type State = {
  loaded: boolean;
  boxes: any[];
};

export default class VideoPlayer extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.video = React.createRef<HTMLVideoElement>();
    this.canvas = React.createRef<HTMLCanvasElement>();
    this.canvas2 = React.createRef<HTMLCanvasElement>();
    this.image = React.createRef<HTMLImageElement>();

    if (this.props.childRef) {
      this.props.childRef(this);
    }
    this.state = {
      loaded: false,
      boxes: [],
    };
  }

  static defaultProps = {
    boxes: [],
  };

  image: React.RefObject<HTMLImageElement>;
  video: React.RefObject<HTMLVideoElement>;
  canvas: React.RefObject<HTMLCanvasElement>;
  canvas2: React.RefObject<HTMLCanvasElement>;
  context2: CanvasRenderingContext2D | null = null;
  boxes: IGlRect[] = [];

  cameraManagement?: CameraManagement;

  async componentDidMount() {
    if (this.canvas.current && this.video.current) {
      this.cameraManagement = new CameraManagement(
        this.canvas.current,
        this.video.current,
        this.props.settings?.maxBoxes
      );
      this.cameraManagement.init();
    }

    if (this.props.activateDetection && this.cameraManagement) {
      this.cameraManagement.initDetection();
      this.cameraManagement.setSpeed(
        this.props.settings?.framePerSecond || 0.5
      );
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

      if (this.props.searchCanvas != prevProp.searchCanvas) {
        this.cameraManagement.searchImage(this.props.searchCanvas);
      }
      this.cameraManagement.setLens(this.props.focal);
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
        await this.props.onDrawRect(
          id || '',
          { left: 0, top: 0, right: 0, bottom: 0 },
          canvas
        );
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

        <canvas
          ref={this.canvas2}
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
