import React, { Component } from 'react';
import * as bodyDetection from '@tensorflow-models/body-pix';

type Props = {
  box: any;
  data: ImageData;
};

type State = {};

export default class CanvasView extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.canvas = React.createRef<HTMLCanvasElement>();
  }

  canvas: React.RefObject<HTMLCanvasElement>;
  ctx?: CanvasRenderingContext2D;

  componentDidMount() {
    this.ctx = this.canvas.current?.getContext('2d') || undefined;

    // const data = bodyDetection.toMask(this.props.pose);
    if (this.canvas.current && this.ctx) {
      this.canvas.current.width = this.props.data.width;
      this.canvas.current.height = this.props.data.height;
    }
console.log('load')
    
    this.ctx?.putImageData(this.props.data, 0, 0);
  }

  render() {
    return <canvas ref={this.canvas}></canvas>;
  }
}
