export interface Settings {
  type: 'server' | 'client';
  architecture?: 'MobileNetV1' | 'ResNet50';
  outputStride?: 8 | 16 | 32;
  multiplier?: 0.5 | 0.75 | 1;
  quantBytes?: 1 | 2 | 4;
  internalResolution?: 'low' | 'medium' | 'high' | 'full';
  segmentationThreshold?: number;
  maxDetections?: number;
  scoreThreshold?: number;
  nmsRadius?: number;
  framePerSecond?: number;
  updateDate?: Date;
}
