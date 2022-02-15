var Soap = require('../utils/soap');
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/rsrch/ONVIF-RecordingSearch-Service-Spec-v1706.pdf}<br>
 * {@link https://www.onvif.org/ver10/search.wsdl}<br>
 * </p>
 */
var Search = /** @class */ (function () {
    function Search() {
        this.soap = new Soap();
        this.timeDiff = 0;
        this.serviceAddress = null;
        this.username = null;
        this.password = null;
        this.namespaceAttributes = [
            'xmlns:tse="http://www.onvif.org/ver10/search/wsdl"'
        ];
    }
    /**
     * Call this function directly after instantiating a Search object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    Search.prototype.init = function (timeDiff, serviceAddress, username, password) {
        this.timeDiff = timeDiff;
        this.serviceAddress = serviceAddress;
        this.username = username;
        this.password = password;
    };
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    Search.prototype.createRequest = function (body) {
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
    // Search (Recording) API
    // ---------------------------------------------
    Search.prototype.getRecordingSummary = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.getRecordingInformation = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.getMediaAttributes = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.findRecordings = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.getRecordingSearchResults = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.findEvents = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.getEventSearchResults = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.findPTZPosition = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.getPTZPositionSearchResults = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.findMetadata = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.getMetadataSearchResults = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.endSearch = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    Search.prototype.getServiceCapabilities = function () {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    return Search;
}());
module.exports = Search;
