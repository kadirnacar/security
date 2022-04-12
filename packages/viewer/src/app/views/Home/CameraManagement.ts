import cv from 'opencv.js';
import REGL from 'regl';
import yolo from 'tfjs-yolo';
import { IGlRect } from '../../models/IGlRect';

export class CameraManagement {
  constructor(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    maxBoxes: number = 10
  ) {
    this.canvas = canvas;
    this.video = video;
    this.maxBoxes = maxBoxes;
  }

  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  maxBoxes: number = 10;
  regl?: REGL.Regl;
  boxes: IGlRect[] = [];
  drawRects: IGlRect[] = [];
  drawingRect?: IGlRect;
  videoAnimate?: REGL.Cancellable;
  yoloAnimate?: any;
  yoloDetect?;
  drawingStartPoint?: { x: number; y: number };
  isDrawing: boolean = false;
  lens = {
    a: 1.0,
    b: 1.0,
    Fx: 0.0,
    Fy: 0.0,
    scale: 1.0,
  };
  last = 0;
  speed = 0.5;
  activateDetection = false;

  async initDetection() {
    this.activateDetection = true;
    if (!this.yoloDetect) {
      this.yoloDetect = await yolo.v3('model/v3/model.json');
    }
  }

  async init() {
    this.video.addEventListener(
      'loadeddata',
      this.handleVideoLoadeddata.bind(this)
    );

    this.canvas.addEventListener(
      'pointerdown',
      this.handleCanvasPointerDown.bind(this)
    );
    this.canvas.addEventListener(
      'pointerup',
      this.handleCanvasPointerUp.bind(this)
    );
    this.canvas.addEventListener(
      'pointermove',
      this.handleCanvasPointerMove.bind(this)
    );
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setLens(lens) {
    this.lens.Fx = lens.x;
    this.lens.Fy = lens.y;
    this.lens.scale = lens.scale;
  }

  stop() {
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

  handleCanvasPointerDown(ev) {
    if (this.canvas) {
      const box = (ev.target as HTMLElement).getBoundingClientRect();
      const ratioX = this.canvas.width / box.width;
      const ratioY = this.canvas.height / box.height;
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
  }

  handleCanvasPointerUp(ev) {
    if (this.canvas && this.video) {
      if (this.drawingRect && this.drawingStartPoint) {
        const box = (ev.target as HTMLElement).getBoundingClientRect();
        const ratioX = this.canvas.width / box.width;
        const ratioY = this.canvas.height / box.height;
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
            this.video,
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

        // if (this.props.onDrawRect) {
        //   const id = generateGuid();
        //   await this.props.onDrawRect(id || '', d, canvas);
        // }
      }
    }
    this.isDrawing = false;
  }

  handleCanvasPointerMove(ev) {
    if (this.canvas && this.isDrawing) {
      if (this.drawingRect && this.drawingStartPoint) {
        const box = (ev.target as HTMLElement).getBoundingClientRect();
        const ratioX = this.canvas.width / box.width;
        const ratioY = this.canvas.height / box.height;
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
  }

  handleVideoLoadeddata() {
    try {
      if (this.canvas && this.video) {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
      }
    } catch {}

    if (this.regl) {
      return;
    }

    if (this.canvas && this.video) {
      this.regl = REGL(this.canvas);
      let pos = [-1, -1, 1, -1, -1, 1, 1, 1, -1, 1, 1, -1];
      let texture: REGL.Texture2D;
      const x = this.canvas?.width / 2;
      const y = this.canvas?.height / 2 - 10;
      const z = this.canvas?.width / 2;
      const w = this.canvas?.height / 2;

      const drawFrame = this.regl({
        frag: getFragmentScript(this.maxBoxes),
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
                (this.video?.videoWidth || 0) - x.right,
                (this.video?.videoHeight || 0) - x.bottom,
              ])
              .flat()
              .concat(
                this.drawRects
                  .map((x) => [
                    x.left,
                    x.top,
                    (this.video?.videoWidth || 0) - x.right,
                    (this.video?.videoHeight || 0) - x.bottom,
                  ])
                  .flat()
                //   .concat(
                //     this.props.boxes
                //       .map((x) => [
                //         x.left,
                //         x.top,
                //         (this.video?.videoWidth || 0) - x.right,
                //         (this.video?.videoHeight || 0) - x.bottom,
                //       ])
                //       .flat()
                //   )
              );
            if (this.drawingRect) {
              flatBoxes.push(this.drawingRect.left);
              flatBoxes.push(this.drawingRect.top);
              flatBoxes.push(
                (this.video?.videoWidth || 0) - this.drawingRect.right
              );
              flatBoxes.push(
                (this.video?.videoHeight || 0) - this.drawingRect.bottom
              );
            }
            for (
              let index = flatBoxes.length;
              index < this.maxBoxes * 4;
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
        texture = this.regl.texture(this.video);

        this.videoAnimate = this.regl.frame(() => {
          try {
            if (
              this.video &&
              this.video.videoWidth > 32 &&
              this.video.currentTime > 0 &&
              !this.video.paused &&
              !this.video.ended &&
              this.video.readyState > 2
            ) {
              try {
                texture = texture.subimage(this.video);
              } catch {}
            } else if (!texture && this.regl) {
              texture = this.regl.texture();
            }
          } catch (ex) {
            if (this.regl) texture = this.regl.texture();
            console.warn(ex);
          }

          try {
            // if (this.regl)
            //   if (this.context2 && this.video && this.canvas) {
            //     this.context2.drawImage(
            //       this.video,
            //       0,
            //       0,
            //       this.canvas.width,
            //       this.canvas.height
            //     );
            //   }
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
        // this.yoloAnimate = requestAnimationFrame(this.yoloAnimationFrame);
      }
    }
  }

  async yoloAnimationFrame(timeStamp) {
    let timeInSecond = timeStamp / 1000;
    if (timeInSecond - this.last >= this.speed) {
      if (this.canvas && this.activateDetection && this.yoloDetect) {
        // const boxes = await this.yoloDetect.predict(this.canvas.current);
        this.yoloDetect.predict(this.canvas).then((boxes) => {
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

  searchImage(searchCanvas) {
    if (this.video && searchCanvas && this.canvas) {
      let src: any = cv.imread(this.video);
      //   let src: any = cv.imread(this.canvas2.current);
      let templ = cv.imread(searchCanvas);

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

      //   if (this.props.onDrawRect) {
      //     const id = generateGuid();
      //     this.props.onDrawRect(
      //       id || '',
      //       {
      //         right: point.x,
      //         left: maxPoint.x,
      //         top: maxPoint.y,
      //         bottom: point.y,
      //       },
      //       this.props.searchCanvas.canvas
      //     );
      //   }
    }
  }
}

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
