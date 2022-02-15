var Soap = require('../utils/soap');
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/thermal/ONVIF-Thermal-Service-Spec-v1706.pdf}<br>
 * {@link https://www.onvif.org/ver10/thermal/wsdl/thermal.wsdl}<br>
 * </p>
 */
var Thermal = /** @class */ (function () {
    function Thermal() {
        this.soap = new Soap();
        this.timeDiff = 0;
        this.serviceAddress = null;
        this.username = null;
        this.password = null;
        // TODO: Jeff need namespaces
        this.namespaceAttributes = [
            'xmlns:tns1="http://www.onvif.org/ver10/topics"',
            'xmlns:tth="http://www.onvif.org/ver10/thermal/wsdl"'
        ];
    }
    /**
     * Call this function directly after instantiating a Thermal object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    Thermal.prototype.init = function (timeDiff, serviceAddress, username, password) {
        this.timeDiff = timeDiff;
        this.serviceAddress = serviceAddress;
        this.username = username;
        this.password = password;
    };
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    Thermal.prototype.createRequest = function (body) {
        var soapEnvelope = this.soapSoap.createRequest({
            body: body,
            xmlns: this.namespaceAttributes,
            diff: this.timeDiff,
            username: this.username,
            password: this.password
        });
        return soapEnvelope;
    };
    // ---------------------------------------------
    // Thermal API
    // ---------------------------------------------
    Thermal.prototype.getConfiguration = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Thermal.prototype.setConfigurationSettings = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Thermal.prototype.getConfigurationOptions = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Thermal.prototype.getConfigurations = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Thermal.prototype.getRadiometryConfiguration = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Thermal.prototype.setRadiometryConfigurationSettings = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Thermal.prototype.getRadiometryConfigurationOptions = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Thermal.prototype.getServiceCapabilities = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    return Thermal;
}());
module.exports = Thermal;
