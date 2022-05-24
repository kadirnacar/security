var Util = require('./utils/util');
/**
 * If the OnvifManager class is used to connect to a camera, it will
 * manage your devices (cameras). It stores cameras by address. You
 * can use address to retrieve the camera.
 */
var OnvifManager = /** @class */ (function () {
    function OnvifManager() {
        this.discovery = null;
        this.cameras = {};
    }
    /**
     * Add a module to OnvifManager. Currently, the only available module is 'discovery'.
     * @param {string} name The name of the module.
     */
    OnvifManager.prototype.add = function (name) {
        switch (name) {
            case 'discovery':
                // eslint-disable-next-line no-case-declarations
                var Discovery = require('./modules/discovery');
                this.discovery = new Discovery();
                break;
            default:
                throw new Error("The only acceptable module that can be added to OnvifManager is \"discovery\" - not \"".concat(name, "\"."));
        }
    };
    /**
     * Connects to an ONVIF device.
     * @param {string} address The address of the ONVIF device (ie: 10.10.1.20)
     * @param {integer=} port The port of the ONVIF device. Defaults to 80.
     * @param {string=} username The user name used to make a connection.
     * @param {string=} password The password used to make a connection.
     * @param {string=} servicePath The service path for the camera. If null or 'undefined' the default path according to the ONVIF spec will be used.
     * @param {callback=} callback Optional callback, instead of a Promise.
     * @returns A Promise. On success, resolve contains a Camera object.
     */
    OnvifManager.prototype.connect = function (address, port, username, password, servicePath, callback) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var errMsg = '';
            if ((errMsg = Util.isInvalidValue(address, 'string'))) {
                reject(new Error('The "address" argument for connect is invalid: ' + errMsg));
                return;
            }
            var cacheKey = "".concat(address, ":").concat(port);
            var c = _this.cameras[cacheKey];
            if (c) {
                resolve(c);
                return;
            }
            // default to port 80 if none provided
            port = port || 80;
            var Camera = require('./camera');
            var camera = new Camera();
            return camera.connect(address, port, username, password, servicePath)
                .then(function (results) {
                // cache camera after successfully connecting
                _this.cameras[cacheKey] = camera;
                resolve(camera);
            })["catch"](function (error) {
                // console.error(error);
                reject(error);
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
    return OnvifManager;
}());
module.exports = new OnvifManager();
