import { Camera, IGlRect } from '@security/models';

export class PursuitController {
  constructor(ptzCamera: Camera, staticCameras: Camera[]) {
    this.ptzCamera = ptzCamera;
    this.staticCameras = {};
    staticCameras.forEach((x) => {
      if (x.id) {
        this.staticCameras[x.id] = {
          camera: x,
          boxes: [],
        };
      }
    });
  }

  ptzCamera?: Camera;
  staticCameras: { [key: string]: { camera: Camera; boxes: IGlRect[] } } = {};

  setCamBoxes(id: string, boxes: IGlRect[]) {
    if (this.staticCameras[id]) {
      this.staticCameras[id].boxes = boxes;
    }
  }
}
