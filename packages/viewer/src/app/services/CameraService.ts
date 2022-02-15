import { Result } from '../reducers/Result';
import { ServiceBase } from './ServiceBase';

export class CameraService extends ServiceBase {
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
  public static async pos(
    id: string,
    velocity: { x?: number; y?: number; z?: number }
  ): Promise<Result<any>> {
    const result = await this.requestJson(
      {
        url: `/api/camera/pos/${id}`,
        method: 'POST',
        data: { ...velocity },
      },
      true
    );
    return result;
  }
}
