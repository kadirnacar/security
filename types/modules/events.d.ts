export = Events;
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
declare class Events {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    intervalId: number;
    /**
     * Call this function directly after instantiating an Events object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    init(timeDiff: number, serviceAddress: object, username?: string | undefined, password?: string | undefined): void;
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     * @param {object=} subscriptionId Used internally.
     */
    createRequest(body: string, subscriptionId?: object | undefined): string;
    buildRequest(methodName: any, xml: any, subscriptionId: any, callback: any): any;
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
    startPull(loopTimeMS?: integer, timeout?: string | undefined, messageLimit?: integer): void;
    /**
     * Stops a PullMessages event loop that has been started with <strong>start()</strong>.
     */
    stopPull(): void;
    _getMessages(timeout: any, messageLimit: any): any;
    _createPullPointSubscription(): any;
    _pullMessages(subscriptionId: any, timeout: any, messageLimit: any): any;
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
    createPullPointSubscription(filter?: string | undefined, initialTerminationTime?: integer, subscriptionPolicy?: xml, callback?: any): any;
    /**
     * Event Type: Agnostic<br>
     * The WS-BaseNotification specification defines a set of OPTIONAL WS-ResouceProperties. This specification does not require the implementation of the WS-ResourceProperty interface. Instead, the subsequent direct interface shall be implemented by an ONVIF compliant device in order to provide information about the FilterDialects, Schema files and topics supported by the device.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getEventProperties(callback?: any): any;
    /**
     * Event Type: Agnostic<br>
     * Returns the capabilities of the event service. The result is returned in a typed answer.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getServiceCapabilities(callback?: any): any;
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
    pullMessages(subscriptionId: {
        Address: {
            _: object;
            $: object;
        };
    }, timeout: integer, messageLimit: integer, callback?: any): any;
    /**
     * Event Type: Agnostic<br>
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    renew(callback?: any): any;
    /**
     * <strong>Not implemented</strong>
     * Event Type: Pull Event<br>
     * This method readjusts the pull pointer into the past. A device supporting persistent notification storage shall provide the following Seek command for all SubscriptionManager endpoints returned by the CreatePullPointSubscription command. The optional Reverse argument can be used to reverse the pull direction of the PullMessages command.<br>
     * The UtcTime argument will be matched against the UtcTime attribute on a NotificationMessage.
     * @param {string} utcTime The date and time to match against stored messages.
     * @param {boolean=} reverse Reverse the pull direction of PullMessages.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    seek(utcTime: string, reverse?: boolean | undefined, callback?: any): any;
    /**
     * Event Type: Push Event<br>
     * The device shall provide the following Unsubscribe command for all SubscriptionManager
     * endpoints returned by the CreatePullPointSubscription command.<br>
     * This command shall terminate the lifetime of a pull point.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    subscribe(callback?: any): any;
    /**
     * Event Type: Agnostic<br>
     * The device shall provide the following Unsubscribe command for all SubscriptionManager
     * endpoints returned by the CreatePullPointSubscription command.<br>
     * This command shall terminate the lifetime of a pull point.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    unsubscribe(callback?: any): any;
    /**
     * Event Type: Agnostic<br>
     * Properties inform a client about property creation, changes and deletion in a uniform way. When a client wants to synchronize its properties with the properties of the device, it can request a synchronization point which repeats the current status of all properties to which a client has subscribed. The PropertyOperation of all produced notifications is set to “Initialized”. The Synchronization Point is requested directly from the SubscriptionManager which was returned in either the SubscriptionResponse or in the CreatePullPointSubscriptionResponse. The property update is transmitted via the notification transportation of the notification interface. This method is mandatory.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    setSynchronizationPoint(callback?: any): any;
}
import Soap = require("../utils/soap");
