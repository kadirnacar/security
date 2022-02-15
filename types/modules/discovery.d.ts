export = Discovery;
/**
 * @class
 * ONVIF devices support WS-Discovery, which is a mechanism that supports probing a network to
 * find ONVIF capable devices. For example, it enables devices to send Hello messages when
 * they come online to let other devices know they are there. In addition, clients can send Probe
 * messages to find other devices and services on the network. Devices can also send Bye
 * messages to indicate they are leaving the network and going offline.<br>
 * Messages are sent over UDP to a standardized multicast address and UDP port number. All the
 * devices that match the types and scopes specified in the Probe message respond by sending
 * ProbeMatch messages back to the sender.<br>
 * WS-Discovery is normally limited by the network segmentation at a site since the multicast
 * packages typically do not traverse routers. Using a Discovery Proxy could solve that problem, but
 * details about this topic are beyond the scope of this document. For more information, see
 * [ONVIF/Discovery] and [WS-Discovery].
 */
declare class Discovery {
    soap: Soap;
    _MULTICAST_ADDRESS: string;
    _PORT: number;
    _DISCOVERY_INTERVAL: number;
    _DISCOVERY_RETRY_MAX: number;
    _DISCOVERY_WAIT: number;
    _udp: any;
    _discoveryIntervalTimer: number;
    _discoveryWaitTimer: number;
    /**
     * Start a <strong>Discovery</strong> probe.
     * @param {callback=} callback Optional callback, instead of a Promise.
     * @example
     * const OnvifManager = require('onvif-nvt')
     * OnvifManager.add('discovery')
     * OnvifManager.discovery.startProbe().then(deviceList => {
      * console.log(deviceList)
      * // 'deviceList' contains all ONVIF devices that have responded.
      * // If it is empty, then no ONVIF devices
      * // responded back to the broadcast.
     * })
     */
    startProbe(callback?: any): any;
    _devices: {};
    /**
     * Stop a <strong>Discovery</strong> probe.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    stopProbe(callback?: any): any;
    _sendProbe(callback: any): any;
    parseResult(results: any, deviceInfo: any): {};
}
import Soap = require("../utils/soap");
