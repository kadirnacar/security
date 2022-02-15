var Soap = require('../utils/soap');
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/access/ONVIF-AccessRules-Service-Spec-v100.pdf}<br>
 * {@link https://www.onvif.org/ver10/pacs/accessrules.wsdl}<br>
 * </p>
 */
var AccessRules = /** @class */ (function () {
    function AccessRules() {
        this.soap = new Soap();
        this.timeDiff = 0;
        this.serviceAddress = null;
        this.username = null;
        this.password = null;
        this.namespaceAttributes = [
            'xmlns:tar="http://www.onvif.org/ver10/accessrules/wsdl"'
        ];
    }
    /**
     * Call this function directly after instantiating a AccessRules object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    AccessRules.prototype.init = function (timeDiff, serviceAddress, username, password) {
        this.timeDiff = timeDiff;
        this.serviceAddress = serviceAddress;
        this.username = username;
        this.password = password;
    };
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    AccessRules.prototype.createRequest = function (body) {
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
    // Access Rules API
    // ---------------------------------------------
    AccessRules.prototype.getServiceCapabilities = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    AccessRules.prototype.getAccessProfileInfo = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    AccessRules.prototype.getAccessProfileInfoList = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    AccessRules.prototype.getAccessProfiles = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    AccessRules.prototype.getAccessProfileList = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    AccessRules.prototype.createAccessProfile = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    AccessRules.prototype.modifyAccessProfile = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    AccessRules.prototype.deleteAccessProfile = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    return AccessRules;
}());
module.exports = AccessRules;
