var Soap = require('../utils/soap');
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/io/ONVIF-DeviceIo-Service-Spec-v1712.pdf}<br>
 * {@link https://www.onvif.org/ver10/deviceio.wsdl}<br>
 * </p>
 */
var DeviceIO = /** @class */ (function () {
    function DeviceIO() {
        this.soap = new Soap();
        this.timeDiff = 0;
        this.serviceAddress = null;
        this.username = null;
        this.password = null;
        this.namespaceAttributes = [
            'xmlns:tmd="http://www.onvif.org/ver10/deviceIO/wsdl"'
        ];
    }
    /**
     * Call this function directly after instantiating a DeviceIO object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    DeviceIO.prototype.init = function (timeDiff, serviceAddress, username, password) {
        this.timeDiff = timeDiff;
        this.serviceAddress = serviceAddress;
        this.username = username;
        this.password = password;
    };
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    DeviceIO.prototype.createRequest = function (body) {
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
    // Device IO API
    // ---------------------------------------------
    DeviceIO.prototype.getVideoOutputs = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getVideoOutputConfiguration = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.setVideoOutputConfiguration = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getVideoOutputConfigurationOptions = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getVideoSources = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getAudioOutputs = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getAudioSources = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getRelayOutputs = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getRelayOutputOptions = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getRelayOutputSettings = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.triggerRelayOutput = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getDigitalInputs = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getDigitalInputConfigurationOptions = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.setDigitalInputConfigurations = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getSerialPorts = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getSerialPortConfiguration = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.setSerialPortConfiguration = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.getSerialPortConfigurationOptions = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.sendReceiveSerial = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    DeviceIO.prototype.capabilities = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    return DeviceIO;
}());
module.exports = DeviceIO;
