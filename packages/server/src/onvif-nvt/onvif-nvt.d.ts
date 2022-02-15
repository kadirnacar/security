import Camera = require("./camera");

declare const _exports: OnvifManager;
export = _exports;
/**
 * If the OnvifManager class is used to connect to a camera, it will
 * manage your devices (cameras). It stores cameras by address. You
 * can use address to retrieve the camera.
 */
declare class OnvifManager {
    discovery: import("./modules/discovery");
    cameras: {};
    /**
     * Add a module to OnvifManager. Currently, the only available module is 'discovery'.
     * @param {string} name The name of the module.
     */
    add(name: string): void;
    /**
     * Connects to an ONVIF device.
     * @param {string} address The address of the ONVIF device (ie: 10.10.1.20)
     * @param {integer=} port The port of the ONVIF device. Defaults to 80.
     * @param {string=} username The user name used to make a connection.
     * @param {string=} password The password used to make a connection.
     * @param {string=} servicePath The service path for the camera. If null or 'undefined' the default path according to the ONVIF spec will be used.
     * @param {callback=} callback Optional callback, instead of a Promise.
     * @returns A Promise. On success, resolve contains a Camera object.
     */
    connect(address: string, port?: integer, username?: string | undefined, password?: string | undefined, servicePath?: string | undefined, callback?: any): Promise<Camera>;
}
