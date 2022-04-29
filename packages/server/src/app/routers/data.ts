import { Services } from '@security/database';
import { Request, Response, Router } from 'express';

function createUuidV4() {
  var result, i, j;
  result = '';
  for (j = 0; j < 32; j++) {
    if (j == 8 || j == 12 || j == 16 || j == 20) result = result + '';
    i = Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase();
    result = result + i;
  }
  return result;
}

export class DataRouter {
  router: Router;
  entityName: string;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async getList(req: Request, res: Response, next) {
    try {
      const entity = req.params.entity;
      const parentId = req.params['id'];
      console.log(parentId);
      const dataRepo = Services[entity];
      const data = await dataRepo.all(parentId);
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
      const data = await dataRepo.get(id);
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async getItem(req: Request, res: Response, next) {
    try {
      const entity = req.params.entity;
      const dataRepo = Services[entity];
      const data = await dataRepo.get(null);
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
      const data = await dataRepo.delete(id);
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
      const data = await dataRepo.save(body);
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
      const data = await dataRepo.save(body);
      res.status(200).send({});
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.post('/:entity/list/:id?', this.getList.bind(this));
    this.router.post('/:entity/item', this.getItem.bind(this));
    this.router.post('/:entity/item/:id', this.getById.bind(this));
    this.router.delete('/:entity/:id', this.deleteItem.bind(this));
    this.router.patch('/:entity', this.updateItem.bind(this));
    this.router.post('/:entity', this.createItem.bind(this));
  }
}
