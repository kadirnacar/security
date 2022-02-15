var Soap = require('../utils/soap');
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/analytics/ONVIF-VideoAnalyticsDevice-Service-Spec-v211.pdf}<br>
 * {@link https://www.onvif.org/ver10/analyticsdevice.wsdl}<br>
 * </p>
 */
var VideoAnalytics = /** @class */ (function () {
    function VideoAnalytics() {
        this.soap = new Soap();
        this.timeDiff = 0;
        this.serviceAddress = null;
        this.username = null;
        this.password = null;
        // TODO: Jeff need namespaces
        this.namespaceAttributes = [
            // TODO: for analyticsdevice (device and video)
            'xmlns:tad="http://www.onvif.org/ver10/analyticsdevice.wsdl"'
        ];
    }
    /**
     * Call this function directly after instantiating a VideoAnalytics object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    VideoAnalytics.prototype.init = function (timeDiff, serviceAddress, username, password) {
        this.timeDiff = timeDiff;
        this.serviceAddress = serviceAddress;
        this.username = username;
        this.password = password;
    };
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    VideoAnalytics.prototype.createRequest = function (body) {
        var soapEnvelope = this.soap.createRequest({
            body: body,
            xmlns: this.namespaceAttributes,
            diff: this.timeDiff,
            username: this.username,
            password: this.password
        });
        return soapEnvelope;
    };
    // ---------------------------------------------
    // Video Analytics API
    // ---------------------------------------------
    VideoAnalytics.prototype.getAnalyticsEngineInputs = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.getAnalyticsEngineInput = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.setAnalyticsEngineInput = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.createAnalyticsEngineInputs = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.deleteAnalyticsEngineInputs = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.getVideoAnalyticsConfiguration = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.setVideoAnalyticsConfiguration = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.getAnalyticsEngines = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.getAnalyticsEngine = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.getAnalyticsEngineControls = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.getAnalyticsEngineControl = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.setAnalyticsEngineControl = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.createAnalyticsEngineControl = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.deleteAnalyticsEngineControl = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.getAnalyticsState = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.getAnalyticsDeviceStreamUri = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    VideoAnalytics.prototype.getServiceCapabilities = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    return VideoAnalytics;
}());
module.exports = VideoAnalytics;
