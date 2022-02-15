export = Snapshot;
/**
 * @class
 * Provide Snapshot functionaity for cameras.
 * <h3>Functions</h3>
 * {@link Snapshot#getSnapshot},
 * <br><br>
 * <h3>Overview</h3>
 * Use the Snapshot::getSnapshot() method to retrieve a snapshot from the ONVIF-compliant camera.
 */
declare class Snapshot {
    snapshotUri: string;
    username: string;
    password: string;
    init(snapshotUri: any, username: any, password: any): void;
    /**
     * Retrieves a snapshot from the specified camera
     * @param {callback=} callback Optional callback, instead of a Promise.
     * @example
     * const OnvifManager = require('onvif-nvt')
     * OnvifManager.connect('10.10.1.60', 80, 'username', 'password')
     *   .then(results => {
     *     let camera = results
     *     // calling add method will automatically initialize snapshot
     *     // with the defaultProfile's snapshotUri
     *     camera.add('snapshot')
     *     camera.snapshot.getSnapshot()
     *       .then(results => {
     *         let mimeType = results.mimeType
     *         let rawImage = results.image
     *         let prefix = 'data:' + mimeType + ';base64,'
     *         let base64Image = Buffer.from(rawImage, 'binary').toString('base64')
     *         let image = prefix + base64Image
     *         // 'image' is now ready to be displayed on a web page
     *         // ...
     *       })
     *     }
     *   })
     */
    getSnapshot(callback?: any): any;
}
