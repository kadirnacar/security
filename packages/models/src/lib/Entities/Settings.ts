export interface Settings {
  maxBoxes?: number;
  scoreThreshold?: number;
  iouThreshold?: number;
  numClasses?: number;
  classNames?: string[];
  framePerSecond?: number;
  updateDate?: Date;
  imageResizeDivider?: number;
  pursuitTimeout?: number;
}
