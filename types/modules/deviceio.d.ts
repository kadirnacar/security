export = DeviceIO;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/io/ONVIF-DeviceIo-Service-Spec-v1712.pdf}<br>
 * {@link https://www.onvif.org/ver10/deviceio.wsdl}<br>
 * </p>
 */
declare class DeviceIO {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a DeviceIO object.
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
    getVideoOutputs(): any;
    getVideoOutputConfiguration(): any;
    setVideoOutputConfiguration(): any;
    getVideoOutputConfigurationOptions(): any;
    getVideoSources(): any;
    getAudioOutputs(): any;
    getAudioSources(): any;
    getRelayOutputs(): any;
    getRelayOutputOptions(): any;
    getRelayOutputSettings(): any;
    triggerRelayOutput(): any;
    getDigitalInputs(): any;
    getDigitalInputConfigurationOptions(): any;
    setDigitalInputConfigurations(): any;
    getSerialPorts(): any;
    getSerialPortConfiguration(): any;
    setSerialPortConfiguration(): any;
    getSerialPortConfigurationOptions(): any;
    sendReceiveSerial(): any;
    capabilities(): any;
}
import Soap = require("../utils/soap");
