export interface IGlRect {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  image?: HTMLCanvasElement;
  camPos?: ICamPosition;
  resulation?: IResulation;
}
export interface IResulation {
  width: number;
  height: number;
}

export interface ILimit {
  min: number;
  max: number;
}
export interface IPtzLimit {
  x: ILimit;
  y: ILimit;
}

export interface ICoord {
  x: number;
  y: number;
}

export interface ICamPosition {
  x: any;
  y: any;
  z: any;
}
