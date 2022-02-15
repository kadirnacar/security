import { Services } from '@security/database';
import { Request, Response, Router } from 'express';
import Camera = require('../../onvif-nvt/camera');
import { createUuidV4 } from '../../onvif-nvt/utils/util';

export class DataRouter {
  router: Router;
  entityName: string;
  camera: Camera;

  constructor() {
    this.router = Router();
    this.init();
  }

  public initCamera(camera) {
    this.camera = camera;
  }

  public async getList(req: Request, res: Response, next) {
    try {
      const entity = req.params.entity;
      const dataRepo = Services[entity];
      const data = dataRepo.all();
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const entity = req.params.entity;
      const dataRepo = Services[entity];
      const data = dataRepo.get(id);
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async deleteItem(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const entity = req.params.entity;
      const dataRepo = Services[entity];
      const data = dataRepo.delete(id);
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async updateItem(req: Request, res: Response, next) {
    try {
      const body = req.body;
      const entity = req.params.entity;
      const dataRepo = Services[entity];
      const data = dataRepo.save(body);
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async createItem(req: Request, res: Response, next) {
    try {
      const body = req.body;
      const entity = req.params.entity;
      const dataRepo = Services[entity];
      body.id = createUuidV4();
      const data = dataRepo.save(body);
      res.status(200).send({});
    } catch (err) {
      next(err);
    }
  }

  public async setPos(req: Request, res: Response, next) {
    try {
      const body = req.body;
      console.log(body);
      if (this.camera.ptz) {
        // PTZ is supported on this device
        let velocity = { x: -0.6, y: 1, z: 0 };
        this.camera.ptz.absoluteMove(null, velocity, null, (a, b) => {
          res.status(200).send({});
        });
      }
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.post('/:entity/list', this.getList.bind(this));
    this.router.post('/:entity/item/:id', this.getById.bind(this));
    this.router.delete('/:entity/:id', this.deleteItem.bind(this));
    this.router.patch('/:entity', this.updateItem.bind(this));
    this.router.post('/:entity', this.createItem.bind(this));
    this.router.post('/set-pos', this.setPos.bind(this));
  }
}
