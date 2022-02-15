import { Services } from '@security/database';
import { Request, Response, Router } from 'express';
import { CameraService } from '../services/CameraService';
import Camera = require('../../onvif-nvt/camera');

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
      await CameraService.connect(data);
      res.status(200).send({});
    } catch (err) {
      next(err);
    }
  }

  public async setPos(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const velocity = req.body;
      const camera = CameraService.getCamera(id);
      if (camera) {
        camera.ptz.absoluteMove(null, velocity, null, (a, b) => {
          res.status(200);
        });
      }
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.post('/connect/:id', this.connect.bind(this));
    // this.router.post('/pos/:id', this.setPos.bind(this));
  }
}
