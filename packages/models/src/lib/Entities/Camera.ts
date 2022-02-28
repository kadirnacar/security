export interface Camera {
  id?: string;
  name: string;
  url?: string;
  port?: number;
  rtspPort?: number;
  username?: string;
  password?: string;
  position?: { x: number; y: number; z: number };
  isPtz?: boolean;
  tolerance: {
    x: { min: number; max: number };
    y: { min: number; max: number };
  };
}
