export = Receiver;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/rcv/ONVIF-Receiver-Service-Spec-v1706.pdf}<br>
 * {@link https://www.onvif.org/ver10/receiver.wsdl}<br>
 * </p>
 */
declare class Receiver {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Receiver object.
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
    getReceivers(): any;
    getReceiver(): any;
    createReceiver(): any;
    deleteReceiver(): any;
    configureReceiver(): any;
    setReceiverMode(): any;
    getReceiverState(): any;
    getServiceCapabilitites(): any;
}
import Soap = require("../utils/soap");
