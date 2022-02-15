export = Recording;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/rec/ONVIF-RecordingControl-Service-Spec-v1712.pdf}<br>
 * {@link https://www.onvif.org/ver10/recording.wsdl}<br>
 * </p>
 */
declare class Recording {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Recoding object.
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
    createRecording(): any;
    deleteRecording(): any;
    getRecordings(): any;
    setRecordingConfiguration(): any;
    getRecordingConfiguration(): any;
    createTrack(): any;
    deleteTrack(): any;
    getTrackConfiguration(): any;
    setTrackConfiguration(): any;
    createRecordingJob(): any;
    deleteRecordingJob(): any;
    getRecordingJobs(): any;
    setRecordingJobConfiguration(): any;
    getRecordingJobConfiguration(): any;
    setRecordingJobMode(): any;
    getRecordingJobState(): any;
    getRecordingOptions(): any;
    exportRecordedData(): any;
    stopExportRecordedData(): any;
    getExportRecordedDataState(): any;
    getServiceCapabilities(): any;
}
import Soap = require("../utils/soap");
