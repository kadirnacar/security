import { ICamPosition, IPtzLimit } from './IGlRect';

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
  cameras?: { camId: string; tolerance?: IPtzLimit }[];
  camInfo?: any;
  panorama?: ICamPosition;
}
