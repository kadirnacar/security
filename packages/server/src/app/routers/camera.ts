import { Services } from '@security/database';
import { Request, Response, Router } from 'express';
import { CameraService } from '../services/CameraService';

export class CameraRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async connect(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const dataRepo = Services.Camera;
      const data = await dataRepo.get(id);
      const cam = await CameraService.connect(data);
      data.camInfo = cam;
      await dataRepo.save(data);
      res.status(200).send(cam);
    } catch (err) {
      next(err);
    }
  }

  public async disconnect(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const dataRepo = Services.Camera;
      const data = await dataRepo.get(id);
      const cam = await CameraService.disconnect(data);

      res.status(200).send({});
    } catch (err) {
      next(err);
    }
  }

  public async setPos(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const data = req.body;

      const camera = CameraService.getCamera(id)?.camera;
      if (camera) {
        if (data.action === 'home') {
          await camera.ptz.gotoHomePosition();
        } else if (data.velocity && camera.ptz) {
          await camera.ptz.absoluteMove(null, data.velocity, data.speed);
        }
      }
      res.status(200).send({});
    } catch (err) {
      next(err);
    }
  }

  public async getCamInfo(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const dataRepo = CameraService.getCamera(id);
      res.status(200).send(dataRepo);
    } catch (err) {
      next(err);
    }
  }

  public async rtspgo(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const cam = await CameraService.rtspgo(id, req.body.data, res);
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.post('/connect/:id', this.connect.bind(this));
    this.router.post('/disconnect/:id', this.disconnect.bind(this));
    this.router.post('/pos/:id', this.setPos.bind(this));
    this.router.get('/info/:id', this.getCamInfo.bind(this));
    this.router.post('/rtspgo/:id', this.rtspgo.bind(this));
  }
}
