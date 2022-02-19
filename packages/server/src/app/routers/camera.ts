import { Services } from '@security/database';
import { Request, Response, Router } from 'express';
import { CameraService } from '../services/CameraService';
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

  public async watchCam(req: Request, res: Response, next) {
    try {
      // res.writeHead(200, {
      //   'Access-Control-Allow-Origin': '*',
      //   Connection: 'Keep-Alive',
      //   'Content-Type': 'video/mp4',
      // });

      res.on('close', () => {console.log('reg close')});
      res.on('data', () => {console.log('reg data')});
      res.on('finish', () => {console.log('reg end')});
      res.on('error', () => {console.log('reg error')});
      res.on('unpipe', () => {console.log('reg pause')});
      res.on('pipe', () => {console.log('reg readable')});
      res.on('drain', () => {console.log('reg resume')});
      // res.writeHead(206)
      const userId = createUuidV4();
      const id = req.params['id'];
      // res.set('Content-Type', 'video/mp4');
      // res.on('close', async () => {
      //   await CameraService.stopRes(id, userId, res);
      // });

      console.log('request', id);
      await CameraService.pipeRes(id, id, res);
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.post('/connect/:id', this.connect.bind(this));
    this.router.post('/pos/:id', this.setPos.bind(this));
    this.router.get('/watch/:id', this.watchCam.bind(this));
  }
}
