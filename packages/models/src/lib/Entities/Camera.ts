import { ICamPosition, ICoord, IGlRect, IResulation } from './IGlRect';

export interface Camera {
  id?: string;
  name: string;
  url?: string;
  port?: number;
  rtspPort?: number;
  username?: string;
  password?: string;
  isPtz?: boolean;
  position?: ICamPosition;
  cameras: { [key in string]: ICamRelation };
  camInfo?: any;
  panorama?: ICamPosition;
}

export interface ICamRelation {
  boxes: CamPoint[];
  limits?: IRectLimits;
  resulation?: IResulation;
}

export interface CamPoint {
  coord: ICoord;
  pos: ICamPosition;
}
export interface IRectLimits {
  leftTop: CamPoint;
  rightTop: CamPoint;
  leftBottom: CamPoint;
  rightBottom: CamPoint;
}
