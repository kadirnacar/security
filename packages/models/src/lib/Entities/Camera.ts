export interface ITolerance {
  x: { min: number; max: number };
  y: { min: number; max: number };
}

export interface Camera {
  id?: string;
  name: string;
  url?: string;
  port?: number;
  rtspPort?: number;
  username?: string;
  password?: string;
  isPtz?: boolean;
  position?: { x: number; y: number; z: number };
  cameras?: { camId: string; tolerance?: ITolerance }[];
  camInfo?: any;
  panorama?: { x: number; y: number; scale: number };
}
