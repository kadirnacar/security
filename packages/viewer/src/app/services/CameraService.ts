import { ICamPosition } from '@security/models';
import { Result } from '../reducers/Result';
import { ServiceBase } from './ServiceBase';

export class CameraService extends ServiceBase {
  public static async getInfo(id: string): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/info/${id}`,
        method: 'GET',
      },
      true
    );
    return result;
  }

  public static async getTensor(id: string): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/tensor/${id}`,
        method: 'GET',
      },
      true
    );
    return result;
  }

  public static async connect(id: string): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/connect/${id}`,
        method: 'POST',
      },
      true
    );
    return result;
  }

  public static async disconnect(id: string): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/disconnect/${id}`,
        method: 'POST',
      },
      true
    );
    return result;
  }

  public static async getSnapshot(
    id: string,
    image: any,
    box: any
  ): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/snapshot/${id}`,
        method: 'POST',
        data: { image, box },
      },
      true
    );
    return result;
  }

  public static async clearBoxes(id: string, subid: any): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/clearboxes/${id}/${subid}`,
        method: 'POST',
        data: {},
      },
      true
    );
    return result;
  }

  public static async pos(
    id: string,
    velocity?: ICamPosition,
    speed?: any,
    action?: 'home'
  ): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/pos/${id}`,
        method: 'POST',
        data: {
          velocity: {
            x: parseFloat((velocity?.x || 0).toString()).toFixed(2),
            y: parseFloat((velocity?.y || 0).toString()).toFixed(2),
            z: parseFloat((velocity?.z || 0).toString()).toFixed(2),
          },
          action: action,
          speed,
        },
      },
      true
    );
    return result;
  }
}
