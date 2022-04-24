import { Camera, IGlRect } from '@security/models';
import { CamPoint } from 'packages/models/src/lib/Entities/Camera';
import { CameraService } from '../../services/CameraService';

export class PursuitController {
  constructor(ptzCamera?: Camera) {
    this.ptzCamera = ptzCamera;
    this.boxes = {};
    this.setTimer();
  }

  public ptzCamera?: Camera;
  private boxes: { [key: string]: any[] } = {};
  private intervalProcess?: any;
  private interval = 3000;
  private maxBoxesDistance = 4;

  public stop() {
    if (this.intervalProcess) {
      clearInterval(this.intervalProcess);
    }
  }

  setBoxes(camId: string, boxes: any[]) {
    if (camId && this.boxes[camId]) {
      this.boxes[camId] = boxes;
    } else if (camId) {
      this.boxes[camId] = boxes;
    }
  }

  private setTimer() {
    if (this.intervalProcess) {
      clearInterval(this.intervalProcess);
    }

    this.intervalProcess = setInterval(
      this.pursuitAction.bind(this),
      this.interval
    );
  }

  private lastCameraIndex = 0;

  private getBox() {
    const cams = Object.keys(this.boxes);
    if (this.lastCameraIndex >= cams.length) {
      this.lastCameraIndex = 0;
    }
    const camKey = cams[this.lastCameraIndex];

    if (camKey) {
      if (this.boxes[camKey].length > 0) {
        this.lastCameraIndex++;
        return { camId: camKey, item: this.boxes[camKey][0] };
      }
    }

    return null;
  }

  private getBetween(val, min, max) {
    if (val <= max && val >= min) {
      return val;
    } else {
      return min + (Math.abs(val) - Math.abs(max));
    }
  }

  private calculateDiff(left, right, min, max) {
    const leftValue = this.getBetween(left, min, max);
    const rightValue = this.getBetween(right, min, max);
    if (rightValue < 0 && leftValue >= 0) {
      return max - leftValue - (min - rightValue);
    }
    // if (
    //   (left < 0 && right < 0) ||
    //   (left < 0 && right >= 0) ||
    //   (left >= 0 && right >= 0)
    // )
    else {
      return rightValue - leftValue;
    }
  }

  private getFloat(value) {
    let cuurentValue: number = 0;
    try {
      cuurentValue = parseFloat(value);
    } catch {}
    return isNaN(cuurentValue) ? 0 : cuurentValue;
  }

  private async pursuitAction() {
    if (this.ptzCamera) {
      const box = this.getBox();
      if (box && this.ptzCamera.cameras[box.camId]) {
        const camRel = this.ptzCamera.cameras[box.camId];
        const pointsDistances = this.getNearestPoint(camRel.boxes, {
          x: box.item.left,
          y: box.item.top,
        })
          .sort((a, b) => {
            if (a.dist > b.dist) {
              return 1;
            } else if (a.dist < b.dist) {
              return -1;
            } else {
              return 0;
            }
          })
          .slice(0, this.maxBoxesDistance);

        if (pointsDistances.length > 0) {
          const refBox = camRel.boxes.filter((x, i) =>
            pointsDistances.find((y) => y.item && y.index == i)
          );

          if (refBox) {
            const minX = pointsDistances.sort((a, b) => {
              if (a.item.coord.x > b.item.coord.x) {
                return 1;
              } else if (a.item.coord.x < b.item.coord.x) {
                return -1;
              }
              return 0;
            })[0];
            const minY = pointsDistances.sort((a, b) => {
              if (a.item.coord.y > b.item.coord.y) {
                return 1;
              } else if (a.item.coord.y < b.item.coord.y) {
                return -1;
              }
              return 0;
            })[0];

            const maxX = pointsDistances.sort((a, b) => {
              if (a.item.coord.x > b.item.coord.x) {
                return -1;
              } else if (a.item.coord.x < b.item.coord.x) {
                return 1;
              }
              return 0;
            })[0];
            const maxY = pointsDistances.sort((a, b) => {
              if (a.item.coord.y > b.item.coord.y) {
                return -1;
              } else if (a.item.coord.y < b.item.coord.y) {
                return 1;
              }
              return 0;
            })[0];

            const ptzLimits = this.getCametaPtzLimits();

            if (ptzLimits) {
              let minLeft = this.getFloat(minX.item.pos.x);
              let minLeftCoord = this.getFloat(minX.item.coord.x);
              let maxRight = this.getFloat(maxX.item.pos.x);
              let maxRightCoord = this.getFloat(maxX.item.coord.x);
              let xLength = this.calculateDiff(
                minLeft,
                maxRight,
                ptzLimits.x.min,
                ptzLimits.x.max
              );
              let coordXLength = maxRightCoord - minLeftCoord;

              let minTop = this.getFloat(minY.item.pos.y);
              let minTopCoord = this.getFloat(minY.item.coord.y);
              let maxBottom = this.getFloat(maxY.item.pos.y);
              let maxBottomCoord = this.getFloat(maxY.item.coord.y);
              let yLength = this.calculateDiff(
                minTop,
                maxBottom,
                ptzLimits.y.min,
                ptzLimits.y.max
              );
              let coordYLength = maxBottomCoord - minTopCoord;

              let xPos = this.getBetween(
                minLeft +
                  (Math.abs(box.item.left + box.item.width / 2 - minLeftCoord) *
                    xLength) /
                    coordXLength,
                ptzLimits.x.min,
                ptzLimits.x.max
              );

              let yPos = this.getBetween(
                minTop +
                  (Math.abs(box.item.top + box.item.height / 2 - minTopCoord) *
                    yLength) /
                    coordYLength,
                ptzLimits.y.min,
                ptzLimits.y.max
              );

              const d = box.item.width / (camRel.resulation?.width || 1);
              console.log(d, yPos, box, minTopCoord, coordYLength, ptzLimits);

              //   console.log(
              //     xPos,
              //     yPos,
              //     refBox,
              //     minX,
              //     maxX,
              //     minY,
              //     maxY,
              //     xLength,
              //     yLength,
              //     coordXLength,
              //     coordYLength
              //   );
              await this.goToPosition({
                x: xPos.toFixed(2),
                y: yPos.toFixed(2),
                z: (-1 * yPos).toFixed(2),
              });
            }
            // await this.goToPosition(refBox);
          }
        }
        // console.log('run', box, pointsDistances);
      }
    }
  }

  private async goToPosition(velocity: { x: any; y: any; z: any }) {
    if (this.ptzCamera) {
      await CameraService.pos(this.ptzCamera.id || '', velocity, {
        x: 1,
        y: 1,
        z: 1,
      });
    }
  }

  private getDiaDist(point) {
    return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
  }

  private getDistance(p1, p2) {
    return this.getDiaDist({ x: p1.x - p2.x, y: p1.y - p2.y });
  }

  public getNearestPoint(arr: CamPoint[], point) {
    let result: { index: number; dist: number; item: CamPoint }[] = [];

    for (let index = 0; index < arr.length; index++) {
      const a = arr[index];
      let dist = this.getDistance(a.coord, point);
      result.push({ index, dist, item: a });
    }

    return result;
  }

  private getCametaPtzLimits() {
    if (this.ptzCamera) {
      const ptzLimitsXml =
        this.ptzCamera.camInfo.defaultProfile.PTZConfiguration.PanTiltLimits;
      const zoomLimitsXml =
        this.ptzCamera.camInfo.defaultProfile.PTZConfiguration.ZoomLimits;

      const minX = parseFloat(ptzLimitsXml?.Range.XRange.Min);
      const maxX = parseFloat(ptzLimitsXml?.Range.XRange.Max);
      const minY = parseFloat(ptzLimitsXml?.Range.YRange.Min);
      const maxY = parseFloat(ptzLimitsXml?.Range.YRange.Max);
      const minZoom = parseFloat(zoomLimitsXml?.Range.XRange.Min);
      const maxZoom = parseFloat(zoomLimitsXml?.Range.XRange.Max);

      const ptzLimits = {
        x: {
          min: isNaN(minX) ? -1 : minX,
          max: isNaN(maxX) ? 1 : maxX,
        },
        y: {
          min: isNaN(minY) ? -1 : minY,
          max: isNaN(maxY) ? 1 : maxY,
        },
      };
      const zoomLimits = {
        min: isNaN(minZoom) ? -1 : minZoom,
        max: isNaN(maxZoom) ? 1 : maxZoom,
      };

      return ptzLimits;
    }
    return null;
  }
}
