import { ICamPosition, ICoord, IGlRect } from './IGlRect';

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
  boxes: IGlRect[];
  limits?: {
    leftTop: { coord: ICoord; pos: ICamPosition };
    rightTop: { coord: ICoord; pos: ICamPosition };
    leftBottom: { coord: ICoord; pos: ICamPosition };
    rightBottom: { coord: ICoord; pos: ICamPosition };
  };
}
