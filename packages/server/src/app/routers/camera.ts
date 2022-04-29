import { Services } from '@security/database';
import { Request, Response, Router } from 'express';
import { CameraService } from '../services/CameraService';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import { Camera, Capture, Settings } from '@security/models';
import * as moment from 'moment';
import * as sharp from 'sharp';

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
      dataRepo.save(data);
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
      const camItem = CameraService.getCamera(id);
      const camera = camItem?.camera;
      if (camera) {
        if (data.action === 'home') {
          await camera.ptz.gotoHomePosition();
        } else if (data.velocity && camera.ptz) {
          const a = await camera.ptz.absoluteMove(
            null,
            data.velocity,
            data.speed
          );
          const dataRepo = Services.Camera;
          await dataRepo.save({
            id: camItem.model.id,
            position: data.velocity,
          });
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

  public async getSnapshot(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const { box, image } = req.body;
      const dataRepo = Services.Camera;
      const data: Camera = await dataRepo.get(id);
      const settings: Settings = Services.Settings.all();

      let bufferSource = Buffer.from(image.split(',')[1], 'base64');
      let form = new FormData();

      const imageFolder = path.resolve(__dirname, 'photos');

      if (!fs.existsSync(imageFolder)) {
        fs.mkdirSync(imageFolder);
      }

      const img = sharp(bufferSource);
      const metadata = await img.metadata();

      await img
        .resize(
          metadata.width / (settings.imageResizeDivider || 2),
          metadata.height / (settings.imageResizeDivider || 2)
        )
        .png({
          progressive: true,
          force: false,
          quality: 80,
          compressionLevel: 8,
        });
      // .toFile('output.webp', (err, info) => {});

      form.append('image', bufferSource, {
        filename: 'snapshot.png',
        contentType: 'image/png',
        knownLength: bufferSource.byteLength,
      });

      let isProcess = false;
      form.submit('http://localhost:8888/alpr', function (err, res2) {
        if (err) {
          console.log(err);
          return;
        }
        isProcess = true;
        res2.on('data', async (chunk) => {
          let jsonResult: any = {};

          try {
            jsonResult = JSON.parse(chunk.toString());
          } catch {}

          let imageFileName = `${box.camId}#${moment().format(
            'DDMMYYYYHHmmss'
          )}#${
            jsonResult && jsonResult.results && jsonResult.results.length > 0
              ? jsonResult.results[0].plate
              : 'PlakaYok'
          }#${data.position.x}_${data.position.y}_${data.position.z}.png`;

          await img.toFile(path.resolve(imageFolder, imageFileName));

          const captureRepo = Services.Capture;
          const capture: Capture = {
            box: box,
            camId: box.camId,
            imageFile: imageFileName,
            pos: data.position,
            ptzId: data.id,
            date: new Date(),
            plateResult:
              jsonResult && jsonResult.results && jsonResult.results.length > 0
                ? jsonResult
                : undefined,
          };
          const captureSavedData = captureRepo.save(capture, data.id);
          // const captureSavedData = captureRepo.save(capture, box.camId);

          res.contentType('application/json');
          res.send(captureSavedData);
        });
      });

      setTimeout(() => {
        if (!isProcess) {
          res.end();
        }
      }, 2500);
    } catch (err) {
      console.log(err);
      res.end();
    }
  }

  async init() {
    this.router.post('/connect/:id', this.connect.bind(this));
    this.router.post('/disconnect/:id', this.disconnect.bind(this));
    this.router.post('/pos/:id', this.setPos.bind(this));
    this.router.get('/info/:id', this.getCamInfo.bind(this));
    this.router.post('/snapshot/:id', this.getSnapshot.bind(this));
    this.router.post('/rtspgo/:id', this.rtspgo.bind(this));
  }
}
