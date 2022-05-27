import { LowdbBase } from '..';

export class CaptureService extends LowdbBase {
  constructor() {
    super('Capture', ['Camera'], true, {}, [], true);
  }
}
