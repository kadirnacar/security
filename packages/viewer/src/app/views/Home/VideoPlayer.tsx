import { CircularProgress } from '@mui/material';
import { Camera, Settings } from '@security/models';
import cv from 'opencv.js';
import React, { Component } from 'react';
import REGL from 'regl';
import yolo from 'tfjs-yolo';
import { IGlRect } from '../../models/IGlRect';
import { generateGuid } from '../../utils';

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

    this.handleVideoPlay = this.handleVideoPlay.bind(this);
    this.yoloAnimationFrame = this.yoloAnimationFrame.bind(this);

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
  regl?: REGL.Regl;
  videoAnimate?: REGL.Cancellable;
  yoloAnimate?: any;
  yoloDetect?;
  boxes: IGlRect[] = [];
  drawingRect?: IGlRect;
  drawingStartPoint?: { x: number; y: number };
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

    if (this.props.searchCanvas != prevProp.searchCanvas) {
      if (
        this.video.current &&
        this.canvas.current &&
        this.props.searchCanvas
      ) {
        let src: any = cv.imread(this.canvas2.current);
        let templ = cv.imread(this.props.searchCanvas.canvas);

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

        this.boxes.push({
          right: point.x,
          left: maxPoint.x,
          top: maxPoint.y,
          bottom: point.y,
        });
        src.delete();
        mask.delete();

        if (this.props.onDrawRect) {
          const id = generateGuid();
          this.props.onDrawRect(
            id || '',
            {
              right: point.x,
              left: maxPoint.x,
              top: maxPoint.y,
              bottom: point.y,
            },
            this.props.searchCanvas.canvas
          );
        }
      }
    }
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
                (this.video.current?.videoWidth || 0) - x.right,
                (this.video.current?.videoHeight || 0) - x.bottom,
              ])
              .flat()
              .concat(
                this.drawRects
                  .map((x) => [
                    x.left,
                    x.top,
                    (this.video.current?.videoWidth || 0) - x.right,
                    (this.video.current?.videoHeight || 0) - x.bottom,
                  ])
                  .flat()
                  .concat(
                    this.props.boxes
                      .map((x) => [
                        x.left,
                        x.top,
                        (this.video.current?.videoWidth || 0) - x.right,
                        (this.video.current?.videoHeight || 0) - x.bottom,
                      ])
                      .flat()
                  )
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

          try {
            if (this.regl)
              if (this.context2 && this.video.current && this.canvas.current) {
                this.context2.drawImage(
                  this.video.current,
                  0,
                  0,
                  this.canvas.current.width,
                  this.canvas.current.height
                );
              }
            drawFrame({
              videoT1: texture,
            });
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
      this.isDrawing = false;

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
              this.drawingStartPoint = { x: left, y: top };
              this.drawingRect = drawingRect;
            }
            this.isDrawing = true;
          }}
          onPointerUp={async (ev) => {
            if (this.canvas.current && this.video.current) {
              if (this.drawingRect && this.drawingStartPoint) {
                const box = (ev.target as HTMLElement).getBoundingClientRect();
                const ratioX = this.canvas.current?.width / box.width;
                const ratioY = this.canvas.current?.height / box.height;
                const mousePosX = (ev.clientX - box.left) * ratioX;
                const mousePosY = (ev.clientY - box.top) * ratioY;

                const d = this.drawingRect || {};
                if (mousePosX <= this.drawingStartPoint.x) {
                  d.left = mousePosX;
                } else {
                  d.right = mousePosX;
                }

                if (mousePosY <= this.drawingStartPoint.y) {
                  d.top = mousePosY;
                } else {
                  d.bottom = mousePosY;
                }

                let canvas = document.createElement('canvas');

                canvas.width = d.right - d.left;
                canvas.height = d.bottom - d.top;

                if (canvas.width <= 50 || canvas.height <= 50) {
                  return;
                }
                let ctx = canvas.getContext('2d');

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
                this.isDrawing = false;

                if (this.props.onDrawRect) {
                  const id = generateGuid();
                  await this.props.onDrawRect(id || '', d, canvas);
                }
              }
            }
            this.isDrawing = false;
          }}
          onPointerMove={(ev) => {
            if (this.canvas.current && this.isDrawing) {
              if (this.drawingRect && this.drawingStartPoint) {
                const box = (ev.target as HTMLElement).getBoundingClientRect();
                const ratioX = this.canvas.current?.width / box.width;
                const ratioY = this.canvas.current?.height / box.height;
                const mousePosX = (ev.clientX - box.left) * ratioX;
                const mousePosY = (ev.clientY - box.top) * ratioY;
                const d = this.drawingRect || {};

                if (mousePosX <= this.drawingStartPoint.x) {
                  d.left = mousePosX;
                } else {
                  d.right = mousePosX;
                }

                if (mousePosY <= this.drawingStartPoint.y) {
                  d.top = mousePosY;
                } else {
                  d.bottom = mousePosY;
                }

                // if (d.right < d.left) {
                //   const left = d.right;
                //   const right = d.left;
                //   d.left = left;
                //   d.right = right;
                // }

                // if (d.bottom < d.top) {
                //   const top = d.bottom;
                //   const bottom = d.top;
                //   d.top = top;
                //   d.bottom = bottom;
                // }

                this.drawingRect = d;
              }
            }
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
            // width: 200,
            // height: 200,
            // position: 'absolute',
          }}
          ref={this.video}
          onPlay={this.handleVideoPlay}
          onLoadedData={async () => {
            try {
              if (this.canvas.current && this.video.current) {
                this.canvas.current.width = this.video.current.videoWidth;
                this.canvas.current.height = this.video.current.videoHeight;
              }
              if (this.canvas2.current && this.video.current) {
                this.canvas2.current.width = this.video.current.videoWidth;
                this.canvas2.current.height = this.video.current.videoHeight;

                this.context2 = this.canvas2.current.getContext('2d');
              }
            } catch {}
          }}
        ></video>
      </div>
    );
  }
}
