import * as lowdb from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import * as path from 'path';
import { Utils } from '../utils';

const serializer = {
  serialize: (array: any[]) => {
    return JSON.stringify(array, (key, value) => {
      if (value !== null && value !== '' && value !== undefined) return value;
    });
  },
  deserialize: (string: string) => JSON.parse(string),
};

export class LowdbBase {
  constructor(
    entityName: string,
    parentEntityName?: string[],
    multi = true,
    defaultSchema: any = {}
  ) {
    this.entityName = entityName;
    this.parentEntityName = parentEntityName || [];
    this.multi = multi;
    this.defaultSchema = defaultSchema;
    if (!this.parentEntityName || this.parentEntityName.length == 0) {
      this.init();
    }
  }

  private multi = true;
  private defaultSchema: any = {};
  private entityName: string;
  private parentEntityName: string[];
  private dbAdapter: any = {};
  private db: any = {};

  private init() {
    const filePath = path.resolve(__dirname, 'data', this.entityName);
    if (!Utils.checkFileExists(filePath)) Utils.mkDirByPathSync(filePath);
    this.dbAdapter = new FileSync(
      path.resolve(filePath, 'index.json'),
      serializer
    );
    this.db = lowdb(this.dbAdapter);
    if (!this.db.has(this.entityName).value()) {
      let defaultSchema: any = {};
      defaultSchema[this.entityName] = this.multi ? [] : this.defaultSchema;
      this.db.defaults(defaultSchema).write();
    }
  }

  public async getDb(parentId?: string) {
    if (this.parentEntityName == null || this.parentEntityName.length == 0) {
      return this.db.get(this.entityName);
    } else if (parentId) {
      if (!this.db[parentId]) {
        const filePath = path.resolve(
          __dirname,
          'data',
          this.parentEntityName.join('\\'),
          parentId,
          this.entityName
        );
        if (!Utils.checkFileExists(filePath)) Utils.mkDirByPathSync(filePath);
        // this.dbAdapter[parentId] = new FileAsync(path.resolve(filePath, "index.json"), serializer);
        this.dbAdapter[parentId] = new FileSync(
          path.resolve(filePath, 'index.json'),
          serializer
        );

        this.db[parentId] = lowdb(this.dbAdapter[parentId]);
        if (!this.db[parentId].has(this.entityName).value()) {
          let defaultSchema: any = {};
          defaultSchema[this.entityName] = this.multi ? [] : this.defaultSchema;
          this.db[parentId].defaults(defaultSchema).write();
        }
      }
      return this.db[parentId].get(this.entityName);
    } else {
      return null;
    }
  }

  public async all(parentId?: string) {
    const result = await this.getDb(parentId);
    return result.value();
  }

  public async get(id: string, parentId?: string): Promise<any> {
    const db = await this.getDb(parentId);
    const data = this.multi ? db?.find({ id: id }).value() : db?.value();
    return data;
  }

  public async save(model: any, parentId?: string) {
    var db = await this.getDb(parentId);
    var data = this.multi ? db?.find({ id: model.id }).value() : db?.value();
    if (data) {
      this.multi
        ? db.find({ id: model.id }).assign(model).write()
        : db.assign(model).write();
    } else {
      this.multi ? db?.push(model).write() : db?.assign(model).write();
    }
  }

  public async delete(id: string, parentId?: string): Promise<void> {
    const item = await this.get(id, parentId);
    if (item) {
      const db = await this.getDb(parentId);

      this.multi ? db?.remove({ id: id }).write() : db?.assign({}).write();

      if (!this.parentEntityName || this.parentEntityName.length > 0) {
        try {
          const filePath = path.resolve(
            __dirname,
            'data',
            this.parentEntityName.join('\\'),
            parentId!,
            this.entityName
          );
          Utils.deleteFolderRecursive(filePath);
        } catch {}
      }
    }
  }
}
