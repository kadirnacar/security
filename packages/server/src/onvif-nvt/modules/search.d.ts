export = Search;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/rsrch/ONVIF-RecordingSearch-Service-Spec-v1706.pdf}<br>
 * {@link https://www.onvif.org/ver10/search.wsdl}<br>
 * </p>
 */
declare class Search {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Search object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    init(timeDiff: number, serviceAddress: object, username?: string | undefined, password?: string | undefined): void;
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    createRequest(body: string): string;
    getRecordingSummary(): any;
    getRecordingInformation(): any;
    getMediaAttributes(): any;
    findRecordings(): any;
    getRecordingSearchResults(): any;
    findEvents(): any;
    getEventSearchResults(): any;
    findPTZPosition(): any;
    getPTZPositionSearchResults(): any;
    findMetadata(): any;
    getMetadataSearchResults(): any;
    endSearch(): any;
    getServiceCapabilities(): any;
}
import Soap = require("../utils/soap");
