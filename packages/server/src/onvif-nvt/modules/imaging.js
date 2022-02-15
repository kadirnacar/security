var Soap = require('../utils/soap');
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/img/ONVIF-Imaging-Service-Spec-v1706.pdf}<br>
 * {@link https://www.onvif.org/ver20/imaging/wsdl/imaging.wsdl}<br>
 * </p>
 */
var Imaging = /** @class */ (function () {
    function Imaging() {
        this.soap = new Soap();
        this.timeDiff = 0;
        this.serviceAddress = null;
        this.username = null;
        this.password = null;
        this.namespaceAttributes = [
            'xmlns:tns1="http://www.onvif.org/ver10/topics"',
            'xmlns:timg="http://www.onvif.org/ver20/imaging/wsdl"'
        ];
    }
    /**
     * Call this function directly after instantiating an Imaging object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    Imaging.prototype.init = function (timeDiff, serviceAddress, username, password) {
        this.timeDiff = timeDiff;
        this.serviceAddress = serviceAddress;
        this.username = username;
        this.password = password;
    };
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    Imaging.prototype.createRequest = function (body) {
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
    // Access Control API
    // ---------------------------------------------
    Imaging.prototype.getImagingSettings = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Imaging.prototype.setImagingSettings = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Imaging.prototype.getOptions = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Imaging.prototype.getPresets = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Imaging.prototype.getCurrentPreset = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Imaging.prototype.setCurrentPreset = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    // focus
    Imaging.prototype.move = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Imaging.prototype.stop = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Imaging.prototype.getImagingStatus = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Imaging.prototype.getCapabilities = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    return Imaging;
}());
module.exports = Imaging;
