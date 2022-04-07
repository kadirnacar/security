import { CircularProgress } from '@mui/material';
import { Camera, Settings } from '@security/models';
import React, { Component } from 'react';
import REGL from 'regl';
import yolo from 'tfjs-yolo';

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

  for (int i = 0; i < 10; i++) {

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
  boxes: any[] = [];
  lens = {
    a: 1.0,
    b: 1.0,
    Fx: 0.0,
    Fy: 0.0,
    scale: 1.0,
  };

  async componentDidMount() {
    this.yoloDetect = await yolo.v3('model/v3/model.json');
    // this.yoloDetect = await yolo.v3tiny('model/v3tiny/model.json');
    // this.yoloDetect = await yolov3({ modelUrl: 'model/yolov3/model.json' });
    this.speed = this.props.settings?.framePerSecond || 0.5;
    this.setState({ loaded: true });
  }

  componentDidUpdate(prevProp, prevState) {
    if (this.video.current && !this.l) {
      this.video.current.srcObject = this.props.stream || null;
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
            return this.boxes;
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

          for (
            let index = this.boxes.length;
            index < (this.props.settings?.maxBoxes || 10) * 4;
            index++
          ) {
            this.boxes.push(-50);
          }

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
    // if (timeInSecond - this.last >= this.speed) {
    if (this.canvas.current) {
      // const boxes = await this.yoloDetect.predict(this.canvas.current);
      this.yoloDetect.predict(this.canvas.current).then((boxes) => {
        this.boxes = boxes
          .map((x) => [
            x.left,
            x.top,
            // x.right,
            // x.bottom
            (this.video.current?.videoWidth || 0) - x.right,
            (this.video.current?.videoHeight || 0) - x.bottom,
          ])
          .flat();
        if (boxes.length > 0) {
          boxes.forEach((x) => {
            // const pert = this.intersect(x, boxes[0]);
            let res = 0;
            const d = this.cachedBoxes.findIndex((y) => {
              res = this.intersect(x, y);
              // console.log(res, y);
              return res > 0.7;
            });
            if (d == -1) {
              this.cachedBoxes.push(x);
            } else {
              this.cachedBoxes[d] = x;
            }
            // if (pert < 0.7) {
            //   this.cachedBoxes.push(x);
            // }
            console.log(res, this.cachedBoxes);
          });
          // this.cachedBoxes = boxes;
        }
        // console.log(boxes);
      });
      // const boxes = await this.yoloDetect(this.video.current);

      // this.boxes = boxes;
      // this.setState({ boxes });
      // }
      this.last = timeInSecond;
    }
    this.yoloAnimate = requestAnimationFrame(this.yoloAnimationFrame);
    // console.log(timeStamp);
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
