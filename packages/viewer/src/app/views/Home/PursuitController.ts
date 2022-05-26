import { Camera, IGlRect } from '@security/models';
import { CamPoint } from 'packages/models/src/lib/Entities/Camera';
import { CameraService } from '../../services/CameraService';
import { dataURItoBlob, ICamComtext } from '../../utils';

export class PursuitController {
  constructor(ptzCamera?: Camera, interval?: number) {
    this.ptzCamera = ptzCamera;
    this.interval = interval || 3000;
    this.boxes = {};
    this.setTimer();
  }

  public ptzCamera?: Camera;
  public getShapshotCanvas?: (camId: string) => HTMLCanvasElement | undefined;
  private boxes: { [key: string]: any[] } = {};
  public currentBox: any = null;
  private intervalProcess?: any;
  private interval = 3000;
  private maxBoxesDistance = 4;
  public onPursuit?: (item) => void;

  public stop() {
    if (this.intervalProcess) {
      clearInterval(this.intervalProcess);
    }
  }

  setBoxes(camId: string, boxes: any[]) {
    const classType = this.lastCarIndex % 3 == 0 ? 'person' : 'car';
    if (camId && this.boxes[camId]) {
      this.boxes[camId] = boxes.filter((x) => x.class == classType);
    } else if (camId) {
      this.boxes[camId] = boxes.filter((x) => x.class == classType);
    }
    // console.log(this.lastCarIndex % 2, classType, this.boxes[camId]);
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
  private lastCarIndex = 0;

  private getBox() {
    this.lastCarIndex++;
    const cams = Object.keys(this.boxes);
    // if (this.lastCameraIndex >= cams.length) {
    //   this.lastCameraIndex = 0;
    // }
    const camKey = cams[this.lastCameraIndex % cams.length];
    this.lastCameraIndex++;

    if (camKey) {
      if (this.boxes[camKey].length > 0) {
        let i = Math.floor(Math.random() * this.boxes[camKey].length);
        const item = this.boxes[camKey][i];
        return {
          camId: camKey,
          item: {
            ...item,
            left: item.left + item.width / 2,
            top: item.top + item.height / 2,
          },
        };
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
      if (this.currentBox && this.getShapshotCanvas) {
        const canvas = this.getShapshotCanvas(this.ptzCamera.id || '');
        if (canvas) {
          const imageData = canvas?.toDataURL();
          const d = await (
            await CameraService.getSnapshot(
              this.ptzCamera.id || '',
              imageData,
              this.currentBox
            )
          ).value;
          if (this.onPursuit) {
            this.onPursuit(d);
          }
          //   let isProcess = false;
          //   form.submit('http://localhost:8888/alpr', function (err, res2) {
          //     if (err) return;
          //     isProcess = true;
          //     res2.on('data', function (chunk) {
          //       let jsonResult: any = {};

          //       try {
          //         jsonResult = JSON.parse(chunk.toString());
          //       } catch {}

          //       imageFileName = path.resolve(
          //         imageFolder,
          //         `${moment().format('dd-MM-yyyy-HH-mm')}_${
          //           jsonResult &&
          //           jsonResult.results &&
          //           jsonResult.results.length > 0
          //             ? jsonResult.results[0].plate
          //             : 'PlakaYok'
          //         }_${data.position.x}_${data.position.y}_${data.position.z}.jpeg`
          //       );
          //       fs.writeFileSync(imageFileName, snapshot.rawImage);
          //       res.contentType('application/json');
          //       res.end(chunk);
          //     });
          //   });

          // const d = await (
          //   await CameraService.getSnapshot(
          //     this.ptzCamera.id || '',
          //     canvas?.toDataURL(),
          //     this.currentBox
          //   )
          // ).value;

          // if (d && d.results && d.results.length > 0) {
          // }
        }
      }
      this.currentBox = this.getBox();

      if (this.currentBox && this.ptzCamera.cameras[this.currentBox.camId]) {
        const camRel = this.ptzCamera.cameras[this.currentBox.camId];
        const pointsDistances = this.getNearestPoint(camRel.boxes, {
          x: this.currentBox.item.left,
          y: this.currentBox.item.top,
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
                (Math.abs(this.currentBox.item.left - minLeftCoord) * xLength) /
                  coordXLength,
              ptzLimits.x.min,
              ptzLimits.x.max
            );
            const m = 0;
            // this.currentBox.item.height /
            // (this.currentBox.item.class == 'person' ? 3 : 2);
            let yPos = this.getBetween(
              minTop +
                (Math.abs(this.currentBox.item.top - minTopCoord) * yLength) /
                  coordYLength,
              ptzLimits.y.min,
              ptzLimits.y.max
            );
            const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

            const zoom = clamp(Number(yPos) / 2, 0, 1).toFixed(2);

            await this.goToPosition({
              x: xPos.toFixed(2),
              y: yPos.toFixed(2),
              z: zoom,
            });
          }
        }
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
