var Request = require('request');
var Util = require('./util');
/**
 * @class
 * Provide Snapshot functionaity for cameras.
 * <h3>Functions</h3>
 * {@link Snapshot#getSnapshot},
 * <br><br>
 * <h3>Overview</h3>
 * Use the Snapshot::getSnapshot() method to retrieve a snapshot from the ONVIF-compliant camera.
 */
var Snapshot = /** @class */ (function () {
    function Snapshot() {
        this.snapshotUri = '';
        this.username = '';
        this.password = '';
    }
    Snapshot.prototype.init = function (snapshotUri, username, password) {
        this.snapshotUri = snapshotUri;
        this.username = username;
        this.password = password;
    };
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
    Snapshot.prototype.getSnapshot = function (callback) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var params = {
                method: 'GET',
                uri: _this.snapshotUri,
                gzip: true,
                encoding: 'binary'
            };
            if (typeof _this.username === 'string' && typeof _this.password === 'string') {
                // Authentication is required only when 'username' and 'password' are provided
                params.auth = {
                    user: _this.username,
                    pass: _this.password,
                    sendImmediately: false
                };
            }
            Request(params, function (error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }
                if (response.statusCode === 200) {
                    var mimeType = response.headers['content-type'];
                    var data = {
                        mimeType: mimeType,
                        image: Buffer.from(body, 'binary')
                    };
                    resolve(data);
                }
                else {
                    reject(response);
                }
            });
        });
        if (Util.isValidCallback(callback)) {
            promise.then(function (results) {
                callback(null, results);
            })["catch"](function (error) {
                callback(error);
            });
        }
        else {
            return promise;
        }
    };
    return Snapshot;
}());
module.exports = Snapshot;
