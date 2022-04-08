import { CircularProgress } from '@mui/material';
import { Camera, Settings } from '@security/models';
import React, { Component } from 'react';
import REGL from 'regl';
import yolo from 'tfjs-yolo';
import cv from 'opencv.js';

let vert = `
precision mediump float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = vec2((1.0 - position.x), position.y);
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }
`;

const getFragmentScript = (boxNum) => `
precision mediump float;
uniform sampler2D uSampler;
varying vec2 uv;
uniform vec3 uLensS;
uniform vec2 uLensF;
uniform vec2 resolution;
uniform vec4 box[${boxNum}];
uniform vec4 boxColor;
uniform vec4 iMouse;
uniform float showSplitter;


vec2 GLCoord2TextureCoord(vec2 glCoord) {
	return glCoord  * vec2(1.0, -1.0) / 2.0 + vec2(0.5, 0.5);
}

vec4 draw_rect(in vec2 bottomLeft, in vec2 topRight, in float lineWidth, in vec2 texCoord, in vec4 Mon)
{
    vec2 lineWidth_ = vec2(lineWidth / resolution.x, lineWidth / resolution.y);

    vec2 topRight_ = topRight; //vec2(1.0) - topRight;

    vec2 leftBottom = smoothstep(bottomLeft, bottomLeft + lineWidth_, texCoord);
    vec2 rightTop = smoothstep(topRight_, topRight_ + lineWidth_, 1.0 - texCoord);

    vec2 leftBottomInside = smoothstep(bottomLeft - lineWidth_, bottomLeft , texCoord);
    vec2 rightTopInside = smoothstep(topRight_ - lineWidth_, topRight_, 1.0 - texCoord);

    float pctOuter = leftBottom.x * rightTop.x * leftBottom.y * rightTop.y;
    float pctInside = leftBottomInside.x * rightTopInside.x * leftBottomInside.y * rightTopInside.y;

    float pct = pctInside - pctOuter;
    vec4 finalColor = mix(Mon, boxColor,  pct * boxColor.a);
    return finalColor;
}

void main() {
  float scale = uLensS.z;
	vec2 vPos = vec2(uv.x * 2.0 - 1.0, (1.0 - uv.y * 2.0));
	float Fx = uLensF.x;
	float Fy = uLensF.y;

	vec2 vMapping = vPos.xy;
	vMapping.x = vMapping.x + ((pow(vPos.y, 2.0) / scale) * vPos.x / scale) * -Fx;
	vMapping.y = vMapping.y + ((pow(vPos.x, 2.0) / scale) * vPos.y / scale) * -Fy;
	vMapping = vMapping * uLensS.xy;

	vMapping = GLCoord2TextureCoord(vMapping / scale);

  vec4 MonA = texture2D(uSampler, vMapping);

  for (int i = 0; i < ${boxNum}; i++) {

    float pH = box[i].x / resolution.x;
    float pV = box[i].y / resolution.y;

    float pH1 = box[i].z / resolution.x;
    float pV1 = box[i].w / resolution.y;

    MonA = draw_rect(vec2(pH, pV), vec2(pH1, pV1), 10.0, uv, MonA);
  }
  
  gl_FragColor = MonA;
}
`;

export interface IGlRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

type Props = {
  stream?: MediaStream;
  camera?: Camera;
  settings?: Settings;
  focal?: any;
  activateDetection?: boolean;
  onDrawRect?: (rect: IGlRect, canvas: HTMLCanvasElement) => void;
};

type State = {
  loaded: boolean;
  boxes: any[];
};

export default class VideoPlayer extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.handleVideoPlay = this.handleVideoPlay.bind(this);
    this.yoloAnimationFrame = this.yoloAnimationFrame.bind(this);

    this.video = React.createRef<HTMLVideoElement>();
    this.canvas = React.createRef<HTMLCanvasElement>();
    this.image = React.createRef<HTMLImageElement>();

    this.state = {
      loaded: false,
      boxes: [],
    };
  }

  image: React.RefObject<HTMLImageElement>;
  video: React.RefObject<HTMLVideoElement>;
  canvas: React.RefObject<HTMLCanvasElement>;
  regl?: REGL.Regl;
  videoAnimate?: REGL.Cancellable;
  yoloAnimate?: any;
  yoloDetect?;
  boxes: IGlRect[] = [];
  drawingRect?: IGlRect;
  drawRects: IGlRect[] = [];
  isDrawing: boolean = false;

  lens = {
    a: 1.0,
    b: 1.0,
    Fx: 0.0,
    Fy: 0.0,
    scale: 1.0,
  };

  async componentDidMount() {
    if (this.props.activateDetection) {
      this.yoloDetect = await yolo.v3('model/v3/model.json');
    }
    // this.yoloDetect = await yolo.v3tiny('model/v3tiny/model.json');
    // this.yoloDetect = await yolov3({ modelUrl: 'model/yolov3/model.json' });
    this.speed = this.props.settings?.framePerSecond || 0.5;
    this.setState({ loaded: true });
  }

  async componentDidUpdate(prevProp, prevState) {
    if (this.video.current && !this.l) {
      this.video.current.srcObject = this.props.stream || null;
    }
    if (this.props.activateDetection && !this.yoloDetect) {
      this.yoloDetect = await yolo.v3('model/v3/model.json');
    }
    this.lens.Fx = this.props.focal.x;
    this.lens.Fy = this.props.focal.y;
    this.lens.scale = this.props.focal.scale;
  }

  async componentWillUnmount() {
    if (this.videoAnimate) {
      try {
        this.videoAnimate.cancel();
      } catch (ex: any) {
        console.warn(`Prevented unhandled exception: ${ex?.message}`);
      }
    }
    if (this.yoloAnimate) {
      try {
        cancelAnimationFrame(this.yoloAnimate);
      } catch (ex: any) {
        console.warn(`Prevented unhandled exception: ${ex?.message}`);
      }
    }
  }

  l = false;

  handleVideoPlay() {
    // if (!this.l) {
    //   this.l = true;
    //   this.yoloAnimationFrame(0);
    // }
    if (this.regl || !this.props.settings) {
      return;
    }
    if (this.canvas.current && this.video.current) {
      this.regl = REGL(this.canvas.current);
      let pos = [-1, -1, 1, -1, -1, 1, 1, 1, -1, 1, 1, -1];
      let texture: REGL.Texture2D;
      const x = this.canvas.current?.width / 2;
      const y = this.canvas.current?.height / 2 - 10;
      const z = this.canvas.current?.width / 2;
      const w = this.canvas.current?.height / 2;

      const drawFrame = this.regl({
        frag: getFragmentScript(this.props.settings?.maxBoxes),
        vert: vert,
        attributes: {
          position: pos,
        },
        uniforms: {
          uSampler: (ctx, { videoT1 }: any) => {
            return videoT1;
          },
          showSplitter: () => {
            return 0;
          },
          iMouse: ({ viewportHeight }) => {
            return [x, viewportHeight - y, z, viewportHeight - w];
          },
          uLensS: () => {
            return [this.lens.a, this.lens.b, this.lens.scale];
          },
          uLensF: () => {
            return [this.lens.Fx, this.lens.Fy];
          },
          resolution: (context, props) => {
            return [context.viewportWidth, context.viewportHeight];
          },
          boxColor: () => {
            return [1, 0, 0, 1];
          },
          box: () => {
            const flatBoxes = this.boxes
              .map((x) => [
                x.left,
                x.top,
                // x.right,
                // x.bottom
                (this.video.current?.videoWidth || 0) - x.right,
                (this.video.current?.videoHeight || 0) - x.bottom,
              ])
              .flat()
              .concat(
                this.drawRects
                  .map((x) => [
                    x.left,
                    x.top,
                    // x.right,
                    // x.bottom
                    (this.video.current?.videoWidth || 0) - x.right,
                    (this.video.current?.videoHeight || 0) - x.bottom,
                  ])
                  .flat()
              );
            if (this.drawingRect) {
              flatBoxes.push(this.drawingRect.left);
              flatBoxes.push(this.drawingRect.top);
              flatBoxes.push(
                (this.video.current?.videoWidth || 0) - this.drawingRect.right
              );
              flatBoxes.push(
                (this.video.current?.videoHeight || 0) - this.drawingRect.bottom
              );
            }
            for (
              let index = flatBoxes.length;
              index < (this.props.settings?.maxBoxes || 10) * 4;
              index++
            ) {
              flatBoxes.push(-50);
            }
            return flatBoxes;
          },
        },
        count: pos.length / 2,
      });

      if (this.regl) {
        texture = this.regl.texture(this.video.current);

        this.videoAnimate = this.regl.frame(() => {
          try {
            if (
              this.video.current &&
              this.video.current.videoWidth > 32 &&
              this.video.current.currentTime > 0 &&
              !this.video.current.paused &&
              !this.video.current.ended &&
              this.video.current.readyState > 2
            ) {
              try {
                texture = texture.subimage(this.video.current);
              } catch {}
            } else if (!texture && this.regl) {
              texture = this.regl.texture();
            }
          } catch (ex) {
            if (this.regl) texture = this.regl.texture();
            console.warn(ex);
          }

          // for (
          //   let index = this.boxes.length;
          //   index < (this.props.settings?.maxBoxes || 10) * 4;
          //   index++
          // ) {
          //   this.boxes.push(-50);
          // }

          try {
            if (this.regl)
              drawFrame({
                videoT1: texture,
              });
            // await this.yoloAnimationFrame(0);
          } catch {
            if (this.videoAnimate) {
              try {
                this.videoAnimate.cancel();
              } catch (ex: any) {
                console.warn(`Prevented unhandled exception: ${ex?.message}`);
              }
            }
          }
        });
        this.yoloAnimate = requestAnimationFrame(this.yoloAnimationFrame);
      }
    }
  }

  last = 0;
  num = 0;
  speed = 0.5;
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
    // const xA = Math.max(boxA[0], boxB[0]);
    // const yA = Math.max(boxA[1], boxB[1]);
    // const xB = Math.min(boxA[2], boxB[2]);
    // const yB = Math.min(boxA[3], boxB[3]);

    // const interArea = Math.max(0, xB - xA + 1) * Math.max(0, yB - yA + 1);

    // const boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1);

    // return interArea / boxAArea;
  }

  chunkArray(arr, chunkSize) {
    return [].concat.apply(
      [],
      arr.map(function (elem, i) {
        return i % chunkSize ? [] : [arr.slice(i, i + chunkSize)];
      })
    );
  }

  async yoloAnimationFrame(timeStamp) {
    let timeInSecond = timeStamp / 1000;
    if (timeInSecond - this.last >= this.speed) {
      if (
        this.canvas.current &&
        this.props.activateDetection &&
        this.yoloDetect
      ) {
        // const boxes = await this.yoloDetect.predict(this.canvas.current);
        this.yoloDetect.predict(this.canvas.current).then((boxes) => {
          this.boxes = boxes;
          this.yoloAnimate = requestAnimationFrame(this.yoloAnimationFrame);
        });
        // const boxes = await this.yoloDetect(this.video.current);

        // this.boxes = boxes;
        // this.setState({ boxes });
      }
      this.last = timeInSecond;
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
          onPointerDown={(ev) => {
            if (this.canvas.current) {
              const box = (ev.target as HTMLElement).getBoundingClientRect();
              const ratioX = this.canvas.current?.width / box.width;
              const ratioY = this.canvas.current?.height / box.height;
              const left = (ev.clientX - box.left) * ratioX;
              const top = (ev.clientY - box.top) * ratioY;

              let drawingRect: IGlRect = {
                left: left,
                top: top,
                right: left,
                bottom: top,
              };
              this.drawingRect = drawingRect;
            }
            this.isDrawing = true;
          }}
          onPointerUp={(ev) => {
            if (this.canvas.current && this.video.current) {
              if (this.drawingRect) {
                const box = (ev.target as HTMLElement).getBoundingClientRect();
                const ratioX = this.canvas.current?.width / box.width;
                const ratioY = this.canvas.current?.height / box.height;
                const right = (ev.clientX - box.left) * ratioX;
                const bottom = (ev.clientY - box.top) * ratioY;

                const d = this.drawingRect || {};
                d.right = right;
                d.bottom = bottom;
                // this.drawRects.push(d);
                this.drawingRect = undefined;

                let canvas = document.createElement('canvas');
                let canvasOrj = document.createElement('canvas');

                canvasOrj.width = this.canvas.current.width;
                canvasOrj.height = this.canvas.current.height;

                canvas.width = d.right - d.left;
                canvas.height = d.bottom - d.top;

                let ctx = canvas.getContext('2d');
                let ctxOrj = canvasOrj.getContext('2d');

                if (ctx) {
                  ctx.drawImage(
                    this.video.current,
                    d.left,
                    d.top,
                    canvas.width,
                    canvas.height,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                }

                if (ctxOrj) {
                  ctxOrj.drawImage(
                    this.video.current,
                    0,
                    0,
                    canvasOrj.width,
                    canvasOrj.height
                  );
                }

                let src: any = cv.imread(canvasOrj);
                let templ = cv.imread(canvas);
                // let dst = new cv.Mat();

                let result_cols = src.cols - templ.cols + 1;
                let result_rows = src.rows - templ.rows + 1;

                var dst = new cv.Mat(result_cols, result_rows, cv.CV_32FC1);
                let mask = new cv.Mat();

                cv.matchTemplate(src, templ, dst, cv.TM_CCORR_NORMED, mask);
                cv.normalize(dst, dst, 0, 1, cv.NORM_MINMAX, -1, new cv.Mat());

                let result = cv.minMaxLoc(dst, mask);

                let maxPoint = result.maxLoc;
                let color = new cv.Scalar(255, 0, 0, 255);

                let point = new cv.Point(
                  maxPoint.x + templ.cols,
                  maxPoint.y + templ.rows
                );
                cv.rectangle(src, maxPoint, point, color, 2, cv.LINE_8, 0);
                console.log(maxPoint, point, d);
                // cv.imshow('canvasOutput', src);

                src.delete();
                mask.delete();

                if (this.props.onDrawRect) {
                  this.props.onDrawRect(d, canvas);
                }
              }
            }
            this.isDrawing = false;
          }}
          onPointerMove={(ev) => {
            if (this.canvas.current && this.isDrawing) {
              if (this.drawingRect) {
                const box = (ev.target as HTMLElement).getBoundingClientRect();
                const ratioX = this.canvas.current?.width / box.width;
                const ratioY = this.canvas.current?.height / box.height;
                const right = (ev.clientX - box.left) * ratioX;
                const bottom = (ev.clientY - box.top) * ratioY;

                const d = this.drawingRect || {};
                d.right = right;
                d.bottom = bottom;
                this.drawingRect = d;
              }
            }
          }}
        ></canvas>
        {/* {this.state.boxes.map((x, i) => {
          const v = this.video.current?.getBoundingClientRect();
          const vWidth = this.video.current?.videoWidth;
          const vHeight = this.video.current?.videoHeight;
          return (
            <div
              key={i}
              style={{
                border: '2px solid #ff0000',
                position: 'absolute',
                top: (x.top * (v?.height || 1)) / (vHeight || 1),
                left: (x.left * (v?.width || 1)) / (vWidth || 1),
                width: (x.width * (v?.width || 1)) / (vWidth || 1),
                height: (x.height * (v?.height || 1)) / (vHeight || 1),
              }}
            ></div>
          );
        })} */}

        <video
          autoPlay
          controls={false}
          style={{
            width: 0,
            visibility: 'hidden',
            height: 0,
          }}
          ref={this.video}
          onPlay={this.handleVideoPlay}
          onLoadedData={async () => {
            try {
              if (this.canvas.current && this.video.current) {
                this.canvas.current.width = this.video.current.videoWidth;
                this.canvas.current.height = this.video.current.videoHeight;
              }
            } catch {}
          }}
        ></video>
      </div>
    );
  }
}
