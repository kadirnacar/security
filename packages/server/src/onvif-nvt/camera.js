var Util = require('./utils/util');
var URL = require('url-parse');
var MODULE_MAP = {
  access: require('./modules/access'),
  accessrules: require('./modules/accessrules'),
  action: require('./modules/action'),
  analytics: require('./modules/analytics'),
  core: require('./modules/core'),
  credential: require('./modules/credential'),
  deviceio: require('./modules/deviceio'),
  display: require('./modules/display'),
  door: require('./modules/door'),
  events: require('./modules/events'),
  imaging: require('./modules/imaging'),
  media: require('./modules/media'),
  media2: require('./modules/media2'),
  ptz: require('./modules/ptz'),
  receiver: require('./modules/receiver'),
  recording: require('./modules/recording'),
  replay: require('./modules/replay'),
  schedule: require('./modules/schedule'),
  search: require('./modules/search'),
  security: require('./modules/security'),
  snapshot: require('./utils/snapshot'),
  thermal: require('./modules/thermal'),
  videoanalytics: require('./modules/videoanalytics'),
};
var MODULE_MAP_AFTER = {
  core: function () {
    this.core.init(this.serviceAddress, this.username, this.password);
  },
  media: function () {
    this.media.init(
      this.timeDiff,
      this.serviceAddress,
      this.username,
      this.password
    );
  },
  snapshot: function () {
    var defaultProfile = this.getDefaultProfile();
    if (defaultProfile) {
      var snapshotUri = defaultProfile.SnapshotUri.Uri;
      this.snapshot.init(snapshotUri, this.username, this.password);
    }
  },
};
/**
 * Wrapper class for all onvif modules to manage an Onvif device (camera).
 */
var Camera = /** @class */ (function () {
  function Camera() {
    this.core = null;
    this.access = null;
    this.accessrules = null;
    this.action = null;
    this.analytics = null;
    this.credential = null;
    this.deviceio = null;
    this.display = null;
    this.door = null;
    this.events = null;
    this.imaging = null;
    this.media = null; // Onvif 1.x
    this.media2 = null; // Onvif 2.x
    this.ptz = null;
    this.receiver = null;
    this.recording = null;
    this.replay = null;
    this.schedule = null;
    this.search = null;
    this.security = null;
    this.snapshot = null;
    this.thermal = null;
    this.videoanalytics = null;
    this.rootPath = null;
    this.serviceAddress = null;
    this.timeDiff = 0;
    this.address = null;
    this.port = null;
    this.username = null;
    this.password = null;
    this.deviceInformation = null;
    this.profileList = [];
    this.defaultProfile = null;
  }
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
  Camera.prototype.add = function (name) {
    var mod = MODULE_MAP[name];
    if (!MODULE_MAP[name]) {
      throw new Error(
        "Module '".concat(name, "' does not exist. Cannot add to Camera.")
      );
    }
    if (this[name]) {
      return;
    }
    var Inst = mod;
    var after = MODULE_MAP_AFTER[name] || function () {};
    this[name] = new mod();
    after.call(this);
  };
  /**
   * Connect with the specified camera
   * @param {string} address The camera's address
   * @param {integer=} port Optional port (80 used if this is null)
   * @param {string=} username The username for the account on the camera. This is optional if your camera does not require a username.
   * @param {string=} password The password for the account on the camera. This is optional if your camera does not require a password.
   * @param {string=} servicePath The service path for the camera. If null or 'undefined' the default path according to the ONVIF spec will be used.
   * @param {callback=} callback Optional callback, instead of a Promise.
   */
  Camera.prototype.connect = function (
    address,
    port,
    username,
    password,
    servicePath,
    callback
  ) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      // check for valid address
      var errMsg = '';
      if ((errMsg = Util.isInvalidValue(address, 'string'))) {
        reject(
          new Error('The "address" argument for connect is invalid: ' + errMsg)
        );
        return;
      }
      // provide defaults if not provided
      port = port || 80;
      username = username || null;
      password = password || null;
      servicePath = servicePath || '/onvif/device_service';
      _this.address = address;
      _this.port = port;
      _this.setAuth(username, password);
      // set up the service address
      var serviceAddress = 'http://' + address;
      if (port && port !== 80) {
        serviceAddress = serviceAddress + ':' + port;
      }
      _this.rootPath = serviceAddress;
      serviceAddress = serviceAddress + servicePath;
      _this.serviceAddress = new URL(serviceAddress);
      // add core module
      _this.add('core');
      return _this
        .coreGetSystemDateAndTime()
        .then(function () {
          return _this.coreGetServices();
        })
        .then(function () {
          return _this.coreGetCapabilities();
        })
        .then(function () {
          return _this.coreGetDeviceInformation();
        })
        .then(function () {
          return _this.mediaGetProfiles();
        })
        .then(function () {
          return _this.mediaGetStreamURI();
        })
        .then(function () {
          return _this.mediaGetSnapshotUri();
        })
        .then(function () {
          return _this.coreGetScopes();
        })
        .then(function () {
          var info = _this.getInformation();
          resolve(info);
        })
        ['catch'](function (error) {
          reject(error);
        });
    });
  };
  /**
   * Used to change or remove the auth information for the camera.
   * @param {string=} username The username for the account on the camera. This is optional if your camera does not require a username.
   * @param {string=} password The password for the account on the camera. This is optional if your camera does not require a password.
   */
  Camera.prototype.setAuth = function (username, password) {
    if (typeof username === 'undefined') {
      this.username = null;
    } else {
      this.username = username;
    }
    if (typeof password === 'undefined') {
      this.password = null;
    } else {
      this.password = password;
    }
  };
  /**
   * Returns the ONVIF device's informaton. Available after connection.
   */
  Camera.prototype.getInformation = function () {
    var o = this.deviceInformation;
    if (o) {
      return JSON.parse(JSON.stringify(o));
    } else {
      return null;
    }
  };
  /**
   * Returns the default profile that will be used when one is not supplied to functions that require it. Available after connection.
   */
  Camera.prototype.getDefaultProfile = function () {
    return this.defaultProfile;
  };
  Camera.prototype.coreGetSystemDateAndTime = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      _this.core
        .getSystemDateAndTime()
        .then(function (results) {
          _this.timeDiff = _this.core.getTimeDiff();
          resolve();
        })
        ['catch'](function (error) {
          console.error(error);
          reject(error);
        });
    });
  };
  Camera.prototype.coreGetServices = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      _this.core
        .getServices(true)
        .then(function (results) {
          var response = results.data.GetServicesResponse;
          var services = response.Service;
          // the appropriate modules will be automatically added
          // to camera based on the onvif device's services.
          // if GetServics is not supported, the GetCapabilities
          // fallback will be used.
          services.forEach(function (service) {
            _this.checkForProxy(service);
            var namespace = service.Namespace;
            if (namespace === 'http://www.onvif.org/ver10/device/wsdl') {
              _this.core.version = service.Version;
            } else if (namespace === 'http://www.onvif.org/ver10/media/wsdl') {
              _this.add('media');
              if (_this.media) {
                _this.media.init(
                  _this.timeDiff,
                  new URL(service.XAddr),
                  _this.username,
                  _this.password
                );
                _this.media.version = service.Version;
              }
            } else if (namespace === 'http://www.onvif.org/ver10/events/wsdl') {
              _this.add('events');
              if (_this.events) {
                _this.events.init(
                  _this.timeDiff,
                  new URL(service.XAddr),
                  _this.username,
                  _this.password
                );
                _this.events.version = service.Version;
              }
            } else if (namespace === 'http://www.onvif.org/ver20/ptz/wsdl') {
              _this.add('ptz');
              if (_this.ptz) {
                _this.ptz.init(
                  _this.timeDiff,
                  new URL(service.XAddr),
                  _this.username,
                  _this.password
                );
                _this.ptz.version = service.Version;
              }
            } else if (
              namespace === 'http://www.onvif.org/ver20/imaging/wsdl'
            ) {
              _this.add('imaging');
              if (_this.imaging) {
                _this.imaging.init(
                  _this.timeDiff,
                  new URL(service.XAddr),
                  _this.username,
                  _this.password
                );
                _this.imaging.version = service.Version;
              }
            } else if (
              namespace === 'http://www.onvif.org/ver10/deviceIO/wsdl'
            ) {
              _this.add('deviceio');
              if (_this.deviceio) {
                _this.deviceio.init(
                  _this.timeDiff,
                  new URL(service.XAddr),
                  _this.username,
                  _this.password
                );
                _this.deviceio.version = service.Version;
              }
            } else if (
              namespace === 'http://www.onvif.org/ver20/analytics/wsdl'
            ) {
              _this.add('analytics');
              if (_this.analytics) {
                _this.analytics.init(
                  _this.timeDiff,
                  new URL(service.XAddr),
                  _this.username,
                  _this.password
                );
                _this.analytics.version = service.Version;
              }
            }
          });
          resolve();
        })
        ['catch'](function (error) {
          console.error(error);
          // don't fail because this isn't supported by the camera
          // spec says to use fallback of GetCapabilities method.
          resolve();
        });
    });
  };
  // make sure the serviceAddress matches
  // if not, then we may be behind a proxy and it needs
  // do be dealt with
  Camera.prototype.checkForProxy = function (service) {
    var xaddrPath = new URL(service.XAddr);
    if (xaddrPath.href === this.serviceAddress.href) {
      // no proxy
      return;
    }
    // build new path
    service.XAddr = this.rootPath + xaddrPath.pathname + xaddrPath.query;
  };
  Camera.prototype.coreGetCapabilities = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      _this.core
        .getCapabilities()
        .then(function (results) {
          var c = results.data.GetCapabilitiesResponse.Capabilities;
          if (!c) {
            reject(
              new Error(
                'Failed to initialize the device: No capabilities were found.'
              )
            );
            return;
          }
          // the appropriate modules will be automatically added
          // to camera based on the onvif device's capabilities.
          if ('Analytics' in c) {
            var analytics = c.Analytics;
            _this.checkForProxy(analytics);
            if (analytics && 'XAddr' in analytics) {
              if (!_this.analytics) {
                _this.add('analytics');
                if (_this.analytics) {
                  var serviceAddress = new URL(analytics.XAddr);
                  _this.analytics.init(
                    _this.timeDiff,
                    serviceAddress,
                    _this.username,
                    _this.password
                  );
                }
              }
              if (_this.analytics) {
                if (
                  'RuleSupport' in analytics &&
                  analytics.RuleSupport === 'true'
                ) {
                  _this.analytics.ruleSupport = true;
                }
                if (
                  'AnalyticsModuleSupport' in analytics &&
                  analytics.AnalyticsModuleSupport === 'true'
                ) {
                  _this.analytics.analyticsModuleSupport = true;
                }
              }
            }
          }
          if ('Events' in c) {
            var events = c.Events;
            _this.checkForProxy(events);
            if (events && 'XAddr' in events) {
              if (!_this.events) {
                _this.add('events');
                if (_this.events) {
                  var serviceAddress = new URL(events.XAddr);
                  _this.events.init(
                    _this.timeDiff,
                    serviceAddress,
                    _this.username,
                    _this.password
                  );
                }
              }
              if (_this.events && _this.analytics) {
                if (
                  'WSPullPointSupport' in events &&
                  events.WSPullPointSupport === 'true'
                ) {
                  _this.analytics.wsPullPointSupport = true;
                }
                if (
                  'WSSubscriptionPolicySupport' in events &&
                  events.WSSubscriptionPolicySupport === 'true'
                ) {
                  _this.analytics.wsSubscriptionPolicySupport = true;
                }
              }
            }
          }
          if ('Imaging' in c) {
            var imaging = c.Imaging;
            _this.checkForProxy(imaging);
            if (imaging && 'XAddr' in imaging) {
              if (!_this.imaging) {
                _this.add('imaging');
                if (_this.imaging) {
                  var serviceAddress = new URL(imaging.XAddr);
                  _this.imaging.init(
                    _this.timeDiff,
                    serviceAddress,
                    _this.username,
                    _this.password
                  );
                }
              }
            }
          }
          if ('Media' in c) {
            var media = c.Media;
            _this.checkForProxy(media);
            if (media && 'XAddr' in media) {
              if (!_this.media) {
                _this.add('media');
                if (_this.media) {
                  var serviceAddress = new URL(media.XAddr);
                  _this.media.init(
                    _this.timeDiff,
                    serviceAddress,
                    _this.username,
                    _this.password
                  );
                }
              }
            }
          }
          if ('PTZ' in c) {
            var ptz = c.PTZ;
            _this.checkForProxy(ptz);
            if (ptz && 'XAddr' in ptz) {
              if (!_this.ptz) {
                _this.add('ptz');
                if (_this.ptz) {
                  var serviceAddress = new URL(ptz.XAddr);
                  _this.ptz.init(
                    _this.timeDiff,
                    serviceAddress,
                    _this.username,
                    _this.password
                  );
                }
              }
            }
          }
          resolve();
        })
        ['catch'](function (error) {
          console.error(error);
          reject(error);
        });
    });
  };
  Camera.prototype.coreGetDeviceInformation = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      _this.core
        .getDeviceInformation()
        .then(function (results) {
          _this.deviceInformation = results.data.GetDeviceInformationResponse;
          resolve();
        })
        ['catch'](function (error) {
          console.error(error);
          reject(error);
        });
    });
  };
  Camera.prototype.coreGetScopes = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      _this.core
        .getScopes()
        .then(function (results) {
          var scopes =
            typeof results.data.GetScopesResponse.Scopes === 'undefined' ||
            !Array.isArray(results.data.GetScopesResponse.Scopes)
              ? []
              : results.data.GetScopesResponse.Scopes;
          _this.deviceInformation.Ptz = false;
          scopes.forEach(function (scope) {
            var s = scope.ScopeItem;
            if (s.indexOf('onvif://www.onvif.org/hardware/') === 0) {
              var hardware = s.split('/').pop();
              _this.deviceInformation.Hardware = hardware;
            } else if (
              s.indexOf('onvif://www.onvif.org/type/Streaming') === 0
            ) {
              _this.deviceInformation.Streaming = true;
            } else if (
              s.indexOf('onvif://www.onvif.org/type/video_encoder') === 0
            ) {
              _this.deviceInformation.VideoEncoder = true;
            } else if (
              s.indexOf('onvif://www.onvif.org/type/audio_encoder') === 0
            ) {
              _this.deviceInformation.AudiooEncoder = true;
            } else if (s.indexOf('onvif://www.onvif.org/type/ptz') === 0) {
              _this.deviceInformation.Ptz = true;
            } else if (s.indexOf('onvif://www.onvif.org/Profile/S') === 0) {
              _this.deviceInformation.ProfileS = true;
            } else if (s.indexOf('onvif://www.onvif.org/Profile/C') === 0) {
              _this.deviceInformation.ProfileC = true;
            } else if (s.indexOf('onvif://www.onvif.org/Profile/G') === 0) {
              _this.deviceInformation.ProfileG = true;
            } else if (s.indexOf('onvif://www.onvif.org/Profile/Q') === 0) {
              _this.deviceInformation.ProfileQ = true;
            } else if (s.indexOf('onvif://www.onvif.org/Profile/A') === 0) {
              _this.deviceInformation.ProfileA = true;
            } else if (s.indexOf('onvif://www.onvif.org/Profile/T') === 0) {
              _this.deviceInformation.ProfileT = true;
            } else if (
              s.indexOf('onvif://www.onvif.org/location/country/') === 0
            ) {
              var country = s.split('/').pop();
              _this.deviceInformation.Country = country;
            } else if (
              s.indexOf('onvif://www.onvif.org/location/city/') === 0
            ) {
              var city = s.split('/').pop();
              _this.deviceInformation.City = city;
            } else if (s.indexOf('onvif://www.onvif.org/name/') === 0) {
              var name_1 = s.split('/').pop();
              name_1 = name_1.replace(/_/g, ' ');
              _this.deviceInformation.Name = name_1;
            }
          });
          resolve();
        })
        ['catch'](function (error) {
          console.error(error);
          reject(error);
        });
    });
  };
  Camera.prototype.mediaGetProfiles = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      _this.media
        .getProfiles()
        .then(function (results) {
          var profiles = results.data.GetProfilesResponse.Profiles;
          if (!profiles) {
            reject(
              new Error(
                'Failed to initialize the device: The targeted device does not any media profiles.'
              )
            );
            return;
          }
          var profileList = _this.parseProfiles(profiles);
          _this.profileList = _this.profileList.concat(profileList);
          resolve();
        })
        ['catch'](function (error) {
          console.error(error);
          reject(error);
        });
    });
  };
  Camera.prototype.parseProfiles = function (profiles) {
    var _this = this;
    var profileList = [];
    // When a single profile is given 'profiles' is the single profile
    if (!Array.isArray(profiles)) {
      profiles = [profiles];
    }
    profiles.forEach(function (profile) {
      profileList.push(profile);
      if (!_this.defaultProfile) {
        _this.defaultProfile = profile;
        if (_this.ptz) {
          _this.ptz.setDefaultProfileToken(profile.$.token);
        }
      }
    });
    return profileList;
  };
  /**
   * Returns an array of profiles. Available after connection.
   * The profiles will contain media stream URIs and snapshot URIs for each profile.
   */
  Camera.prototype.getProfiles = function () {
    return this.profileList;
  };
  Camera.prototype.mediaGetStreamURI = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      var protocols = ['UDP', 'HTTP', 'RTSP'];
      var profileIndex = 0;
      var protocolIndex = 0;
      var getStreamUri = function () {
        var profile = _this.profileList[profileIndex];
        if (profile) {
          var protocol = protocols[protocolIndex];
          if (protocol) {
            var token = profile.$.token;
            _this.media
              .getStreamUri('RTP-Unicast', protocol, token)
              .then(function (results) {
                profile.StreamUri = results.data.GetStreamUriResponse.MediaUri;
                ++protocolIndex;
                getStreamUri();
              })
              ['catch'](function (error) {
                console.error(error);
                ++protocolIndex;
                getStreamUri();
              });
          } else {
            ++profileIndex;
            protocolIndex = 0;
            getStreamUri();
          }
        } else {
          resolve();
        }
      };
      getStreamUri();
    });
  };
  Camera.prototype.mediaGetSnapshotUri = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
      var profileIndex = 0;
      var getSnapshotUri = function () {
        var profile = _this.profileList[profileIndex];
        if (profile) {
          // this.media.getSnapshotUri(profile['token'])
          _this.media
            .getSnapshotUri(profile.$.token)
            .then(function (results) {
              try {
                var service = {};
                service.XAddr =
                  results.data.GetSnapshotUriResponse.MediaUri.Uri;
                _this.checkForProxy(service);
                profile.SnapshotUri =
                  results.data.GetSnapshotUriResponse.MediaUri;
                profile.SnapshotUri.Uri = service.XAddr;
              } catch (e) {}
              ++profileIndex;
              getSnapshotUri();
            })
            ['catch'](function (error) {
              console.error(error);
              ++profileIndex;
              getSnapshotUri();
            });
        } else {
          resolve();
        }
      };
      getSnapshotUri();
    });
  };
  return Camera;
})();
module.exports = Camera;
