import { Services } from '@security/database';
import { Settings } from '@security/models';
import * as bodyDetection from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-node-gpu';
// import * as tf from '@tensorflow/tfjs-node';
import * as tfGpu from '@tensorflow/tfjs-node-gpu';
import { Request, Response, Router } from 'express';
import * as onvif from 'node-onvif';
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

      const dataRepo = Services.Camera;
      const data = await dataRepo.get(id);
      let device = new onvif.OnvifDevice({
        xaddr: `http://${data.url}/onvif/device_service`, //cam.camera.deviceio.serviceAddress.href,
        user: data.username,
        pass: data.password,
      });

      await device.init();
      res.status(200).send(device);
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
        const settings = await Services.Settings.get(null);
        if (
          !this.bodyFix[id] ||
          !this.settings ||
          settings.updateDate != this.settings.updateDate
        ) {
          this.settings = settings;
          this.bodyFix[id] = await bodyDetection.load({
            architecture: this.settings.architecture || 'MobileNetV1',
            outputStride: this.settings.outputStride || 16,
            multiplier:
              this.settings.architecture == 'MobileNetV1'
                ? this.settings.multiplier || 0.75
                : undefined,
            quantBytes: this.settings.quantBytes || 2,
          });
        }
        pose = await this.bodyFix[id].segmentPerson(imagetf, {
          flipHorizontal: false,
          internalResolution: this.settings.internalResolution || 'high',
          segmentationThreshold: this.settings.segmentationThreshold || 0.7,
          maxDetections: this.settings.maxDetections,
          nmsRadius: this.settings.nmsRadius,
          scoreThreshold: this.settings.scoreThreshold,
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
      console.log(err);
      res.status(200).send([]);
    }
  }
  bodyFix: any = {};
  devices: any = {};
  settings: Settings;
  async init() {
    this.router.post('/connect/:id', this.connect.bind(this));
    this.router.post('/disconnect/:id', this.disconnect.bind(this));
    this.router.post('/pos/:id', this.setPos.bind(this));
    this.router.get('/pipe/:id', this.setPipe.bind(this));
    this.router.get('/info/:id', this.getCamInfo.bind(this));
    this.router.get('/tensor/:id', this.getTensor.bind(this));
    this.router.post('/rtspgo/:id', this.rtspgo.bind(this));
  }
}
