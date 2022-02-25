import { Services } from '@security/database';
import { Request, Response, Router } from 'express';
import { CameraService } from '../services/CameraService';
import Camera = require('../../onvif-nvt/camera');
import { createUuidV4 } from '../../onvif-nvt/utils/util';
import * as onvif from 'node-onvif';
// import * as tf from '@tensorflow/tfjs-node';
import * as tfGpu from '@tensorflow/tfjs-node-gpu';
import * as bodyDetection from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-node-gpu';

import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-wasm';

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

  public async getCamInfo(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const cam = await CameraService.getCamera(id);
      res.status(200).send(cam);
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

  public async getTensor(req: Request, res: Response, next) {
    const id = req.params['id'];
    try {
      // if (!this.devices[id]) {
      const cam = await CameraService.getCamera(id);
      if (!cam) {
        res.status(200).send([]);
        return;
      }
      let device = new onvif.OnvifDevice({
        xaddr: `http://${cam.model.url}/onvif/device_service`, //cam.camera.deviceio.serviceAddress.href,
        user: cam.model.username,
        pass: cam.model.password,
      });

      await device.init();
      // this.devices[id] = device;
      // }

      const image = await device.fetchSnapshot();
      const imagetf = tfGpu.node.decodeImage(image.body);
      let pose;
      try {
        if (!this.bodyFix[id]) {
          this.bodyFix[id] = await bodyDetection.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.75,
            quantBytes: 2,
          });
        }
        pose = await this.bodyFix[id].segmentPerson(imagetf, {
          flipHorizontal: false,
          internalResolution: 'high',
          segmentationThreshold: 0.5,
          scoreThreshold: 0.5,
        });
      } catch (err) {
        console.log(err);
      }

      // res.writeHead(200, { 'Content-Type': image.headers['content-type'] });
      // res.write(image.body);
      // res.end();
      res.status(200).send(pose?.allPoses.filter((x) => x.score > 0.2));
      // res.end(image.body.data);
    } catch (err) {
      delete this.devices[id];
      res.status(200).send([]);
    }
  }
  bodyFix: any = {};
  devices: any = {};
  async init() {
    this.router.post('/connect/:id', this.connect.bind(this));
    this.router.post('/disconnect/:id', this.disconnect.bind(this));
    this.router.post('/pos/:id', this.setPos.bind(this));
    this.router.get(
      '/watch/:id/source:segment.m4s',
      this.getSegment.bind(this)
    );
    this.router.get('/watch/:id/source.mp4', this.getHeader.bind(this));
    this.router.get('/watch/:id', this.getPlaylist.bind(this));
    this.router.get('/pipe/:id', this.setPipe.bind(this));
    this.router.get('/info/:id', this.getCamInfo.bind(this));
    this.router.get('/tensor/:id', this.getTensor.bind(this));
    this.router.post('/rtspgo/:id', this.rtspgo.bind(this));
  }
}
