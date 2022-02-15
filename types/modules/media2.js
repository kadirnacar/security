var Soap = require('../utils/soap');
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/media/ONVIF-Media2-Service-Spec-v1712.pdf}<br>
 * {@link https://www.onvif.org/ver20/media/wsdl/media.wsdl}<br>
 * </p>
 */
var Media2 = /** @class */ (function () {
    function Media2() {
        this.soap = new Soap();
        this.timeDiff = 0;
        this.serviceAddress = null;
        this.username = null;
        this.password = null;
        this.namespaceAttributes = [
            // 'xmlns:tns1="http://www.onvif.org/ver10/topics"',
            // 'xmlns:trt="http://www.onvif.org/ver10/media/wsdl"'
            // 'xmlns:trt="http://www.onvif.org/ver10/media/wsdl"',
            // 'xmlns:tt="http://www.onvif.org/ver10/schema"'
            'xmlns:tr2="http://www.onvif.org/ver20/media/wsdl"'
        ];
    }
    /**
     * Call this function directly after instantiating a Media2 object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    Media2.prototype.init = function (timeDiff, serviceAddress, username, password) {
        this.timeDiff = timeDiff;
        this.serviceAddress = serviceAddress;
        this.username = username;
        this.password = password;
    };
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    Media2.prototype.createRequest = function (body) {
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
    // Media2 API
    // ---------------------------------------------
    Media2.prototype.createProfile = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getProfiles = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // let soapBody = '<trt:GetProfiles/>'
            var soapBody = '<GetProfiles xmlns="http://www.onvif.org/ver10/media/wsdl"/>';
            var soapEnvelope = _this.createRequest(soapBody);
            console.log(soapEnvelope);
            return _this.soap.makeRequest('media2', _this.serviceAddress, 'GetProfiles', soapEnvelope)
                .then(function (results) {
                resolve(results);
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    Media2.prototype.addConfiguration = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.removeConfiguration = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.deleteProfile = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    // Get<entity>Configurations
    Media2.prototype.getConfigurations = function ( /* entity */) {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    // Set<entity>Configuration
    Media2.prototype.setConfigurations = function ( /* entity */) {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    // Get<entity>ConfigurationOptions
    Media2.prototype.getConfigurationOptions = function ( /* entity */) {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getVideoEncoderInstances = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getStreamUri = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getSnapshotUri = function (profileToken) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var soapBody = '';
            soapBody += '<trt:GetSnapshotUri>';
            soapBody += '<trt:ProfileToken>' + profileToken + '</trt:ProfileToken>';
            soapBody += '</trt:GetSnapshotUri>';
            var soapEnvelope = _this.createRequest(soapBody);
            return _this.soap.makeRequest('media2', _this.serviceAddress, 'GetSnapshotUri', soapEnvelope)
                .then(function (results) {
                resolve(results);
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    Media2.prototype.startMulticastStreaming = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.stopMulticastStreaming = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.setSynchronizationPoint = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getVideoSourceModes = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.createOSD = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.deleteOSD = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getOSDs = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getOSD = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.setOSD = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getOSDOptions = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.createMask = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.deleteMask = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getMasks = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.setMask = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getMaskOptions = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Media2.prototype.getServiceCapabilities = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    return Media2;
}());
module.exports = Media2;
