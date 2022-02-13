import { LowdbBase } from '../Lowdb/LowdbBase';
export class RoleService extends LowdbBase {
  constructor() {
    super('Role');
  }
}
export class UserService extends LowdbBase {
  constructor() {
    super('User', ['Role']);
  }
}
export class Role {
  id: any;
}

export class Users {
  id: any;

  refId?: string;

  Name?: string;

  isSystem: boolean = false;

  Image?: ArrayBuffer;

  LastUpdate?: Date = new Date();
}
