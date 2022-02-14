import { LowdbBase } from '..';

export class UserService extends LowdbBase {
  constructor() {
    super('User');
  }
}
