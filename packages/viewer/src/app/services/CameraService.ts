import { Result } from '../reducers/Result';
import { ServiceBase } from './ServiceBase';

export class CameraService extends ServiceBase {

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

  public static async pos(
    id: string,
    velocity?: { x?: any; y?: any; z?: any },
    speed?: any,
    action?: 'home'
  ): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/pos/${id}`,
        method: 'POST',
        data: { velocity: { ...velocity }, action: action, speed },
      },
      true
    );
    return result;
  }
}
