export = Media2;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/media/ONVIF-Media2-Service-Spec-v1712.pdf}<br>
 * {@link https://www.onvif.org/ver20/media/wsdl/media.wsdl}<br>
 * </p>
 */
declare class Media2 {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Media2 object.
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
    createProfile(): any;
    getProfiles(): any;
    addConfiguration(): any;
    removeConfiguration(): any;
    deleteProfile(): any;
    getConfigurations(): any;
    setConfigurations(): any;
    getConfigurationOptions(): any;
    getVideoEncoderInstances(): any;
    getStreamUri(): any;
    getSnapshotUri(profileToken: any): any;
    startMulticastStreaming(): any;
    stopMulticastStreaming(): any;
    setSynchronizationPoint(): any;
    getVideoSourceModes(): any;
    createOSD(): any;
    deleteOSD(): any;
    getOSDs(): any;
    getOSD(): any;
    setOSD(): any;
    getOSDOptions(): any;
    createMask(): any;
    deleteMask(): any;
    getMasks(): any;
    setMask(): any;
    getMaskOptions(): any;
    getServiceCapabilities(): any;
}
import Soap = require("../utils/soap");
