var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var EventEmitter = require('events').EventEmitter;
var Soap = require('../utils/soap');
var Util = require('../utils/util');
var URL = require('url-parse');
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/ver10/events/wsdl/event.wsdl}<br>
 * {@link https://www.onvif.org/wp-content/uploads/2017/07/ONVIF_Event_Handling_Test_Specification_v17.06.pdf}<br>
 * </p>
 * <h3>Functions</h3>
 * createPullPointSubscription,
 * {@link Events#getEventProperties},
 * {@link Events#getServiceCapabilities},
 * pullMessages,
 * seek,
 * {@link Events#setSynchronizationPoint}
 * <br><br>
 * <h3>Overview</h3>
 * An event is an action or occurrence detected by a device that a client can subscribe to.<br>
 * Events are handled through the event service. This specification defines event handling
 * based on the [WS-BaseNotification] and [WS-Topics] specifications. It extends the event
 * notion to allow clients to track object properties (such as digital input and motion alarm
 * properties) through events. Properties are defined in Section 9.4.<br>
 * The description of event payload and their filtering within subscriptions is discussed in section
 * 9.5. Section 9.6 describes how a synchronization point can be requested by clients using one
 * of the three notification interfaces. Section 9.7 describes the integration of Topics and section
 * 9.10 discusses the handling of faults.<br>
 * Section 9.11 demonstrates the usage of the Real-Time Pull-Point Notification Interface
 * including Message Filtering and Topic Set. Examples for the basic notification interface can
 * be found in the corresponding [WS-BaseNotification] specification.<br>
 * An ONVIF compliant device shall provide an event service as defined in [ONVIF Event WSDL].<br>
 * Both device and client shall support [WS-Addressing] for event services.
 * <br><br>
 * <h3>Push Events</h3>
 * <ul>
 * <li> -> GetEventProperties</li>
 * <li> <- GetEventPropertiesResponse</li>
 * <li> -> Subscribe (specifying URI of your server)</li>
 * <li> <- Notify</li>
 * <li> -> Renew (specifying termination time)</li>
 * <li> <- RenewResponse</li>
 * <li> -> Unsubscribe</li>
 * <li> <- UnsubscribeResponse</li>
 * </ul>
 * <h3>Pull Events</h3>
 * <ul>
 * <li> -> GetEventProperties</li>
 * <li> <- GetEventPropertiesResponse</li>
 * <li> -> CreatePullPointSubscription</li>
 * <li> <- CreatePullPointSubscriptionResponse</li>
 * <li> -> PullMessages</li>
 * <li> -> PullMessagesResponse</li>
 * <li> -> Renew (specifying termination time)</li>
 * <li> <- RenewResponse</li>
 * <li> -> Unsubscribe</li>
 * <li> <- UnsubscribeResponse</li>
 * </ul>
 */
var Events = /** @class */ (function (_super) {
    __extends(Events, _super);
    function Events() {
        var _this = _super.call(this) // must call super for "this" to be defined.
         || this;
        _this.soap = new Soap();
        _this.timeDiff = 0;
        _this.serviceAddress = null;
        _this.username = null;
        _this.password = null;
        _this.namespaceAttributes = [
            'xmlns:tev="http://www.onvif.org/ver10/events/wsdl"'
        ];
        _this.intervalId = null;
        return _this;
    }
    /**
     * Call this function directly after instantiating an Events object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    Events.prototype.init = function (timeDiff, serviceAddress, username, password) {
        this.timeDiff = timeDiff;
        this.serviceAddress = serviceAddress;
        this.username = username;
        this.password = password;
    };
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     * @param {object=} subscriptionId Used internally.
     */
    Events.prototype.createRequest = function (body, subscriptionId) {
        var request = {
            body: body,
            xmlns: this.namespaceAttributes,
            diff: this.timeDiff,
            username: this.username,
            password: this.password
        };
        if (subscriptionId) {
            request.subscriptionId = subscriptionId;
        }
        var soapEnvelope = this.soap.createRequest(request);
        return soapEnvelope;
    };
    Events.prototype.buildRequest = function (methodName, xml, subscriptionId, callback) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var errMsg = '';
            if (typeof callback !== 'undefined' && callback !== null) {
                if ((errMsg = Util.isInvalidValue(callback, 'function'))) {
                    reject(new Error("The \"callback\" argument for ".concat(methodName, " is invalid:") + errMsg));
                    return;
                }
            }
            if (typeof methodName === 'undefined' || methodName === null) {
                reject(new Error('The "methodName" argument for buildRequest is required.'));
                return;
            }
            else {
                if ((errMsg = Util.isInvalidValue(methodName, 'string'))) {
                    reject(new Error('The "methodName" argument for buildRequest is invalid:' + errMsg));
                    return;
                }
            }
            var soapBody = '';
            if (methodName === 'PullMessages') {
                soapBody = xml;
            }
            else if (typeof xml === 'undefined' || xml === null || xml === '') {
                soapBody += "<tev:".concat(methodName, "/>");
            }
            else {
                soapBody += "<tev:".concat(methodName, ">");
                soapBody += xml;
                soapBody += "</tev:".concat(methodName, ">");
            }
            var soapEnvelope = _this.createRequest(soapBody, subscriptionId);
            var serviceAddress = _this.serviceAddress;
            // if this is a PullMessages message, it will have a specific URI for the subscription
            if (methodName === 'PullMessages') {
                serviceAddress = new URL(subscriptionId.Address);
            }
            _this.soap.makeRequest('events', serviceAddress, methodName, soapEnvelope)
                .then(function (results) {
                resolve(results);
            })["catch"](function (error) {
                reject(error);
            });
        });
        if (Util.isValidCallback(callback)) {
            promise.then(function (results) {
                callback(null, results);
            })["catch"](function (error) {
                callback(error);
            });
        }
        else {
            return promise;
        }
    };
    /**
     * Start a PullMessages event loop<br>
     * This method does a <strong>createPullPointSubscription</strong> followed by a <strong>pullMessages</strong>.
     * The resulting xml from the camera is then sent via an <strong>emit('messages', data)</strong>.
     * On error, <strong>emit('messages:error', error)</strong>
     * @param {integer=} loopTimeMS The amount of time between polls (in milliseconds; default 10000).
     * @param {string=} timeout  The timeout to send to the server (using PT interval format - ex: PT1S is one second; default 'PT1M').
     * @param {integer=} messageLimit The message limit to retrive (default 1)
     * @example
     * camera.events.on('messages', messages => {
     *   console.log('Messages Received:', messages)
     * })
     *
     *  camera.events.on('messages:error', error => {
     *    console.error('Messages Error:', error)
     *  })
     *
     *  camera.events.startPull()
     */
    Events.prototype.startPull = function (loopTimeMS, timeout, messageLimit) {
        var _this = this;
        // set defaults if nothing was passed in
        loopTimeMS = loopTimeMS || 10000;
        timeout = timeout || 'PT1M';
        messageLimit = messageLimit || 1;
        var getAll = function () {
            _this._getMessages(timeout, messageLimit)
                .then(function (results) {
                _this.emit('messages', results);
                console.log(results);
            })["catch"](function (error) {
                _this.emit('messages:error', error);
            });
        };
        this.intervalId = setInterval(function () {
            getAll();
        }, loopTimeMS);
    };
    /**
     * Stops a PullMessages event loop that has been started with <strong>start()</strong>.
     */
    Events.prototype.stopPull = function () {
        clearInterval(this.intervalId);
        this.intervalId = null;
    };
    Events.prototype._getMessages = function (timeout, messageLimit) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._createPullPointSubscription()
                .then(function (results) {
                _this._pullMessages(results, timeout, messageLimit)
                    .then(function (results) {
                    resolve(results);
                })["catch"](function (error) {
                    reject(error);
                });
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    Events.prototype._createPullPointSubscription = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.createPullPointSubscription()
                .then(function (results) {
                console.log('CreatePullPointSubscription successful');
                var response = results.data.CreatePullPointSubscriptionResponse;
                var reference = response.SubscriptionReference;
                var subscriptionId = {};
                if (reference.ReferenceParameters) {
                    subscriptionId = reference.ReferenceParameters.SubscriptionId;
                }
                subscriptionId.Address = reference.Address;
                resolve(subscriptionId);
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    Events.prototype._pullMessages = function (subscriptionId, timeout, messageLimit) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.pullMessages(subscriptionId, timeout, messageLimit)
                .then(function (results) {
                resolve(results);
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    // ---------------------------------------------
    // Events API
    // ---------------------------------------------
    /**
     * Event Type: Pull Event<br>
     * This method returns a PullPointSubscription that can be polled using PullMessages. This message contains the same elements as the SubscriptionRequest of the WS-BaseNotification without the ConsumerReference.<br>
     * If no Filter is specified the pullpoint notifies all occurring events to the client.<br>
     * This method is mandatory.
     * @param {string=} filter Optional XPATH expression to select specific topics.
     * @param {integer=} initialTerminationTime Optional Initial termination time (in milliseconds)
     * @param {xml=} subscriptionPolicy Optional Refer to {@link http://docs.oasis-open.org/wsn/wsn-ws_base_notification-1.3-spec-os.htm Web Services Base Notification 1.3 (WS-BaseNotification)}.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Events.prototype.createPullPointSubscription = function (filter, initialTerminationTime, subscriptionPolicy, callback) {
        // Example createPullPointSubscriptionRequest
        // <CreatePullPointSubscription xmlns="http://www.onvif.org/ver10/events/wsdl">
        //   <Filter>
        //     <TopicExpression
        //       Dialect="http://www.onvif.org/ver10/tev/topicExpression/ConcreteSet"
        //       xmlns="http://docs.oasis-open.org/wsn/b-2"
        //       xmlns:tns1="http://www.onvif.org/ver10/topics">tns1:VideoSource/MotionAlarm
        //     </TopicExpression>
        //   </Filter>
        //   <InitialTerminationTime>PT10M</InitialTerminationTime>
        // </CreatePullPointSubscription>
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var errMsg = '';
            if (typeof filter !== 'undefined' && filter !== null) {
                if ((errMsg = Util.isInvalidValue(filter, 'string'))) {
                    reject(new Error('The "filter" argument for createPullPointSubscription is invalid: ' + errMsg));
                    return;
                }
            }
            if (typeof initialTerminationTime !== 'undefined' && initialTerminationTime !== null) {
                if ((errMsg = Util.isInvalidValue(initialTerminationTime, 'string'))) {
                    reject(new Error('The "initialTerminationTime" argument for createPullPointSubscription is invalid: ' + errMsg));
                    return;
                }
            }
            if (typeof subscriptionPolicy !== 'undefined' && subscriptionPolicy !== null) {
                if ((errMsg = Util.isInvalidValue(subscriptionPolicy, 'string'))) {
                    reject(new Error('The "subscriptionPolicy" argument for createPullPointSubscription is invalid: ' + errMsg));
                    return;
                }
            }
            var soapBody = '';
            if (typeof filter !== 'undefined' && filter !== null) {
                soapBody += '<tev:Filter>' + filter + '</tev:Filter>';
            }
            if (typeof initialTerminationTime !== 'undefined' && initialTerminationTime !== null) {
                soapBody += '<tev:InitialTerminationTime>' + 'PT' + initialTerminationTime / 1000 + 'S' + '</tev:InitialTerminationTime>';
            }
            if (typeof subscriptionPolicy !== 'undefined' && subscriptionPolicy !== null) {
                soapBody += '<tev:SubscriptionPolicy>' + subscriptionPolicy + '</tev:SubscriptionPolicy>';
            }
            _this.buildRequest('CreatePullPointSubscription', soapBody)
                .then(function (results) {
                resolve(results);
            })["catch"](function (error) {
                reject(error);
            });
        });
        if (Util.isValidCallback(callback)) {
            promise.then(function (result) {
                callback(null, result);
            })["catch"](function (error) {
                callback(error);
            });
        }
        else {
            return promise;
        }
    };
    /**
     * Event Type: Agnostic<br>
     * The WS-BaseNotification specification defines a set of OPTIONAL WS-ResouceProperties. This specification does not require the implementation of the WS-ResourceProperty interface. Instead, the subsequent direct interface shall be implemented by an ONVIF compliant device in order to provide information about the FilterDialects, Schema files and topics supported by the device.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Events.prototype.getEventProperties = function (callback) {
        // Example GetEventPropertiesRequest
        // <GetEventProperties xmlns="http://www.onvif.org/ver10/events/wsdl" />
        return this.buildRequest('GetEventProperties', null, null, callback);
    };
    /**
     * Event Type: Agnostic<br>
     * Returns the capabilities of the event service. The result is returned in a typed answer.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Events.prototype.getServiceCapabilities = function (callback) {
        return this.buildRequest('GetServiceCapabilities', null, null, callback);
    };
    /**
     * Event Type: Pull Event<br>
     * This method pulls one or more messages from a PullPoint. The device shall provide the following PullMessages command for all SubscriptionManager endpoints returned by the CreatePullPointSubscription command. This method shall not wait until the requested number of messages is available but return as soon as at least one message is available.<br>
     * The command shall at least support a Timeout of one minute. In case a device supports retrieval of less messages than requested it shall return these without generating a fault.
     * @param {object} subscriptionId An object after createPullPointSubscription is called.
     * @param {object} subscriptionId.Address Address from createPullPointSubscription is called.
     * @param {object} subscriptionId.Address._ Raw subscriptionId from createPullPointSubscription.
     * @param {object} subscriptionId.Address.$ Raw subscriptionId from createPullPointSubscription.
     * @param {integer} timeout [msec] Maximum time to block until this method returns.
     * @param {integer} messageLimit Upper limit for the number of messages to return at once. A server implementation may decide to return less messages.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Events.prototype.pullMessages = function (subscriptionId, timeout, messageLimit, callback) {
        // Example PullMessagesRequest
        // <PullMessages xmlns="http://www.onvif.org/ver10/events/wsdl">
        //   <Timeout>PT1S</Timeout>
        //   <MessageLimit>1</MessageLimit>
        // </PullMessages>
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var errMsg = '';
            // if ((errMsg = Util.isInvalidValue(subscriptionReferenceAddress, 'string'))) {
            //   reject(new Error('The "subscriptionReferenceAddress" argument for pullMessages is invalid: ' + errMsg))
            //   return
            // }
            if ((errMsg = Util.isInvalidValue(timeout, 'string'))) {
                reject(new Error('The "timeout" argument for pullMessages is invalid: ' + errMsg));
                return;
            }
            if ((errMsg = Util.isInvalidValue(messageLimit, 'integer'))) {
                reject(new Error('The "messageLimit" argument for pullMessages is invalid: ' + errMsg));
                return;
            }
            var soapBody = '';
            soapBody = '<tev:PullMessages>';
            soapBody += '<tev:Timeout>';
            soapBody += timeout;
            soapBody += '</tev:Timeout>';
            soapBody += '<tev:MessageLimit>';
            soapBody += messageLimit.toString();
            soapBody += '</tev:MessageLimit>';
            soapBody += '</tev:PullMessages>';
            _this.buildRequest('PullMessages', soapBody, subscriptionId)
                .then(function (results) {
                resolve(results);
            })["catch"](function (error) {
                reject(error);
            });
        });
        if (Util.isValidCallback(callback)) {
            promise.then(function (result) {
                callback(null, result);
            })["catch"](function (error) {
                callback(error);
            });
        }
        else {
            return promise;
        }
    };
    /**
     * Event Type: Agnostic<br>
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Events.prototype.renew = function (callback) {
        // Example RenewRequest
        // <Renew xmlns="http://docs.oasis-open.org/wsn/b-2">
        // <TerminationTime>PT10M</TerminationTime>
        // </Renew>
        return this.buildRequest('Renew', null, null, callback);
    };
    /**
     * <strong>Not implemented</strong>
     * Event Type: Pull Event<br>
     * This method readjusts the pull pointer into the past. A device supporting persistent notification storage shall provide the following Seek command for all SubscriptionManager endpoints returned by the CreatePullPointSubscription command. The optional Reverse argument can be used to reverse the pull direction of the PullMessages command.<br>
     * The UtcTime argument will be matched against the UtcTime attribute on a NotificationMessage.
     * @param {string} utcTime The date and time to match against stored messages.
     * @param {boolean=} reverse Reverse the pull direction of PullMessages.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Events.prototype.seek = function (utcTime, reverse, callback) {
        return new Promise(function (resolve, reject) {
            reject(new Error('Not implemented'));
        });
    };
    // notify (callback) {
    //   return this.buildRequest('Notify', null, null, callback)
    // }
    /**
     * Event Type: Push Event<br>
     * The device shall provide the following Unsubscribe command for all SubscriptionManager
     * endpoints returned by the CreatePullPointSubscription command.<br>
     * This command shall terminate the lifetime of a pull point.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Events.prototype.subscribe = function (callback) {
        // Example SubscribeRequest
        // <Subscribe xmlns="http://docs.oasis-open.org/wsn/b-2">
        //   <ConsumerReference>
        //     <wsa:Address>http://192.168.0.111:10000/onvif/events</wsa:Address>
        //   </ConsumerReference>
        //   <Filter>
        //     <TopicExpression
        //       Dialect="http://www.onvif.org/ver10/tev/topicExpression/ConcreteSet"
        //       xmlns:tns1="http://www.onvif.org/ver10/topics">tns1:VideoSource/MotionAlarm
        //     </TopicExpression>
        //   </Filter>
        //   <InitialTerminationTime>PT10M</InitialTerminationTime>
        // </Subscribe>
        return this.buildRequest('Subscribe', null, null, callback);
    };
    /**
     * Event Type: Agnostic<br>
     * The device shall provide the following Unsubscribe command for all SubscriptionManager
     * endpoints returned by the CreatePullPointSubscription command.<br>
     * This command shall terminate the lifetime of a pull point.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Events.prototype.unsubscribe = function (callback) {
        // Example UnsubscribeRequest
        // <Unsubscribe xmlns="http://docs.oasis-open.org/wsn/b-2" />
        return this.buildRequest('Unsubscribe', null, null, callback);
    };
    /**
     * Event Type: Agnostic<br>
     * Properties inform a client about property creation, changes and deletion in a uniform way. When a client wants to synchronize its properties with the properties of the device, it can request a synchronization point which repeats the current status of all properties to which a client has subscribed. The PropertyOperation of all produced notifications is set to “Initialized”. The Synchronization Point is requested directly from the SubscriptionManager which was returned in either the SubscriptionResponse or in the CreatePullPointSubscriptionResponse. The property update is transmitted via the notification transportation of the notification interface. This method is mandatory.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Events.prototype.setSynchronizationPoint = function (callback) {
        return this.buildRequest('SetSynchronizationPoint', null, null, callback);
    };
    return Events;
}(EventEmitter));
module.exports = Events;
