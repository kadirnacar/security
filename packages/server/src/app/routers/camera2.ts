import { Services } from '@security/database';
import { Request, Response, Router } from 'express';
import { CameraService } from '../services/CameraService2';
import Camera = require('../../onvif-nvt/camera');
import { createUuidV4 } from '../../onvif-nvt/utils/util';

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

      res.status(200).send({});
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

  public async getPlaylist(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      await CameraService.getPlaylist(id, res);
    } catch (err) {
      next(err);
    }
  }

  public async getHeader(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      await CameraService.getHeader(id, res);
    } catch (err) {
      next(err);
    }
  }

  public async getSegment(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const segment = req.params['segment'];
      await CameraService.getSegment(id, segment, res);
    } catch (err) {
      next(err);
    }
  }

  public async setPipe(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      await CameraService.setPipe(id, res);
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.post('/connect/:id', this.connect.bind(this));
    this.router.post('/disconnect/:id', this.disconnect.bind(this));
    this.router.post('/pos/:id', this.setPos.bind(this));
    this.router.get('/watch/:id/source:segment.m4s', this.getSegment.bind(this));
    this.router.get('/watch/:id/source.mp4', this.getHeader.bind(this));
    this.router.get('/watch/:id', this.getPlaylist.bind(this));
    this.router.get('/pipe/:id', this.setPipe.bind(this));
  }
}
