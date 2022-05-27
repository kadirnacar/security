import { Keyboard } from '@mui/icons-material';
import { ICamPosition, IGlRect } from '@security/models';
// import cv from 'opencv.js';
import REGL from 'regl';
import yolo from 'tfjs-yolo';
import { generateGuid, ICamComtext } from '../../utils';

export class CameraManagement {
  constructor(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    context: ICamComtext,
    maxBoxes: number = 10
  ) {
    this.canvas = canvas;
    this.video = video;
    this.maxBoxes = maxBoxes;
    this.context = context;
    this.yoloAnimationFrame = this.yoloAnimationFrame.bind(this);
    this.drawVideoToCanvas = this.drawVideoToCanvas.bind(this);
  }

  videoLoaded = false;
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  context: ICamComtext;
  maxBoxes: number = 10;
  regl?: REGL.Regl;
  videoAnimate?: REGL.Cancellable;
  yoloAnimate?: any;
  yoloDetect?;
  drawingStartPoint?: { x: number; y: number };
  isDrawing: boolean = false;
  drawingBox?: any;
  isDragging: boolean = false;
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
  pointSize = 10;

  async initDetection() {
    this.activateDetection = true;
    if (!this.yoloDetect) {
      this.yoloDetect = await yolo.v3('model/v3/model.json');
      // this.yoloDetect = await yolo.v3tiny('model/yolov3/model.json');
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
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Delete') {
        if (this.drawingBox) {
          this.drawingBox = null;
        }
        if (this.pointOverIndex > -1 && this.context.parent?.camera) {
          this.context.parent?.camera.cameras[
            this.context.camera?.id || ''
          ].boxes.splice(this.pointOverIndex, 1);
          this.pointOverIndex = -1;
          this.context.parent.selectedPointIndex = -1;
        }
      }
    });
  }

  setContext(context) {
    this.context = context;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setLens(lens: ICamPosition) {
    if (lens) {
      this.lens.Fx = lens.x;
      this.lens.Fy = lens.y;
      this.lens.scale = lens.z;
    }
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
    if (this.drawAnimate) {
      try {
        cancelAnimationFrame(this.drawAnimate);
      } catch (ex: any) {
        console.warn(`Prevented unhandled exception: ${ex?.message}`);
      }
    }
  }

  getDiaDist(point) {
    return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
  }

  getDistance(p1, p2) {
    return this.getDiaDist({ x: p1.x - p2.x, y: p1.y - p2.y });
  }

  getNearestPoint(arr, point) {
    let result: any[] = [];

    for (let index = 0; index < arr.length; index++) {
      const a = arr[index];
      let dist = this.getDistance(a.coord, point);
      result.push({ index, dist });
    }

    return result;
  }
  async handleCanvasPointerDown(ev) {
    const boxElement = (ev.target as HTMLElement).getBoundingClientRect();
    this.drawingBox = null;
    if (this.canvas && this.pointOverIndex > -1 && this.context.parent) {
      this.isDragging = true;
      this.context.parent.selectedPointIndex = this.pointOverIndex;
      const box =
        this.context.parent?.camera?.cameras[this.context.camera?.id || '']
          .boxes[this.pointOverIndex];

      if (box) {
        // console.log(box.coord, mousePosX, mousePosY);
        if (this.context.parent?.camOptions.gotoPosition) {
          const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

          const zoom = clamp(Number(box.pos.y) / 2, 0, 1).toFixed(2);
          await this.context.parent?.camOptions.gotoPosition({
            x: Number(box.pos.x).toFixed(2),
            y: Number(box.pos.y).toFixed(2),
            z: zoom,
            // z: Number(box.pos.z).toFixed(2),
          });
        }
      }
      // this.context.render({});
    } else {
      const ratioX = this.canvas.width / boxElement.width;
      const ratioY = this.canvas.height / boxElement.height;
      const mousePosX = (ev.clientX - boxElement.left) * ratioX;
      const mousePosY = (ev.clientY - boxElement.top) * ratioY;
      this.isDrawing = true;
      this.drawingBox = {
        x: mousePosX,
        y: mousePosY,
        width: 5,
        height: 5,
        class: 'car',
      };
    }
  }

  handleCanvasPointerUp(ev) {
    if (this.canvas && this.pointOverIndex > -1) {
      this.isDragging = false;
    } else if (this.isDrawing) {
      this.isDrawing = false;
      // if (this.context.onDrawEnd) {
      //   this.context.onDrawEnd(this.drawingBox);
      // }
      if (this.context.pursuit) {
        this.context.pursuit.setBoxes(this.context.camera?.id || '', [
          {
            left: this.drawingBox.x,
            top: this.drawingBox.y,
            ...this.drawingBox,
            class: 'car',
          },
        ]);
      }
    }
  }

  pointOverIndex = -1;

  isMouseOverToPoint(xPoint, yPoint) {
    if (
      this.context.parent &&
      this.context.parent.camera?.cameras[this.context.camera?.id || '']
    ) {
      const boxes = this.context.parent.camera?.cameras[
        this.context.camera?.id || ''
      ].boxes.findIndex(
        (x) =>
          xPoint >= x.coord.x - this.pointSize &&
          xPoint <= x.coord.x + this.pointSize &&
          yPoint >= x.coord.y - this.pointSize &&
          yPoint <= x.coord.y + this.pointSize
      );

      return boxes;
    } else {
      return -1;
    }
  }

  handleCanvasPointerMove(ev) {
    if (this.canvas) {
      const box = (ev.target as HTMLElement).getBoundingClientRect();
      const ratioX = this.canvas.width / box.width;
      const ratioY = this.canvas.height / box.height;
      const mousePosX = (ev.clientX - box.left) * ratioX;
      const mousePosY = (ev.clientY - box.top) * ratioY;

      if (
        this.context.playerMode == 'points' &&
        !this.isDragging &&
        !this.isDrawing
      ) {
        this.pointOverIndex = this.isMouseOverToPoint(mousePosX, mousePosY);
        // if (this.pointOverIndex > -1) {
        //   ev.target.style.cursor = 'crosshair 0 0, auto';
        // } else {
        //   ev.target.style.cursor = 'initial';
        // }
      } else if (
        this.context.playerMode == 'points' &&
        this.pointOverIndex > -1 &&
        this.context.parent?.camera?.cameras[this.context.camera?.id || '']
      ) {
        const box =
          this.context.parent?.camera?.cameras[this.context.camera?.id || '']
            .boxes[this.pointOverIndex];
        box.coord.x = mousePosX;
        box.coord.y = mousePosY;
      } else if (this.isDrawing && this.drawingBox) {
        const w = Math.abs(this.drawingBox.x - mousePosX) || 5;
        const h = Math.abs(this.drawingBox.y - mousePosY) || 5;

        this.drawingBox.x =
          mousePosX > this.drawingBox.x ? this.drawingBox.x : mousePosX;
        this.drawingBox.y =
          mousePosY > this.drawingBox.y ? this.drawingBox.y : mousePosY;
        this.drawingBox.width =
          mousePosX > this.drawingBox.x ? w : this.drawingBox.width + w;
        this.drawingBox.height =
          mousePosY > this.drawingBox.y ? h : this.drawingBox.height + h;
      }
    }
  }

  takePhoto() {
    if (this.canvas && this.video) {
      let canvas = document.createElement('canvas');

      canvas.width = this.canvas?.width;
      canvas.height = this.canvas?.height;

      if (canvas.width <= 50 || canvas.height <= 50) {
        return;
      }
      let ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          this.video,
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

      const id = generateGuid();
      const box = {
        id,
        left: 0,
        top: 0,
        right: canvas.width,
        bottom: canvas.height,
        image: canvas,
        camPos: this.context.camera?.position
          ? {
              ...this.context.camera?.position,
            }
          : undefined,
        resulation: { width: canvas.width, height: canvas.height },
      };
      return box;
    } else {
      return null;
    }
  }

  handleVideoLoadeddata() {
    if (this.videoLoaded) {
      return;
    }
    this.videoLoaded = true;
    try {
      if (this.canvas && this.video) {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.context.resulation = {
          width: this.video.videoWidth,
          height: this.video.videoHeight,
        };
        if (
          this.context.parent?.camera &&
          this.context.parent?.camera.cameras[this.context.camera?.id || '']
        ) {
          this.context.parent.camera.cameras[
            this.context.camera?.id || ''
          ].resulation = {
            width: this.video.videoWidth,
            height: this.video.videoHeight,
          };
        }
      }
    } catch {}

    if (this.regl) {
      return;
    }

    if (this.canvas && this.video) {
      this.ctx = this.canvas.getContext('2d');
      this.drawAnimate = requestAnimationFrame(this.drawVideoToCanvas);
      this.yoloAnimate = requestAnimationFrame(this.yoloAnimationFrame);
      if (this.context.camera?.isPtz && this.context.pursuit) {
        this.context.pursuit.setPtzPursuit(this.video);
      }
    }
  }

  ctx: CanvasRenderingContext2D | null = null;
  drawAnimate?: any;
  last2 = 0;
  speed2 = 0.05;

  async drawVideoToCanvas(timeStamp) {
    let timeInSecond = timeStamp / 1000;
    if (timeInSecond - this.last2 >= this.speed2) {
      if (this.ctx && this.video) {
        const ratio = this.video.videoWidth / 1280;
        this.pointSize = this.pointSize * ratio;
        this.ctx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight);
        this.ctx.drawImage(
          this.video,
          0,
          0,
          this.video.videoWidth,
          this.video.videoHeight
        );

        if (this.context.playerMode == 'target') {
          this.ctx.strokeStyle = 'red';
          this.ctx.lineWidth = 1 * ratio;
          // draw a red line
          this.ctx.beginPath();
          this.ctx.moveTo(0, 0);
          this.ctx.lineTo(this.video.videoWidth, this.video.videoHeight);
          this.ctx.moveTo(this.video.videoWidth, 0);
          this.ctx.lineTo(0, this.video.videoHeight);
          this.ctx.stroke();
          this.ctx.closePath();
        }

        if (this.drawingBox) {
          this.ctx.beginPath();
          this.ctx.lineWidth = 2 * ratio;
          this.ctx.strokeStyle = 'red';
          this.ctx.strokeRect(
            this.drawingBox.x,
            this.drawingBox.y,
            this.drawingBox.width,
            this.drawingBox.height
          );
          this.ctx.stroke();
          this.ctx.closePath();
        }

        if (
          this.context.playerMode == 'points' &&
          this.context.parent?.camera &&
          this.context.parent?.camera.cameras[this.context.camera?.id || '']
        ) {
          const bb =
            this.context.parent?.camera.cameras[this.context.camera?.id || '']
              .boxes;
          for (let index = 0; index < bb.length; index++) {
            const element = bb[index];

            this.ctx.beginPath();
            this.ctx.arc(
              element.coord.x * ratio,
              element.coord.y * ratio,
              this.pointSize,
              0,
              2 * Math.PI,
              false
            );

            this.ctx.lineWidth = 2 * ratio;

            if (this.context.parent.selectedPointIndex == index) {
              // this.ctx.fillStyle = 'red';
              // this.ctx.fill();
              this.ctx.lineWidth = 8 * ratio;
            } else {
              // this.ctx.arc(
              //   element.coord.x,
              //   element.coord.y,
              //   10,
              //   0,
              //   2 * Math.PI,
              //   true
              // );
            }

            this.ctx.strokeStyle = 'red';
            this.ctx.stroke();
            this.ctx.closePath();

            // if (this.context.parent.selectedPointIndex !== index) {
            //   this.ctx.beginPath();
            //   this.ctx.arc(
            //     element.coord.x,
            //     element.coord.y,
            //     10,
            //     0,
            //     2 * Math.PI,
            //     true
            //   );
            //   this.ctx.stroke();
            //   this.ctx.closePath();
            // }
          }
        }
        if (
          // this.context.playerMode == 'detect' &&
          this.context.detectBoxes
        ) {
          for (
            let index = 0;
            index < this.context.detectBoxes.length;
            index++
          ) {
            const element = this.context.detectBoxes[index];
            this.ctx.beginPath();
            this.ctx.lineWidth = 6 * ratio;
            this.ctx.strokeStyle = 'red';
            this.ctx.strokeRect(
              element.left || 0,
              element.top || 0,
              element.width || 0,
              element.height || 0
            );
            this.ctx.stroke();
            this.ctx.closePath();
          }

          if (this.context.pursuit?.currentBox && !this.context.camera?.isPtz) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 5 * ratio;
            this.ctx.strokeStyle = 'green';
            this.ctx.arc(
              this.context.pursuit?.currentBox.item.left || 0,
              this.context.pursuit?.currentBox.item.top || 0,
              10,
              0,
              2 * Math.PI,
              true
            );
            // this.ctx.strokeRect(
            //   this.context.pursuit?.currentBox.item.left || 0,
            //   this.context.pursuit?.currentBox.item.top || 0,
            //   this.context.pursuit?.currentBox.item.width || 0,
            //   this.context.pursuit?.currentBox.item.height || 0
            // );
            this.ctx.stroke();
            this.ctx.closePath();
          }
        }
      }

      this.last2 = timeInSecond;
    }
    this.drawAnimate = requestAnimationFrame(this.drawVideoToCanvas);
  }

  isPredict = false;
  async yoloAnimationFrame(timeStamp) {
    let timeInSecond = timeStamp / 1000;
    if (timeInSecond - this.last >= this.speed && !this.isPredict) {
      if (
        this.canvas &&
        this.activateDetection &&
        this.yoloDetect &&
        this.context.playerMode == 'detect'
      ) {
        this.isPredict = true;

        this.yoloDetect.predict(this.video, {}).then((boxes) => {
          this.context.detectBoxes = [];
          this.context.detectBoxes?.push(...boxes);
          if (this.context.pursuit) {
            if (this.drawingBox) {
              boxes = [];
              boxes.push({
                left: this.drawingBox.x,
                top: this.drawingBox.y,
                ...this.drawingBox,
              });
            }
            this.context.pursuit.setBoxes(
              this.context.camera?.id || '',
              boxes
              // boxes.filter((x) => x.class == 'person')
            );
          }

          this.isPredict = false;
        });
      }
      this.last = timeInSecond;
    }
    this.yoloAnimate = requestAnimationFrame(this.yoloAnimationFrame);
  }

  // searchImage(searchCanvas: IGlRect) {
  //   if (this.video && searchCanvas && this.canvas) {
  //     let orjCanvas = document.createElement('canvas');
  //     orjCanvas.width = this.canvas.width;
  //     orjCanvas.height = this.canvas.height;
  //     let ctx = orjCanvas.getContext('2d');
  //     if (ctx) {
  //       ctx.drawImage(
  //         this.video,
  //         0,
  //         0,
  //         orjCanvas.width,
  //         orjCanvas.height,
  //         0,
  //         0,
  //         orjCanvas.width,
  //         orjCanvas.height
  //       );
  //     }
  //     let src: any = cv.imread(orjCanvas);

  //     let templ = cv.imread(searchCanvas.image);

  //     var dst = new cv.Mat();
  //     let mask = new cv.Mat();

  //     cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF_NORMED, mask);
  //     cv.normalize(dst, dst, 0, 1, cv.NORM_MINMAX, -1, new cv.Mat());

  //     let result = cv.minMaxLoc(dst, mask);
  //     let maxPoint = result.maxLoc;

  //     let point = new cv.Point(
  //       maxPoint.x + templ.cols,
  //       maxPoint.y + templ.rows
  //     );

  //     src.delete();
  //     templ.delete();
  //     mask.delete();

  //     if (
  //       this.context.parent?.camera &&
  //       this.context.camera &&
  //       this.context.parent.camera.cameras[this.context.camera?.id || '']
  //     ) {
  //       const cameras: any[] = [];
  //       const camRel = cameras.find((x) => x.id == searchCanvas.id);
  //       if (!camRel) {
  //         cameras.push({
  //           ...searchCanvas,
  //           camPos: searchCanvas.camPos
  //             ? { ...searchCanvas.camPos }
  //             : undefined,
  //           right: point.x,
  //           left: maxPoint.x,
  //           top: maxPoint.y,
  //           bottom: point.y,
  //           resulation: {
  //             width: this.canvas.width,
  //             height: this.canvas.height,
  //           },
  //         });
  //       } else {
  //         camRel.right = point.x;
  //         camRel.left = maxPoint.x;
  //         camRel.top = maxPoint.y;
  //         camRel.bottom = point.y;
  //       }
  //     }

  //     this.context.parent?.render({ camera: this.context.parent.camera });
  //   }
  // }
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
uniform vec4 selectedBoxColor;
uniform int selectedIndex;
uniform vec4 iMouse;
uniform float showSplitter;


vec2 GLCoord2TextureCoord(vec2 glCoord) {
	return glCoord  * vec2(1.0, -1.0) / 2.0 + vec2(0.5, 0.5);
}

vec4 draw_rect(in vec2 bottomLeft, in vec2 topRight, in float lineWidth, in vec2 texCoord, in vec4 Mon, in int index)
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

    // float a = floor((float(index) + 1.0) / float(selectedIndex));
    // float b = floor(float(selectedIndex) / (float(index) + 1.0));
    // vec4 color = vec4(clamp(a * b, 0.0, 1.0), 1.0, 1.0, 1.0);

    vec4 finalColor = mix(Mon, boxColor,  pct);
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

    MonA = draw_rect(vec2(pH, pV), vec2(pH1, pV1), 10.0, uv, MonA, i);
  }
  
  gl_FragColor = MonA;
}
`;
