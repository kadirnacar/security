import { ICamPosition, ICoord, IGlRect, IResulation } from './IGlRect';

export interface Capture {
  id?: string;
  ptzId: string;
  camId: string;
  imageFile: string;
  box: any;
  pos: ICamPosition;
  plateResult: any;
  date: Date;
}
