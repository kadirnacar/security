import { Camera } from '@security/models';
import React, { Component } from 'react';
import REGL from 'regl';

let vert = `
precision mediump float;
  attribute vec2 position;
  varying vec2 uv;

  void main () {
    uv = vec2((1.0 - position.x), position.y);
    gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
  }
`;

let fragSingle = `
precision mediump float;
uniform sampler2D uSampler;
varying vec2 uv;
uniform vec3 zoom;
uniform vec3 uLensS;
uniform vec2 uLensF;


vec2 GLCoord2TextureCoord(vec2 glCoord) {
	return glCoord  * vec2(1.0, -1.0)/ 2.0 + vec2(0.5, 0.5);
}

void main() {
  float scale = uLensS.z;
	vec2 vPos = vec2(uv.x * 2.0 - 1.0, (1.0 - uv.y * 2.0));
	float Fx = uLensF.x;
	float Fy = uLensF.y;

	vec2 vMapping = vPos.xy;
	vMapping.x = vMapping.x + ((pow(vPos.y, 2.0)/scale)*vPos.x/scale)*-Fx;
	vMapping.y = vMapping.y + ((pow(vPos.x, 2.0)/scale)*vPos.y/scale)*-Fy;
	vMapping = vMapping * uLensS.xy;

	vMapping = GLCoord2TextureCoord(vMapping/scale);

  vec4 MonA = texture2D(uSampler, vMapping);
  gl_FragColor = MonA;
}
`;

type Props = {
  stream?: MediaStream;
  camera?: Camera;
};

type State = {};

export default class VideoPlayer extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.video = React.createRef<HTMLVideoElement>();
    this.canvas = React.createRef<HTMLCanvasElement>();

    this.state = {};
  }

  video: React.RefObject<HTMLVideoElement>;
  canvas: React.RefObject<HTMLCanvasElement>;
  regl?: REGL.Regl;
  videoAnimate?;

  componentDidUpdate() {
    if (this.video.current) {
      this.video.current.srcObject = this.props.stream || null;
    }
  }

  async componentWillUnmount() {
    this.setState({ playing: false });

    if (this.videoAnimate) {
      try {
        this.videoAnimate.cancel();
      } catch (ex: any) {
        console.warn(`Prevented unhandled exception: ${ex?.message}`);
      }
    }
  }

  render() {
    return (
      <>
        <canvas
          ref={this.canvas}
          style={{
            width: '100%',
          }}
        ></canvas>
        <video
          autoPlay
          controls={false}
          style={{
            width: '100%',
            height: 0,
          }}
          ref={this.video}
          onPlay={(ev) => {
            if (this.canvas.current && this.video.current) {
              let gl = this.canvas.current.getContext('webgl2');

              if (!gl) {
                return;
              }

              this.regl = REGL(gl);
              let pos = [-1, -1, 1, -1, -1, 1, 1, 1, -1, 1, 1, -1];
              let texture: REGL.Texture2D;

              let lens = {
                a: 1.0,
                b: 1.0,
                Fx: 0.0,
                Fy: 0.4,
                scale: 1.0,
              };

              const drawFrame = this.regl({
                frag: fragSingle,
                vert: vert,
                attributes: {
                  position: pos,
                },
                uniforms: {
                  uSampler: (ctx, { videoT1 }: any) => {
                    return videoT1;
                  },
                  uLensS: () => {
                    return [lens.a, lens.b, lens.scale];
                  },
                  uLensF: () => {
                    return [lens.Fx, lens.Fy];
                  },
                  zoom: () => {
                    return [1.0, 0.0, 0.0];
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
                      drawFrame({
                        videoT1: texture,
                      });
                  } catch {
                    if (this.videoAnimate) {
                      try {
                        this.videoAnimate.cancel();
                      } catch (ex: any) {
                        console.warn(
                          `Prevented unhandled exception: ${ex?.message}`
                        );
                      }
                    }
                  }
                });
              }
            }
          }}
          onLoadedData={async () => {
            try {
              if (this.canvas.current && this.video.current) {
                this.canvas.current.width = this.video.current.videoWidth;
                this.canvas.current.height = this.video.current.videoHeight;
              }
            } catch {}
          }}
        ></video>
      </>
    );
  }
}
