export = Access;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/access/ONVIF-AccessControl-Service-Spec-v103.pdf}<br>
 * {@link https://www.onvif.org/ver10/pacs/accesscontrol.wsdl}<br>
 * </p>
 *
 */
declare class Access {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating an Access object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    init(timeDiff: number, serviceAddress: object, username?: string | undefined, password?: string | undefined): void;
    /**
     * Private function for creating a SOAP request.
     * @param {*} body The body of the xml.
     */
    createRequest(body: any): string;
    getServiceCapabilities(): any;
    getAccessProfileInfo(): any;
    getAccessProfileInfoList(): any;
    getAccessProfiles(): any;
    getAccessProfileList(): any;
    createAccessProfile(): any;
    modifyAccessProfile(): any;
    deleteAccessProfile(): any;
}
import Soap = require("../utils/soap");
