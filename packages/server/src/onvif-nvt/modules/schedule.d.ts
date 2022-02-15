export = Schedule;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/sched/ONVIF-Scheduler-Service-Spec-v100.pdf}<br>
 * {@link https://www.onvif.org/ver10/schedule/wsdl/schedule.wsdl}<br>
 * </p>
 */
declare class Schedule {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Schedule object.
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
    getScheduleInfo(): any;
    getScheduleInfoList(): any;
    getSchedules(): any;
    getScheduleList(): any;
    createSchedule(): any;
    modifySchedule(): any;
    deleteSchedule(): any;
    getSpecialDayGroupInfo(): any;
    getSpecialDayGroupInfoList(): any;
    getSpecialDayGroups(): any;
    getSpecialDayGroupList(): any;
    createSpecialDayGroup(): any;
    modifySpecialDayGroup(): any;
    deleteSpecialDayGroup(): any;
    getScheduleState(): any;
}
import Soap = require("../utils/soap");
