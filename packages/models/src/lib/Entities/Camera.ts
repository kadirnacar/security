import { ICamPosition, IGlRect, IPtzLimit } from './IGlRect';

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
  cameras: { [key in string]: IGlRect[] };
  camInfo?: any;
  panorama?: ICamPosition;
}
