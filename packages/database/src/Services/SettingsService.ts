import { LowdbBase } from '..';

export class SettingsService extends LowdbBase {
  constructor() {
    super('Settings', null, false, {
      maxBoxes: 20,
      scoreThreshold: 0.5,
      iouThreshold: 0.3,
      numClasses: 80,
      classNames: ['person', 'car', 'motorbike', 'bus', 'truck'],
      framePerSecond: 0.5,
      updateDate: new Date(),
      imageResizeDivider: 2,
    });
  }
}
