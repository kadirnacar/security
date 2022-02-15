export = Door;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/door/ONVIF-DoorControl-Service-Spec-v1712.pdf}<br>
 * {@link https://www.onvif.org/ver10/pacs/doorcontrol.wsdl}<br>
 * </p>
 */
declare class Door {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Door object.
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
    getServiceCapabilities(): any;
    getDoorInfoList(): any;
    getDoorInfo(): any;
    getDoorState(): any;
    accessDoor(): any;
    lockDoor(): any;
    unlockDoor(): any;
    blockDoor(): any;
    lockDownDoor(): any;
    lockDownReleaseDoor(): any;
    lockOpenDoor(): any;
    lockOpenReleaseDoor(): any;
    doubleLockDoor(): any;
}
import Soap = require("../utils/soap");
