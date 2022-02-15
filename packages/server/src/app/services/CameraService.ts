import { Camera as CameraModel } from '@security/models';
import Camera = require('../../onvif-nvt/camera');
import * as OnvifManager from '../../onvif-nvt/onvif-nvt';

export class CameraService {
  static cameraModels: { model: CameraModel; camera: Camera }[] = [];

  public static async connect(cameraModel: CameraModel) {
    const connected = this.cameraModels.find(
      (x) => x.model && x.model.id == cameraModel.id
    );
    if (!connected) {
      try {
        const cam = await OnvifManager.connect(
          cameraModel.url,
          cameraModel.port,
          cameraModel.username,
          cameraModel.password
        );

        if (cam) {
          this.cameraModels.push({ model: cameraModel, camera: cam });
        }
        return cam;
      } catch (ex) {
        throw ex;
      }
    } else {
      return connected.camera;
    }
  }

  public static getCamera(id: string) {
    const camItem = this.cameraModels.find((x) => x.model && x.model.id == id);
    return camItem?.camera;
  }
}
