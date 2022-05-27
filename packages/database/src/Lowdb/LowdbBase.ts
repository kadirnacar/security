import * as lowdb from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import * as path from 'path';
import { Utils } from '../utils';
import * as crypto from 'crypto';

const randomCameraId = 'bncaskdbvasbvlaslslasfhj';
const key = crypto.scryptSync(randomCameraId, 'GfG', 32);
const iv = crypto.randomBytes(16);

const serializer = {
  serialize: (array: any[]) => {
    return JSON.stringify(array, (key, value) => {
      if (value !== null && value !== '' && value !== undefined) return value;
    });
  },
  deserialize: function (string: string) {
    return JSON.parse(string);
  },
};

function encrypt(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    dateCrypt: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
  };
}

// Decrypting text
function decrypt(text) {
  let iv = Buffer.from(text.dateCrypt, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const cryptSerializer = {
  serialize: function (array: any[]) {
    // return JSON.stringify(array, (key, value) => {
    //   if (value !== null && value !== '' && value !== undefined) return value;
    // });
    return JSON.stringify(
      encrypt(
        JSON.stringify(array, (key, value) => {
          if (value !== null && value !== '' && value !== undefined)
            return value;
        })
      )
    );
  },
  deserialize: function (string: string) {
    // return JSON.parse(string);

    return JSON.parse(decrypt(JSON.parse(string)));
  },
};

export class LowdbBase {
  constructor(
    entityName: string,
    parentEntityName?: string[],
    multi = true,
    defaultSchema: any = {},
    ignoredProperties: any[] = [],
    crypted: boolean = false
  ) {
    this.entityName = entityName;
    this.parentEntityName = parentEntityName || [];
    this.multi = multi;
    this.defaultSchema = defaultSchema;
    this.ignoredProperties = ignoredProperties;
    this.crypted = crypted;
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
  private ignoredProperties: string[] = [];
  private crypted: boolean = false;

  private generateGuid() {
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

  private init() {
    const filePath = path.resolve(__dirname, 'data', this.entityName);
    if (!Utils.checkFileExists(filePath)) Utils.mkDirByPathSync(filePath);
    this.dbAdapter = new FileSync(
      path.resolve(filePath, 'index.json'),
      this.crypted ? cryptSerializer : serializer
    );
    this.db = lowdb(this.dbAdapter);
    if (!this.db.has(this.entityName).value()) {
      let defaultSchema: any = {};
      defaultSchema[this.entityName] = this.multi ? [] : this.defaultSchema;
      this.db.defaults(defaultSchema).write();
    }
  }

  public getDb(parentId?: string) {
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

        this.dbAdapter[parentId] = new FileSync(
          path.resolve(filePath, 'index.json'),
          this.crypted ? cryptSerializer : serializer
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

  public all(parentId?: string) {
    const result = this.getDb(parentId);
    return JSON.parse(
      JSON.stringify(result.value(), (key, value) => {
        if (this.ignoredProperties.includes(key)) {
          return undefined;
        } else {
          return value;
        }
      })
    );
  }

  public get(id: string, parentId?: string): Promise<any> {
    const db = this.getDb(parentId);
    const data = this.multi ? db?.find({ id: id }) : db;
    return JSON.parse(
      JSON.stringify(data.value(), (key, value) => {
        if (this.ignoredProperties.includes(key)) {
          return undefined;
        } else {
          return value;
        }
      })
    );
  }

  public save(model: any, parentId?: string) {
    var db = this.getDb(parentId);
    var data = this.multi ? db?.find({ id: model.id }) : db;

    let savedData = JSON.parse(
      JSON.stringify(model, (key, value) => {
        if (this.ignoredProperties.includes(key)) {
          return undefined;
        } else {
          return value;
        }
      })
    );
    for (const property of this.ignoredProperties) {
      delete savedData[property];
    }

    if (!savedData.id) {
      savedData.id = this.generateGuid();
    }

    if (data) {
      if (this.multi && model.id) {
        data.merge(savedData).write();
      } else if (this.multi) {
        db.push(savedData).write();
      } else {
        data.merge(savedData).write();
      }
    } else {
      db.push(savedData).write();
    }
    return savedData;
  }

  public delete(id: string, parentId?: string) {
    const item = this.get(id, parentId);
    if (item) {
      const db = this.getDb(parentId);

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
