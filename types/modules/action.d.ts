export = Action;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/act/ONVIF-ActionEngine-Service-Spec-v100.pdf}<br>
 * {@link https://www.onvif.org/ver10/actionengine.wsdl}<br>
 * </p>
 */
declare class Action {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating an Action object.
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
    getSupportedActions(): any;
    getActions(): any;
    createActions(): any;
    modifyActions(): any;
    deleteActions(): any;
    getServiceCapabilities(): any;
    getActionTriggers(): any;
    modifyActionTriggers(): any;
    deleteActionTriggers(): any;
    createActionTriggers(): any;
}
import Soap = require("../utils/soap");
