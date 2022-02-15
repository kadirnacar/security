export = VideoAnalytics;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/analytics/ONVIF-VideoAnalyticsDevice-Service-Spec-v211.pdf}<br>
 * {@link https://www.onvif.org/ver10/analyticsdevice.wsdl}<br>
 * </p>
 */
declare class VideoAnalytics {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a VideoAnalytics object.
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
    getAnalyticsEngineInputs(): any;
    getAnalyticsEngineInput(): any;
    setAnalyticsEngineInput(): any;
    createAnalyticsEngineInputs(): any;
    deleteAnalyticsEngineInputs(): any;
    getVideoAnalyticsConfiguration(): any;
    setVideoAnalyticsConfiguration(): any;
    getAnalyticsEngines(): any;
    getAnalyticsEngine(): any;
    getAnalyticsEngineControls(): any;
    getAnalyticsEngineControl(): any;
    setAnalyticsEngineControl(): any;
    createAnalyticsEngineControl(): any;
    deleteAnalyticsEngineControl(): any;
    getAnalyticsState(): any;
    getAnalyticsDeviceStreamUri(): any;
    getServiceCapabilities(): any;
}
import Soap = require("../utils/soap");
