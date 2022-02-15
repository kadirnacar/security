var Util = require('../utils/util');
var Soap = require('../utils/soap');
var dgram = require('dgram');
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
var Discovery = /** @class */ (function () {
    function Discovery() {
        this.soap = new Soap();
        this._MULTICAST_ADDRESS = '239.255.255.250';
        this._PORT = 3702;
        this._DISCOVERY_INTERVAL = 150; // ms
        this._DISCOVERY_RETRY_MAX = 3;
        this._DISCOVERY_WAIT = 3000; // ms
        this._udp = null;
        this._discoveryIntervalTimer = null;
        this._discoveryWaitTimer = null;
    }
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
    Discovery.prototype.startProbe = function (callback) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var errMsg = '';
            if (typeof callback !== 'undefined' && callback !== null) {
                if ((errMsg = Util.isInvalidValue(callback, 'function'))) {
                    reject(new Error('The "callback" argument for startProbe is invalid:' + errMsg));
                    return;
                }
            }
            _this._devices = {};
            _this._udp = dgram.createSocket('udp4');
            _this._udp.once('error', function (error) {
                reject(error);
            });
            _this._udp.on('message', function (buf, deviceInfo) {
                _this.soap.parse(buf.toString())
                    .then(function (results) {
                    _this.parseResult(results, deviceInfo);
                })["catch"](function (error) {
                    // Do nothing.
                    console.error(error);
                });
            });
            _this._udp.bind(function () {
                _this._udp.removeAllListeners('error');
                _this._sendProbe()
                    .then(function () {
                    // Do nothing.
                })["catch"](function (error) {
                    reject(error);
                });
                _this._discoveryWaitTimer = setTimeout(function () {
                    _this.stopProbe()
                        .then(function () {
                        var deviceList = [];
                        Object.keys(_this._devices).forEach(function (urn) {
                            deviceList.push(_this._devices[urn]);
                        });
                        resolve(deviceList);
                    })["catch"](function (error) {
                        reject(error);
                    });
                }, _this._DISCOVERY_WAIT);
            });
        });
        if (Util.isValidCallback(callback)) {
            promise.then(function (deviceList) {
                callback(null, deviceList);
            })["catch"](function (error) {
                callback(error);
            });
        }
        else {
            return promise;
        }
    };
    /**
     * Stop a <strong>Discovery</strong> probe.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Discovery.prototype.stopProbe = function (callback) {
        var _this = this;
        if (this._discoveryIntervalTimer !== null) {
            clearTimeout(this._discoveryIntervalTimer);
            this._discoveryIntervalTimer = null;
        }
        if (this._discoveryWaitTimer !== null) {
            clearTimeout(this._discoveryWaitTimer);
            this._discoveryWaitTimer = null;
        }
        var promise = new Promise(function (resolve, reject) {
            var errMsg = '';
            if (typeof callback !== 'undefined' && callback !== null) {
                if ((errMsg = Util.isInvalidValue(callback, 'function'))) {
                    reject(new Error('The "callback" argument for stopProbe is invalid:' + errMsg));
                    return;
                }
            }
            if (_this._udp) {
                _this._udp.close(function () {
                    if (_this._udp) {
                        _this._udp.unref();
                    }
                    _this._udp = null;
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
        if (Util.isValidCallback(callback)) {
            promise.then(function () {
                callback(null);
            })["catch"](function (error) {
                callback(error);
            });
        }
        else {
            return promise;
        }
    };
    Discovery.prototype._sendProbe = function (callback) {
        var _this = this;
        var soapTemplate = '';
        soapTemplate += '<?xml version="1.0" encoding="UTF-8"?>';
        soapTemplate += '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing">';
        soapTemplate += '  <s:Header>';
        soapTemplate += '    <a:Action s:mustUnderstand="1">http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</a:Action>';
        soapTemplate += '    <a:MessageID>uuid:__uuid__</a:MessageID>';
        soapTemplate += '    <a:ReplyTo>';
        soapTemplate += '      <a:Address>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</a:Address>';
        soapTemplate += '    </a:ReplyTo>';
        soapTemplate += '    <a:To s:mustUnderstand="1">urn:schemas-xmlsoap-org:ws:2005:04:discovery</a:To>';
        soapTemplate += '  </s:Header>';
        soapTemplate += '  <s:Body>';
        soapTemplate += '    <Probe xmlns="http://schemas.xmlsoap.org/ws/2005/04/discovery">';
        soapTemplate += '      <d:Types xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery" xmlns:dp0="http://www.onvif.org/ver10/network/wsdl">dp0:__type__</d:Types>';
        soapTemplate += '    </Probe>';
        soapTemplate += '  </s:Body>';
        soapTemplate += '</s:Envelope>';
        /* eslint-disable no-useless-escape */
        soapTemplate = soapTemplate.replace(/\>\s+\</g, '><');
        soapTemplate = soapTemplate.replace(/\s+/, ' ');
        /* eslint-enable no-useless-escape */
        var soapSet = [];
        ['NetworkVideoTransmitter', 'Device', 'NetworkVideoDisplay'].forEach(function (type) {
            var s = soapTemplate;
            s = s.replace('__type__', type);
            s = s.replace('__uuid__', Util.createUuidV4());
            soapSet.push(s);
        });
        var soapList = [];
        for (var i = 0; i < this._DISCOVERY_RETRY_MAX; i++) {
            soapSet.forEach(function (s) {
                soapList.push(s);
            });
        }
        var promise = new Promise(function (resolve, reject) {
            var send = function () {
                if (_this._udp) {
                    var soapEnvelope = soapList.shift();
                    if (soapEnvelope) {
                        var buf = Buffer.from(soapEnvelope, 'utf8');
                        _this._udp.send(buf, 0, buf.length, _this._PORT, _this._MULTICAST_ADDRESS, function (error, bytes) {
                            if (error) {
                                console.error(error); // TODO: Jeff temp
                            }
                            _this._discoveryIntervalTimer = setTimeout(function () {
                                send();
                            }, _this._DISCOVERY_INTERVAL);
                        });
                    }
                    else {
                        resolve();
                    }
                }
                else {
                    reject(new Error('No UDP connection is available. The init() method might not be called yet.'));
                }
            };
            send();
        });
        return promise;
    };
    Discovery.prototype.parseResult = function (results, deviceInfo) {
        var parsed = results.parsed;
        var urn = '';
        var address = deviceInfo.address;
        var service = '';
        var xaddrs = [];
        var scopes = [];
        var types = '';
        var probe = {};
        try {
            if ('Body' in parsed) {
                var body = parsed.Body;
                if ('ProbeMatches' in body) {
                    var probeMatches = body.ProbeMatches;
                    // make sure the right data exists
                    if (probeMatches !== undefined) {
                        if ('ProbeMatch' in probeMatches) {
                            var probeMatch = probeMatches.ProbeMatch;
                            urn = probeMatch.EndpointReference.Address;
                            xaddrs = probeMatch.XAddrs.split(/\s+/);
                            // pick the appropriate service address if there is more than one
                            if (xaddrs.length > 1) {
                                xaddrs.forEach(function (addr) {
                                    var index = addr.indexOf(deviceInfo.address);
                                    if (index !== -1) {
                                        service = addr;
                                    }
                                });
                            }
                            else {
                                service = xaddrs[0];
                            }
                            if (typeof (probeMatch.Scopes) === 'string') {
                                scopes = probeMatch.Scopes.split(/\s+/);
                            }
                            else if (typeof (probeMatch.Scopes) === 'object' && typeof (probeMatch.Scopes._) === 'string') {
                                scopes = probeMatch.Scopes._.split(/\s+/);
                            }
                            if (typeof (probeMatch.Types) === 'string') {
                                types = probeMatch.Types.split(/\s+/);
                            }
                            // added to support Pelco cameras (comes in as an object, not string)
                            else if (typeof (probeMatch.Types) === 'object' && typeof (probeMatch.Types._) === 'string') {
                                types = probeMatch.Types._.split(/\s+/);
                            }
                        }
                    }
                }
            }
        }
        catch (e) {
            return null;
        }
        if (urn && xaddrs.length > 0 && scopes.length > 0) {
            if (!this._devices[urn]) {
                var name_1 = '';
                var hardware_1 = '';
                var location_1 = '';
                scopes.forEach(function (s) {
                    if (s.indexOf('onvif://www.onvif.org/hardware/') === 0) {
                        hardware_1 = s.split('/').pop();
                    }
                    else if (s.indexOf('onvif://www.onvif.org/location/') === 0) {
                        location_1 = s.split('/').pop();
                    }
                    else if (s.indexOf('onvif://www.onvif.org/name/') === 0) {
                        name_1 = s.split('/').pop();
                        name_1 = name_1.replace(/_/g, ' ');
                    }
                });
                probe = {
                    urn: urn,
                    name: name_1,
                    address: address,
                    service: service,
                    hardware: hardware_1,
                    location: location_1,
                    types: types,
                    xaddrs: xaddrs,
                    scopes: scopes
                };
                this._devices[urn] = probe;
            }
        }
        return probe;
    };
    return Discovery;
}());
module.exports = Discovery;
