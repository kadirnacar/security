export = Thermal;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/thermal/ONVIF-Thermal-Service-Spec-v1706.pdf}<br>
 * {@link https://www.onvif.org/ver10/thermal/wsdl/thermal.wsdl}<br>
 * </p>
 */
declare class Thermal {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Thermal object.
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
    createRequest(body: string): any;
    getConfiguration(): any;
    setConfigurationSettings(): any;
    getConfigurationOptions(): any;
    getConfigurations(): any;
    getRadiometryConfiguration(): any;
    setRadiometryConfigurationSettings(): any;
    getRadiometryConfigurationOptions(): any;
    getServiceCapabilities(): any;
}
import Soap = require("../utils/soap");
