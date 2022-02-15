import Access = require('./modules/access');
import AccessRules = require('./modules/accessrules');
import Action = require('./modules/action');
import Analytics = require('./modules/analytics');
import Core = require('./modules/core');
import DeviceIO = require('./modules/deviceio');
import Display = require('./modules/display');
import Door = require('./modules/door');
import Events = require('./modules/events');
import Imaging = require('./modules/imaging');
import Media = require('./modules/media');
import Media2 = require('./modules/media2');
import Ptz = require('./modules/ptz');
import Receiver = require('./modules/receiver');
import Recording = require('./modules/recording');
import Replay = require('./modules/replay');
import Schedule = require('./modules/schedule');
import Search = require('./modules/search');
import Security = require('./modules/security');
import Thermal = require('./modules/thermal');
import VideoAnalytics = require('./modules/videoanalytics');
import Snapshot = require('./utils/snapshot');

export = Camera;
/**
 * Wrapper class for all onvif modules to manage an Onvif device (camera).
 */
declare class Camera {
  core: Core;
  access: Access;
  accessrules: AccessRules;
  action: Action;
  analytics: Analytics;
  credential: Credential;
  deviceio: DeviceIO;
  display: Display;
  door: Door;
  events: Events;
  imaging: Imaging;
  media: Media;
  media2: Media2;
  ptz: Ptz;
  receiver: Receiver;
  recording: Recording;
  replay: Replay;
  schedule: Schedule;
  search: Search;
  security: Security;
  snapshot: Snapshot;
  thermal: Thermal;
  videoanalytics: VideoAnalytics;
  rootPath: any;
  serviceAddress: any;
  timeDiff: number;
  address: string;
  port: any;
  username: string;
  password: string;
  deviceInformation: any;
  profileList: any[];
  defaultProfile: any;
  /**
   * Add a module to Camera. The available modules are:
   * <ul>
   * <li>access</li>
   * <li>accessrules</li>
   * <li>action</li>
   * <li>analytics - automatically added based on capabilities</li>
   * <li>core - automatically added</li>
   * <li>credential</li>
   * <li>deviceio</li>
   * <li>display</li>
   * <li>door</li>
   * <li>events - automatically added based on capabilities</li>
   * <li>imaging - automatically added based on capabilities</li>
   * <li>media - automatically added based on capabilities</li>
   * <li>media2</li>
   * <li>ptz - automatically added based on capabilities</li>
   * <li>receiver</li>
   * <li>recording</li>
   * <li>replay</li>
   * <li>schedule</li>
   * <li>search</li>
   * <li>security</li>
   * <li>snapshot</li>
   * <li>thermal</li>
   * <li>videoanalytics</li>
   * </ul>
   * @param {string} name The name of the module.
   */
  add(name: string): void;
  /**
   * Connect with the specified camera
   * @param {string} address The camera's address
   * @param {integer=} port Optional port (80 used if this is null)
   * @param {string=} username The username for the account on the camera. This is optional if your camera does not require a username.
   * @param {string=} password The password for the account on the camera. This is optional if your camera does not require a password.
   * @param {string=} servicePath The service path for the camera. If null or 'undefined' the default path according to the ONVIF spec will be used.
   * @param {callback=} callback Optional callback, instead of a Promise.
   */
  connect(
    address: string,
    port?: integer,
    username?: string | undefined,
    password?: string | undefined,
    servicePath?: string | undefined,
    callback?: any
  ): any;
  /**
   * Used to change or remove the auth information for the camera.
   * @param {string=} username The username for the account on the camera. This is optional if your camera does not require a username.
   * @param {string=} password The password for the account on the camera. This is optional if your camera does not require a password.
   */
  setAuth(username?: string | undefined, password?: string | undefined): void;
  /**
   * Returns the ONVIF device's informaton. Available after connection.
   */
  getInformation(): any;
  /**
   * Returns the default profile that will be used when one is not supplied to functions that require it. Available after connection.
   */
  getDefaultProfile(): any;
  coreGetSystemDateAndTime(): any;
  coreGetServices(): any;
  checkForProxy(service: any): void;
  coreGetCapabilities(): any;
  coreGetDeviceInformation(): any;
  coreGetScopes(): any;
  mediaGetProfiles(): any;
  parseProfiles(profiles: any): any[];
  /**
   * Returns an array of profiles. Available after connection.
   * The profiles will contain media stream URIs and snapshot URIs for each profile.
   */
  getProfiles(): any[];
  mediaGetStreamURI(): any;
  mediaGetSnapshotUri(): any;
}
