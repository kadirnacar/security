export = Core;
/**
  * All ONVIF API functions return a Promise, unless an optional callback is supplied.
  * @callback callback
  * @param {Error} error The error object.
  * @param {string} error.message The error message.
  * @param {xml} error.soap Associated SOAP xml that is cause of the error.
  * @param {object} error.fault Fault information
  * @param {string} error.fault.reason Reason for the error.
  * @param {string} error.fault.code Code for the error.
  * @param {string} error.fault.detail Details of the error.
  * @param {data} data The returned data when there is no error.
  */
/**
 * @class
 * Provide core functionality for Onvif Device Management.
 * <p>
 * {@link https://www.onvif.org/onvif/specs/core/ONVIF-Core-Specification-v220.pdf}<br>
 * {@link https://www.onvif.org/ver10/device/wsdl/devicemgmt.wsdl}<br>
 * {@link https://www.onvif.org/ver10/events/wsdl/event.wsdl}<br>
 * </p>
 * <h3>Functions</h3>
 * {@link Core#getWsdlUrl},
 * {@link Core#getServices},
 * {@link Core#getServiceCapabilities},
 * {@link Core#getCapabilities},
 * {@link Core#getHostname},
 * {@link Core#setHostname},
 * {@link Core#setHostnameFromDHCP},
 * {@link Core#getDNS},
 * {@link Core#setDNS},
 * {@link Core#getNTP},
 * {@link Core#setNTP},
 * {@link Core#getDynamicDNS},
 * setDynamicDNS,
 * {@link Core#getNetworkInterfaces},
 * setNetworkInterfaces,
 * {@link Core#getNetworkProtocols},
 * {@link Core#getNetworkDefaultGateway},
 * setNetworkDefaultGateway,
 * {@link Core#getZeroConfiguration},
 * setZeroConfiguration,
 * {@link Core#getIPAddressFilter},
 * setIPAddressFilter,
 * addIPAddressFilter,
 * removeIPAddressFilter,
 * {@link Core#getDot11Capabilities},
 * {@link Core#getDot11Status},
 * {@link Core#scanAvailableDot11Networks},
 * {@link Core#getDeviceInformation},
 * {@link Core#getSystemUris},
 * {@link Core#getSystemBackup},
 * restoreSystem,
 * startSystemRestore,
 * {@link Core#getSystemDateAndTime},
 * setSystemDateAndTime,
 * setSystemFactoryDefault,
 * upgradeSystemFirmware,
 * startFirmwareUpgrade,
 * {@link Core#getSystemLog},
 * {@link Core#getSystemSupportInformation},
 * {@link Core#systemReboot},
 * {@link Core#getScopes},
 * setScopes,
 * addScopes,
 * removeScopes,
 * {@link Core#getGeoLocation},
 * setGeoLocation,
 * deleteGeoLocation,
 * {@link Core#getDiscoveryMode},
 * setDiscoveryMode,
 * {@link Core#getRemoteDiscoveryMode},
 * setRemoteDiscoveryMode,
 * {@link Core#getDPAddresses},
 * setDPAddresses,
 * {@link Core#getAccessPolicy},
 * setAccessPolicy
 * {@link Core#getUsers},
 * createUsers,
 * deleteUsers,
 * setUser,
 * createDot1XConfiguration,
 * setDot1XConfiguration,
 * {@link Core#getDot1XConfiguration},
 * {@link Core#getDot1XConfigurations},
 * deleteDot1XConfigurations,
 * createCertificate,
 * {@link Core#getCertificates},
 * {@link Core#getCACertificates},
 * {@link Core#getCertificatesStatus},
 * setCertificatesStatus,
 * getPkcs10Request,
 * {@link Core#getClientCertificateMode},
 * setClientCertificateMode,
 * loadCertificates,
 * loadCertificateWithPrivateKey,
 * getCertificateInformation,
 * loadCACertificates,
 * deleteCertificates,
 * {@link Core#getRemoteUser},
 * setRemoteUser,
 * {@link Core#getEndpointReference},
 * {@link Core#getRelayOutputs},
 * setRelayOutputSettings,
 * setRelayOutputState,
 * sendAuxiliaryCommand
 * <br><br>
 * <h3>Overview</h3>
 * The Device Service is divided into five different categories: capabilities, network, system, I/O
 * and security commands. This set of commands can be used to get information about the
 * device capabilities and configurations or to set device configurations. An ONVIF compliant
 * device shall support the device management service as specified in [ONVIF DM WSDL]. A
 * basic set of operations are required for the device management service, other operations are
 * recommended or optional to support. The detailed requirements are listed under the command
 * descriptions.
 */
declare class Core {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Core object.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    init(serviceAddress: object, username?: string | undefined, password?: string | undefined): void;
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    createRequest(body: string): string;
    buildRequest(methodName: any, xml: any, callback: any): any;
    /**
     * Returns the onvif device's time difference<br>
     * {@link getSystemDateAndTime} must be called first to get an accurate time.
     */
    getTimeDiff(): number;
    /**
     * It is possible for an endpoint to request a URL that can be used to retrieve the complete
     * schema and WSDL definitions of a device. The command gives in return a URL entry point
     * where all the necessary product specific WSDL and schema definitions can be retrieved. The
     * device shall provide a URL for WSDL and schema download through the GetWsdlUrl
     * command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getWsdlUrl(callback?: callback | undefined): any;
    /**
     * <strong>+++ I get an 'Action Failed' with Axis cameras. Hikvision works fine.</strong><br>
     * Returns a collection of the devices services and possibly their available capabilities. The
     * returned capability response message is untyped to allow future addition of services, service
     * revisions and service capabilities. All returned service capabilities shall be structured by
     * different namespaces which are supported by a device.<br>
     * A device shall implement this method if any of the ONVIF compliant services implements the
     * GetServiceCapabilities. For making sure about the structure of GetServices response with
     * capabilities, please refer to Annex C. Example for GetServices Response with capabilities.<br>
     * The version in GetServicesResponse shall contain the specification version number of the
     * corresponding service that is implemented by a device.
     * @param {boolean=} includeCapability The message contains a request for all services in the device and
     * possibly the capabilities for each service. If the Boolean
     * IncludeCapability is set, then the response shall include the services
     * capabilities.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getServices(includeCapability?: boolean | undefined, callback?: callback | undefined): any;
    /**
     * <strong>+++ I get an 'Action Failed' with Axis cameras. Hikvision works fine.</strong><br>
     * This command returns the capabilities of the device service. The service shall implement this
     * method if the device supports the GetServices method.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getServiceCapabilities(callback?: callback | undefined): any;
    /**
     * This method provides a backward compatible interface for the base capabilities. Refer to
     * GetServices for a full set of capabilities.<br>
     * Annex A describes how to interpret the indicated capability. Apart from the addresses, the
     * capabilities only reflect optional functions in this specification.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCapabilities(callback?: callback | undefined): any;
    /**
     * This operation is used by an endpoint to get the hostname from a device. The device shall
     * return its hostname configurations through the GetHostname command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getHostname(callback?: callback | undefined): any;
    /**
     * This operation sets the hostname on a device. It shall be possible to set the device hostname
     * configurations through the SetHostname command. Attention: a call to SetDNS may result in
     * overriding a previously set hostname.<br>
     * A device shall accept strings formated according to RFC 1123 section 2.1 or alternatively to
     * RFC 952, other string shall be considered as invalid strings.<br>
     * A device shall try to retrieve the name via DHCP when the HostnameFromDHCP capability is
     * set and an empty name string is provided.
     * @param {*} name The host name. If Name is an empty string hostname
     * should be retrieved from DHCP, otherwise the specified Name
     * shall be used.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    setHostname(name: any, callback?: callback | undefined): any;
    /**
     * This operation controls whether the hostname shall be retrieved from DHCP.
     * A device shall support this command if support is signalled via the HostnameFromDHCP
     * capability. Depending on the device implementation the change may only become effective
     * after a device reboot. A device shall accept the command independent whether it is currently
     * using DHCP to retrieve its IPv4 address or not. Note that the device is not required to retrieve
     * its hostname via DHCP while the device is not using DHCP for retrieving its IP address. In the
     * latter case the device may fall back to the statically set hostname.
     * @param {boolean=} fromDHCP True if the hostname shall be obtained via DHCP.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    setHostnameFromDHCP(fromDHCP?: boolean | undefined, callback?: callback | undefined): any;
    /**
     * This operation gets the DNS settings from a device. The device shall return its DNS
     * configurations through the GetDNS command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getDNS(callback?: callback | undefined): any;
    /**
     * This operation sets the DNS settings on a device. It shall be possible to set the device DNS
     * configurations through the SetDNS command.<br>
     * It is valid to set the FromDHCP flag while the device is not using DHCP to retrieve its IPv4
     * address.
     * @param {boolean} fromDHCP True if the DNS servers are obtained via DHCP.
     * @param {array=} searchDomain The domain(s) to search if the hostname is not
     * fully qualified.
     * @param {array=} DNSManual A list of manually given DNS servers
     * @param {'IPv4'|'IPv6'} DNSManual.type The type of address in this object. Use only one type of address.
     * @param {string=} DNSManual.IP4Address An IPv4 address.
     * @param {string=} DNSManual.IP6Address An IPv6 address.
     * @param {callback=} callback Optional callback, instead of a Promise.
     * @example
     * DNSManual: [
     *   { type: 'IPv4', IP4Address: '10.10.1.20' }
     * ]
     */
    setDNS(fromDHCP: boolean, searchDomain?: any[] | undefined, DNSManual?: any[] | undefined, callback?: callback | undefined): any;
    /**
     * This operation gets the NTP settings from a device. If the device supports NTP, it shall be
     * possible to get the NTP server settings through the GetNTP command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getNTP(callback?: callback | undefined): any;
    /**
     * This operation sets the NTP settings on a device. If support for NTP is signalled via the NTP
     * capability, it shall be possible to set the NTP server settings through the SetNTP command.<br>
     * A device shall accept string formated according to RFC 1123 section 2.1, other string shall be
     * considered as invalid strings. It is valid to set the FromDHCP flag while the device is not using
     * DHCP to retrieve its IPv4 address.<br>
     * Changes to the NTP server list shall not affect the clock mode DateTimeType. Use
     * SetSystemDateAndTime to activate NTP operation.
     * @param {boolean} fromDHCP True if the NTP servers are obtained via DHCP.
     * @param {array=} NTPManual A list of manually given NTP servers when they
     * not are obtained via DHCP.
     * @param {string=} NTPManual.type True if the NTP servers are obtained via DHCP.
     * @param {string=} NTPManual.IPv4Address An IPv4 address.
     * @param {string=} NTPManual.IP6Address An IPv6 address.
     * @param {callback=} callback Optional callback, instead of a Promise.
     * @example
     * NTPManual: [
     *   { type: 'IPv4', IP4Address: 'time1.goggle.com' }
     * ]
     */
    setNTP(fromDHCP: boolean, NTPManual?: any[] | undefined, callback?: callback | undefined): any;
    /**
     * This operation gets the dynamic DNS settings from a device. If the device supports dynamic
     * DNS as specified in [RFC 2136] and [RFC 4702], it shall be possible to get the type, name
     * and TTL through the GetDynamicDNS command
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getDynamicDNS(callback?: callback | undefined): any;
    /**
     *
     * @param {NoUpdate|ServerUpdates|ClientUpdates} type The type of update. There are three possible types: the
     * device desires no update (NoUpdate), the device wants the
     * DHCP server to update (ServerUpdates) and the device does
     * the update itself (ClientUpdates).
     * @param {string=} name The DNS name in case of the device does the update.
     * @param {integer=} ttl Time to live
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    setDynamicDNS(type: NoUpdate | ServerUpdates | ClientUpdates, name?: string | undefined, ttl?: integer, callback?: callback | undefined): any;
    /**
     * This operation gets the network interface configuration from a device. The device shall support return of network interface configuration settings as defined by the NetworkInterface type through the GetNetworkInterfaces command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getNetworkInterfaces(callback?: callback | undefined): any;
    setNetworkInterfaces(): any;
    /**
     * This operation gets defined network protocols from a device. The device shall support the GetNetworkProtocols command returning configured network protocols.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getNetworkProtocols(callback?: callback | undefined): any;
    setNetworkProtocols(): any;
    /**
     * This operation gets the default gateway settings from a device. The device shall support the GetNetworkDefaultGateway command returning configured default gateway address(es).
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getNetworkDefaultGateway(callback?: callback | undefined): any;
    setNetworkDefaultGateway(): any;
    /**
     * This operation gets the zero-configuration from a device. If the device supports dynamic IP configuration according to [RFC3927], it shall support the return of IPv4 zero configuration address and status through the GetZeroConfiguration command.<br>
     * Devices supporting zero configuration on more than one interface shall use the extension to list the additional interface settings.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getZeroConfiguration(callback?: callback | undefined): any;
    setZeroConfiguration(): any;
    /**
     * This operation gets the IP address filter settings from a device. If the device supports device access control based on IP filtering rules (denied or accepted ranges of IP addresses), the device shall support the GetIPAddressFilter command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getIPAddressFilter(callback?: callback | undefined): any;
    setIPAddressFilter(): any;
    addIPAddressFilter(): any;
    removeIPAddressFilter(): any;
    /**
     * This operation returns the IEEE802.11 capabilities. The device shall support this operation.<br>
     * <strong>Not all do.</strong>
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getDot11Capabilities(callback?: callback | undefined): any;
    /**
     * This operation returns the status of a wireless network interface. The device shall support this command.<br>
     * <strong>Not all do.</strong>
     * @param {string} interfaceToken Network reference token.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getDot11Status(interfaceToken: string, callback?: callback | undefined): any;
    /**
     * This operation returns a lists of the wireless networks in range of the device. A device should
     * support this operation. The following status can be returned for each network:
     * <ul>
     * <li>SSID (shall)</li>
     * <li>BSSID (should)</li>
     * <li>Authentication and key management suite(s) (should)</li>
     * <li>Pair cipher(s) (should)</li>
     * <li>Group cipher(s) (should)</li>
     * <li>Signal strength (should)</li>
     * </ul>
     * @param {string} interfaceToken Network reference token.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    scanAvailableDot11Networks(interfaceToken: string, callback?: callback | undefined): any;
    /**
     * This operation gets device information, such as manufacturer, model and firmware version
     * from a device. The device shall support the return of device information through the
     * GetDeviceInformation command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getDeviceInformation(callback?: callback | undefined): any;
    /**
     * This operation is used to retrieve URIs from which system information may be downloaded
     * using HTTP. URIs may be returned for the following system information:<br>
     * <strong>System Logs.</strong> Multiple system logs may be returned, of different types. The exact format of
     * the system logs is outside the scope of this specification.<br>
     * <strong>Support Information.</strong> This consists of arbitrary device diagnostics information from a device.
     * The exact format of the diagnostic information is outside the scope of this specification.<br>
     * <strong>System Backup.</strong> The received file is a backup file that can be used to restore the current
     * device configuration at a later date. The exact format of the backup configuration file is
     * outside the scope of this specification.<br>
     * If the device allows retrieval of system logs, support information or system backup data, it
     * should make them available via HTTP GET. If it does, it shall support the GetSystemUris
     * command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getSystemUris(callback?: callback | undefined): any;
    /**
     * <i>This interface has been deprecated.</i><br>
     * A device shall implement this command if the capability
     * SystemBackup is signaled. For a replacement method see section 8.3.2 and 8.3.5.<br>
     * This operation retrieves system backup configuration file(s) from a device. The backup is
     * returned with reference to a name and mime-type together with binary data. The format of the
     * backup configuration data is vendor specific. It is expected that after completion of the restore
     * operation the device is working on the same configuration as that of the time the configuration
     * was backed up. Note that the configuration of static IP addresses may differ.<br>
     * Device vendors may put restrictions on the functionality to be restored. The detailed behavior
     * is outside the scope of this specification.<br>
     * The backup configuration file(s) are transmitted through MTOM [MTOM].
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getSystemBackup(callback?: callback | undefined): any;
    restoreSystem(): any;
    startSystemRestore(): any;
    /**
     * This operation gets the device system date and time.
     * The device shall support the return of the daylight
     * saving setting and of the manual system date and time
     * (if applicable) or indication of NTP time (if applicable)
     * through the GetSystemDateAndTime command.<br>
     * A device shall provide the UTCDateTime information although
     * the item is marked as optional to ensure backward compatibility.<br>
     * This is required to be called for devices that
     * support the GetSystemDateAndTime SOAP method so
     * a time diff can be used in subsequent calls to
     * the device.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getSystemDateAndTime(callback?: callback | undefined): any;
    /**
     * Private function
     * @param {object} sdt GetSystemDateAndTimeResponse converted to JSON.
     */
    parseGetSystemDateAndTime(sdt: object): {
        type: any;
        dst: boolean;
        tz: any;
        date: Date;
    };
    setSystemDateAndTime(): any;
    setSystemFactoryDefault(): any;
    upgradeSystemFirmware(): any;
    startFirmwareUpgrade(): any;
    /**
     * This operation gets a system log from the device. The exact format of the system logs is outside the scope of this standard.
     * @param {System|Access} logType Specifies the type of system log to get.
     * <ul>
     * <li>System: Indicates that a system log is requested.</li>
     * <li>Access: Indicates that a access log is requested.</li>
     * </ul>
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getSystemLog(logType: System | Access, callback?: callback | undefined): any;
    /**
     * This operation gets arbitary device diagnostics information from the device.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getSystemSupportInformation(callback?: callback | undefined): any;
    /**
     * This operation reboots the device.
     * @returns Contains the reboot message from the device (ie: Rebooting in 90 seconds).
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    systemReboot(callback?: callback | undefined): any;
    /**
     * This operation requests the scope parameters of a device. The scope parameters are used in
     * the device discovery to match a probe message, see Section 7. The Scope parameters are of
     * two different types:
     * <ul>
     *  <li>Fixed</li>
     *  <li>Configurable</li>
     * </ul>
     * Fixed scope parameters are permanent device characteristics and cannot be removed
     * through the device management interface. The scope type is indicated in the scope list
     * returned in the get scope parameters response. A device shall support retrieval of discovery
     * scope parameters through the GetScopes command. As some scope parameters are
     * mandatory, the device shall return a non-empty scope list in the response.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getScopes(callback?: callback | undefined): any;
    setScopes(): any;
    addScopes(): any;
    removeScopes(): any;
    /**
     * This operation gets the geo location information of a device. A device that signals support for
     * GeoLocation via the capability GeoLocationEntities shall support the retrieval of geo location
     * information via this command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getGeoLocation(callback?: callback | undefined): any;
    setGeoLocation(): any;
    deleteGeoLocation(): any;
    /**
     * This operation gets the discovery mode of a device
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getDiscoveryMode(callback?: callback | undefined): any;
    setDiscoveryMode(): any;
    /**
     * This operation gets the remote discovery mode of a device. See Section 7.4 for the definition of remote discovery extensions. A device that supports remote discovery shall support retrieval of the remote discovery mode setting through the GetRemoteDiscoveryMode command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getRemoteDiscoveryMode(callback?: callback | undefined): any;
    setRemoteDiscoveryMode(): any;
    /**
     * This operation gets the remote DP address or addresses from a device. If the device supports remote discovery, as specified in Section 7.4, the device shall support retrieval of the remote DP address(es) through the GetDPAddresses command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getDPAddresses(callback?: callback | undefined): any;
    setDPAddresses(): any;
    /**
     * Access to different services and sub-sets of services should be subject
     * to access control. The WS-Security framework gives the prerequisite for
     * end-point authentication. Authorization decisions can then be taken
     * using an access security policy. This standard does not mandate any
     * particular policy description format or security policy but this is
     * up to the device manufacturer or system provider to choose policy and
     * policy description format of choice. However, an access policy (in
     * arbitrary format) can be requested using this command. If the device
     * supports access policy settings based on WS-Security authentication,
     * then the device shall support this command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAccessPolicy(callback?: callback | undefined): any;
    setAccessPolicy(): any;
    /**
     * This operation lists the registered users and corresponding credentials on a device. The device shall support retrieval of registered device users and their credentials for the user token through the GetUsers command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getUsers(callback?: callback | undefined): any;
    createUsers(): any;
    deleteUsers(): any;
    setUser(): any;
    createDot1XConfiguration(): any;
    setDot1XConfiguration(): any;
    /**
     * This operation gets one IEEE 802.1X configuration parameter set from the device by
     * specifying the configuration token (Dot1XConfigurationToken).<br>
     * The device shall support this command if support for IEEE 802.1X is signaled via the Security
     * Dot1X capability.<br>
     * Regardless of whether the 802.1X method in the retrieved configuration has a password or
     * not, the device shall not include the Password element in the response.
     * @param {string} dot1XConfigurationToken Dot1XConfigurationToken [ReferenceToken]
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getDot1XConfiguration(dot1XConfigurationToken: string, callback?: callback | undefined): any;
    /**
     * This operation gets all the existing IEEE 802.1X configuration parameter sets from the device.<br>
     * The device shall respond with all the IEEE 802.1X configurations so that the client can get to
     * know how many IEEE 802.1X configurations are existing and how they are configured.<br>
     * The device shall support this command if support for IEEE 802.1X is signaled via the Security
     * Dot1X capability.<br>
     * Regardless of whether the 802.1X method in the retrieved configuration has a password or
     * not, the device shall not include the Password element in the response.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getDot1XConfigurations(callback?: callback | undefined): any;
    deleteDot1XConfigurations(): any;
    createCertificate(): any;
    /**
     * This operation gets all device server certificates (including self-signed) for the purpose of TLS
     * authentication and all device client certificates for the purpose of IEEE 802.1X authentication.<br>
     * This command lists only the TLS server certificates and IEEE 802.1X client certificates for the
     * device (neither trusted CA certificates nor trusted root certificates). The certificates are
     * returned as binary data. A device that supports TLS shall support this command and the
     * certificates shall be encoded using ASN.1 [X.681], [X.682], [X.683] DER [X.690] encoding
     * rules.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCertificates(callback?: callback | undefined): any;
    /**
     * CA certificates will be loaded into a device and be used for the sake of following two cases.<br>
     * The one is for the purpose of TLS client authentication in TLS server function. The other one
     * is for the purpose of Authentication Server authentication in IEEE 802.1X function. This
     * operation gets all CA certificates loaded into a device. A device that supports either TLS client
     * authentication or IEEE 802.1X shall support this command and the returned certificates shall
     * be encoded using ASN.1 [X.681], [X.682], [X.683] DER [X.690] encoding rules.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCACertificates(callback?: callback | undefined): any;
    /**
     * This operation is specific to TLS functionality. This operation gets the status
     * (enabled/disabled) of the device TLS server certificates. A device that supports TLS shall
     * support this command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCertificatesStatus(callback?: callback | undefined): any;
    setCertificatesStatus(): any;
    getPkcs10Request(): any;
    /**
     * This operation is specific to TLS functionality. This operation gets the status
     * (enabled/disabled) of the device TLS client authentication. A device that supports TLS shall
     * support this command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getClientCertificateMode(callback?: callback | undefined): any;
    setClientCertificateMode(): any;
    loadCertificates(): any;
    loadCertificateWithPrivateKey(): any;
    getCertificateInformation(): any;
    loadCACertificates(): any;
    deleteCertificates(): any;
    /**
     * This operation returns the configured remote user (if any). A device that signals support for
     * remote user handling via the Security Capability RemoteUserHandling shall support this
     * operation. The user is only valid for the WS-UserToken profile or as a HTTP / RTSP user.<br>
     * The algorithm to use for deriving the password is described in section 5.12.3.1.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getRemoteUser(callback?: callback | undefined): any;
    setRemoteUser(): any;
    /**
     * A client can ask for the device service endpoint reference address property that can be used
     * to derive the password equivalent for remote user operation. The device should support the
     * GetEndpointReference command returning the address property of the device service
     * endpoint reference.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getEndpointReference(callback?: callback | undefined): any;
    /**
     * This operation gets a list of all available relay outputs and their settings.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getRelayOutputs(callback?: callback | undefined): any;
    setRelayOutputSettings(): any;
    setRelayOutputState(): any;
    sendAuxiliaryCommand(): any;
}
declare namespace Core {
    export { callback };
}
import Soap = require("../utils/soap");
/**
 * All ONVIF API functions return a Promise, unless an optional callback is supplied.
 */
type callback = (error: Error, message: string, soap: xml, fault: object, reason: string, code: string, detail: string, data: data) => any;
