import { LowdbBase } from '..';

export class SettingsService extends LowdbBase {
  constructor() {
    super('Settings', null, false, {
      type: 'client',
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2,
      internalResolution: 'high',
      segmentationThreshold: 0.7,
      maxDetections: 5,
      scoreThreshold: 0.3,
      nmsRadius: 20,
      framePerSecond: 0.5,
      updateDate: new Date(),
    });
  }
}
