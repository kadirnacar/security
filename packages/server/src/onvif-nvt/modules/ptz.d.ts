export = Ptz;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/ptz/ONVIF-PTZ-Service-Spec-v1712.pdf}<br>
 * {@link https://www.onvif.org/ver20/ptz/wsdl/ptz.wsdl}<br>
 * </p>
 * <h3>Functions</h3>
 * {@link Ptz#getNodes},
 * {@link Ptz#getNode},
 * {@link Ptz#getConfigurations},
 * {@link Ptz#getConfiguration},
 * {@link Ptz#getConfigurationOptions},
 * {@link Ptz#setConfiguration},
 * {@link Ptz#getCompatibleConfigurations},
 * {@link Ptz#absoluteMove},
 * {@link Ptz#relativeMove},
 * {@link Ptz#continuousMove},
 * {@link Ptz#geoMove},
 * {@link Ptz#stop},
 * {@link Ptz#getStatus},
 * {@link Ptz#getStatus},
 * {@link Ptz#setPreset},
 * {@link Ptz#getPresets},
 * {@link Ptz#gotoPreset},
 * {@link Ptz#removePreset},
 * {@link Ptz#gotoHomePosition},
 * {@link Ptz#setHomePosition},
 * {@link Ptz#sendAuxiliaryCommand}
 * <br><br>
 * <h3>Overview</h3>
 * The PTZ model groups the possible movements of the PTZ unit into a Pan/Tilt component and
 * into a Zoom component. To steer the PTZ unit, the service provides absolute move, relative
 * move and continuous move operations. Different coordinate systems and units are used to feed
 * these operations.<br>
 * The PTZ service provides an AbsoluteMove operation to move the PTZ device to an absolute
 * position. The service expects the absolute position as an argument referencing an absolute
 * coordinate system. The speed of the Pan/Tilt movement and the Zoom movement can be
 * specified optionally. Speed values are positive scalars and do not contain any directional
 * information. It is not possible to specify speeds for Pan and Tilt separately without knowledge
 * about the current position. This approach to specifying a desired position generally produces a
 * non-smooth and non-intuitive action.<br>
 * A RelativeMove operation is introduced by the PTZ service in order to steer the dome relative to
 * the current position, but without the need to know the current position. The operation expects a
 * positional translation as an argument referencing a relative coordinate system. This
 * specification distinguishes between relative and absolute coordinate systems, since there are
 * cases where no absolute coordinate system exists for a well-defined relative coordinate system.
 * An optional speed argument can be added to the RelativeMove operation with the same
 * meaning as for the AbsoluteMove operation.<br>
 * Finally, the PTZ device can be moved continuously via the ContinuousMove command in a
 * certain direction with a certain speed. Thereby, a velocity vector represents both, the direction
 * and the speed information. The latter is expressed by the length of the vector.
 * The Pan/Tilt and Zoom coordinates can be uniquely specified by augmenting the coordinates
 * with appropriate space URIs. A space URI uniquely represents the underlying coordinate system.
 * Section 5.7 defines a standard set of coordinate systems. A PTZ Node shall implement these
 * coordinate systems if the corresponding type of movement is supported by the PTZ Node. In
 * many cases, the Pan/Tilt position is represented by pan and tilt angles in a spherical coordinate
 * system. A digital PTZ, operating on a fixed megapixel camera, may express the camera’s
 * viewing direction by a pixel position on a static projection plane. Therefore, different coordinate
 * systems are needed in this case in order to capture the physical or virtual movements of the
 * PTZ device. Optionally, the PTZ Node may define its own device specific coordinate systems to
 * enable clients to take advantage of the specific properties of this PTZ Node.
 * The PTZ Node description retrieved via the GetNode or GetNodes operation contains all
 * coordinate systems supported by a specific PTZ Node. Each coordinate system belongs to one
 * of the following groups:
 * <ul>
 * <li>AbsolutePanTiltPositionSpace</li>
 * <li>RelativePanTiltTranslationSpace</li>
 * <li>ContinuousPanTiltVelocitySpace</li>
 * <li>PanTiltSpeedSpace</li>
 * <li>AbsoluteZoomPositionSpace</li>
 * <li>RelativeZoomTranslationSpace</li>
 * <li>ContinuousZoomVelocitySpace</li>
 * <li>ZoomSpeedSpace</li>
 * </ul>
 * If the PTZ node does not support the coordinate systems of a certain group, the corresponding
 * move operation will not be available for this PTZ node. For instance, if the list does not contain
 * an AbsolutePanTiltPositionSpace, the AbsoluteMove operation shall fail when an absolute
 * Pan/Tilt position is specified. The corresponding command section describes those spaces that
 * are required for a specific move command.<br>
 * <br>
 */
declare class Ptz {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    defaultProfileToken: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Ptz object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    init(timeDiff: number, serviceAddress: object, username?: string | undefined, password?: string | undefined): void;
    /**
     * Sets the default profile token. This comes from media#getProfiles method.<br>
     * By default, this module will get the first Profile and use it as the default profile.
     * You can change the default profile by setting this function.
     * Note: This functionality is only used where API calls require a <strong>ProfileToken</strong> and one is not provided.
     * @param {string} profileToken The profileToken to use when one is not passed to a method requiring one.
     */
    setDefaultProfileToken(profileToken: string): void;
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    createRequest(body: string): string;
    buildRequest(methodName: any, xml: any, callback: any): any;
    /**
     * Used internally. Creates xml where PanTilt (x|y) and Zoom (z) are needed.
     * @param {object} vectors One of PanTilt (x,y) or Zoom (z), or both, is required.
     * @param {object=} vectors.x The x component corresponds to pan.
     * @param {object=} vectors.y The y component corresponds to tilt.
     * @param {object=} vectors.z The z component corresponds to zoom.
     */
    panTiltZoomOptions(vectors: {
        x?: object | undefined;
        y?: object | undefined;
        z?: object | undefined;
    }): string;
    /**
     * A PTZ-capable device shall implement this operation and return all PTZ nodes available on the device.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getNodes(callback?: any): any;
    /**
     * A PTZ-capable device shall implement the GetNode operation and return the properties of the
     * requested PTZ node, if it exists. Otherwise, the device shall respond with an appropriate fault
     * message.
     * @param {*} nodeToken Reference to the requested PTZNode.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getNode(nodeToken: any, callback?: any): any;
    /**
     * The PTZConfiguration contains a reference to the PTZ node in which it belongs. This reference
     * cannot be changed by a client.<br>
     * The following elements are part of the PTZ Configuration:
     * <ul>
     * <li>PTZNodeToken – A mandatory reference to the PTZ node that the PTZ Configuration
     * belongs to.</li>
     * <li>DefaultAbsolutePanTiltPositionSpace – If the PTZ node supports absolute Pan/Tilt
     * movements, it shall specify one Absolute Pan/Tilt Position Space as default.</li>
     * <li>DefaultRelativePanTiltTranslationSpace – If the PTZ node supports relative Pan/Tilt
     * movements, it shall specify one RelativePan/Tilt Translation Space as default.</li>
     * <li>DefaultContinuousPanTiltVelocitySpace – If the PTZ node supports continuous
     * Pan/Tilt movements, it shall specify one continuous Pan/Tilt velocity space as default.</li>
     * <li>DefaultPanTiltSpeedSpace – If the PTZ node supports absolute or relative
     * movements, it shall specify one Pan/Tilt speed space as default.</li>
     * <li>DefaultAbsoluteZoomPositionSpace – If the PTZ node supports absolute zoom
     * movements, it shall specify one absolute zoom position space as default.</li>
     * <li>DefaultRelativeZoomTranslationSpace – If the PTZ node supports relative zoom
     * movements, it shall specify one relative zoom translation space as default.</li>
     * <li>DefaultContinuousZoomVelocitySpace – If the PTZ node supports continuous zoom
     * movements, it shall specify one continuous zoom velocity space as default.</li>
     * <li>DefaultPTZSpeed – If the PTZ node supports absolute or relative PTZ movements, it
     * shall specify corresponding default Pan/Tilt and Zoom speeds.</li>
     * <li>DefaultPTZTimeout – If the PTZ node supports continuous movements, it shall
     * specify a default timeout, after which the movement stops.</li>
     * <li>PanTiltLimits – The Pan/Tilt limits element should be present for a PTZ node that
     * supports an absolute Pan/Tilt. If the element is present it signals the support for
     * configurable Pan/Tilt limits. If limits are enabled, the Pan/Tilt movements shall
     * always stay within the specified range. The Pan/Tilt limits are disabled by setting the
     * limits to –INF or +INF.</li>
     * <li>ZoomLimits – The zoom limits element should be present for a PTZ node that
     * supports absolute zoom. If the element is present it signals the supports for
     * configurable zoom limits. If limits are enabled the zoom movements shall always stay
     * within the specified range. The Zoom limits are disabled by settings the limits to –INF
     * and +INF.</li>
     * <li>MoveRamp – The optional acceleration ramp used by the device when moving.</li>
     * <li>PresetRamp – The optional acceleration ramp used by the device when recalling
     * presets.</li>
     * <li>PresetTourRamp – The optional acceleration ramp used by the device when
     * executing PresetTours.</li>
     * </ul>
     * The default position/translation/velocity spaces are introduced to allow clients sending move
     * requests without the need to specify a certain coordinate system. The default speeds are
     * introduced to control the speed of move requests (absolute, relative, preset), where no explicit
     * speed has been set.<br>
     * The allowed pan and tilt range for Pan/Tilt limits is defined by a two-dimensional space range
     * that is mapped to a specific absolute Pan/Tilt position space. At least one Pan/Tilt position
     * space is required by the PTZNode to support Pan/Tilt limits. The limits apply to all supported
     * absolute, relative and continuous Pan/Tilt movements. The limits shall be checked within the
     * coordinate system for which the limits have been specified. That means that even if movements
     * are specified in a different coordinate system, the requested movements shall be transformed to
     * the coordinate system of the limits where the limits can be checked. When a relative or
     * continuous movements is specified, which would leave the specified limits, the PTZ unit has to
     * move along the specified limits. The Zoom Limits have to be interpreted accordingly.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getConfigurations(callback?: any): any;
    /**
     * A PTZ-capable device shall implement the GetConfigurationOptions operation. It returns the list
     * of supported coordinate systems including their range limitations. Therefore, the options MAY
     * differ depending on whether the PTZ configuration is assigned to a profile(see ONVIF Media
     * Service Specification) containing a VideoSourceConfiguration. In that case, the options may
     * additionally contain coordinate systems referring to the image coordinate system described by
     * the VideoSourceConfiguration. Each listed coordinate system belongs to one of the groups
     * listed in Section 4. If the PTZ node supports continuous movements, it shall return a timeout
     * range within which timeouts are accepted by the PTZ node.
     * @param {string} configurationToken Reference to the requested PTZ configuration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getConfiguration(configurationToken: string, callback?: any): any;
    /**
     * A PTZ-capable device shall implement the GetConfigurationOptions operation. It returns the list
     * of supported coordinate systems including their range limitations. Therefore, the options MAY
     * differ depending on whether the PTZ configuration is assigned to a profile(see ONVIF Media
     * Service Specification) containing a VideoSourceConfiguration. In that case, the options may
     * additionally contain coordinate systems referring to the image coordinate system described by
     * the VideoSourceConfiguration. Each listed coordinate system belongs to one of the groups
     * listed in Section 4. If the PTZ node supports continuous movements, it shall return a timeout
     * range within which timeouts are accepted by the PTZ node.
     * @param {string} configurationToken Reference to the requested PTZ configuration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getConfigurationOptions(configurationToken: string, callback?: any): any;
    /**
     * <strong>+++ TODO: This function is incomplete and requires a LOT of work for little return.</strong><br>
     * <strong>+++ Alternatively, you can pass XML in for ptzConfigurationOptions in the desired</strong><br>
     * <strong>+++ way required by the spec, in which case the function will work.</strong><br>
     * A PTZ-capable device shall implement the SetConfiguration operation. The ForcePersistence
     * flag indicates if the changes remain after reboot of the device.
     * @param {string} configurationToken Reference to the PTZ configuration to be modified.
     * @param {xml} ptzConfigurationOptions The requested PTZ node configuration options.
     * @param {boolean} forcePersistence Deprecated modifier for temporary settings if supported by the device.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    setConfiguration(configurationToken: string, ptzConfigurationOptions: xml, forcePersistence: boolean, callback?: any): any;
    /**
     * A device signalling support for GetCompatibleConfigurations via the capability
     * GetCompatibleConfigurations shall return all available PTZConfigurations that can be added to
     * the referenced media profile through the GetComatibleConfigurations operation.<br>
     * A device providing more than one PTZConfiguration or more than one
     * VideoSourceConfiguration or which has any other resource interdependency between
     * PTZConfiguration entities and other resources listable in a media profile should implement this
     * operation. PTZConfiguration entities returned by this operation shall not fail on adding them to
     * the referenced media profile.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCompatibleConfigurations(profileToken?: string | undefined, callback?: any): any;
    /**
     * If a PTZ node supports absolute Pan/Tilt or absolute Zoom movements, it shall support the
     * AbsoluteMove operation. The position argument of this command specifies the absolute position
     * to which the PTZ unit moves. It splits into an optional Pan/Tilt element and an optional Zoom
     * element. If the Pan/Tilt position is omitted, the current Pan/Tilt movement shall NOT be affected
     * by this command. The same holds for the zoom position.<br>
     * The spaces referenced within the position shall be absolute position spaces supported by the
     * PTZ node. If the space information is omitted, the corresponding default spaces of the PTZ
     * configuration, a part of the specified Media Profile, is used. A device may support absolute
     * Pan/Tilt movements, absolute Zoom movements or no absolute movements by providing only
     * absolute position spaces for the supported cases.<br>
     * An existing Speed argument overrides the DefaultSpeed of the corresponding PTZ configuration
     * during movement to the requested position. If spaces are referenced within the Speed argument,
     * they shall be Speed Spaces supported by the PTZ Node.<br>
     * The operation shall fail if the requested absolute position is not reachable.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {object} position Vector specifying the absolute target position.
     * @param {float=} position.x The x component corresponds to pan.
     * @param {float=} position.y The y component corresponds to tilt.
     * @param {float=} position.z A zoom position.
     * @param {object=} speed Speed vector specifying the velocity of pan, tilt and zoom.
     * @param {float=} speed.x The x component corresponds to pan.  If omitted in a request, the current (if any) PanTilt movement should not be affected.
     * @param {float=} speed.y The y component corresponds to tilt.  If omitted in a request, the current (if any) PanTilt movement should not be affected
     * @param {float=} speed.z A zoom speed. If omitted in a request, the current (if any) Zoom movement should not be affected.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    absoluteMove(profileToken?: string | undefined, position: {
        x?: float | undefined;
        y?: float | undefined;
        z?: float | undefined;
    }, speed?: object | undefined, callback?: any): any;
    /**
     * If a PTZ node supports relative Pan/Tilt or relative Zoom movements, then it shall support the
     * RelativeMove operation. The translation argument of this operation specifies the difference from
     * the current position to the position to which the PTZ device is instructed to move. The operation
     * is split into an optional Pan/Tilt element and an optional Zoom element. If the Pan/Tilt element is
     * omitted, the current Pan/Tilt movement shall NOT be affected by this command. The same holds
     * for the zoom element.<br>
     * The spaces referenced within the translation element shall be translation spaces supported by
     * the PTZ node. If the space information is omitted for the translation argument, the
     * corresponding default spaces of the PTZ configuration, which is part of the specified Media
     * Profile, is used. A device may support relative Pan/Tilt movements, relative Zoom movements or
     * no relative movements by providing only translation spaces for the supported cases.
     * An existing speed argument overrides the DefaultSpeed of the corresponding PTZ configuration
     * during movement by the requested translation. If spaces are referenced within the speed
     * argument, they shall be speed spaces supported by the PTZ node.<br>
     * The command can be used to stop the PTZ unit at its current position by sending zero values for
     * Pan/Tilt and Zoom. Stopping shall have the very same effect independent of the relative space
     * referenced.<br>
     * If the requested translation leads to an absolute position which cannot be reached, the PTZ
     * Node shall move to a reachable position along the border of valid positions.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {object} translation Vector specifying the positional Translation relative to the current position.
     * @param {float=} translation.x The x component corresponds to pan.
     * @param {float=} translation.y The y component corresponds to tilt.
     * @param {float=} translation.z A zoom position.
     * @param {object=} speed Speed vector specifying the velocity of pan, tilt and zoom.
     * @param {float=} speed.x The x component corresponds to pan.  If omitted in a request, the current (if any) PanTilt movement should not be affected.
     * @param {float=} speed.y The y component corresponds to tilt.  If omitted in a request, the current (if any) PanTilt movement should not be affected
     * @param {float=} speed.z A zoom speed. If omitted in a request, the current (if any) Zoom movement should not be affected.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    relativeMove(profileToken?: string | undefined, translation: {
        x?: float | undefined;
        y?: float | undefined;
        z?: float | undefined;
    }, speed?: object | undefined, callback?: any): any;
    /**
     * A PTZ-capable device shall support continuous movements. The velocity argument of this
     * command specifies a signed speed value for the Pan, Tilt and Zoom. The combined Pan/Tilt
     * element is optional and the Zoom element itself is optional. If the Pan/Tilt element is omitted,
     * the current Pan/Tilt movement shall NOT be affected by this command. The same holds for the
     * Zoom element. The spaces referenced within the velocity element shall be velocity spaces
     * supported by the PTZ Node. If the space information is omitted for the velocity argument, the
     * corresponding default spaces of the PTZ configuration belonging to the specified Media Profile
     * is used. A device MAY support continuous Pan/Tilt movements and/or continuous Zoom
     * movements by providing only velocity spaces for the supported cases.<br>
     * An existing timeout argument overrides the DefaultPTZTimeout parameter of the corresponding
     * PTZ configuration for this Move operation. The timeout parameter specifies how long the PTZ
     * node continues to move.<br>
     * A device shall stop movement in a particular axis (Pan, Tilt, or Zoom) when zero is sent as the
     * ContinuousMove parameter for that axis. Stopping shall have the same effect independent of
     * the velocity space referenced. This command has the same effect on a continuous move as the
     * stop command specified in section 5.3.5.<br>
     * If the requested velocity leads to absolute positions which cannot be reached, the PTZ node
     * shall move to a reachable position along the border of its range. A typical application of the
     * continuous move operation is controlling PTZ via joystick.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {object} velocity One of PanTilt (x,y) or Zoom (z), or both, is required.
     * @param {float=} velocity.x Pan speed.
     * @param {float=} velocity.y Tilt spped.
     * @param {float=} velocity.z Zoom speed.
     * @param {integer=} timeout Duration: An optional Timeout parameter.
     * @param {callback=} callback Optional callback, instead of a Promise.
     * @example
     * const OnvifManager = require('onvif-nvt')
     * OnvifManager.connect('10.10.1.60', 80, 'username', 'password')
     *   .then(results => {
     *     let camera = results
     *     if (camera.ptz) { // PTZ is supported on this device
     *       let velocity = { x: 1, y: 0 }
     *       camera.ptz.continuousMove(null, velocity)
     *         .then(() => {
     *           setTimeout(() => {
     *             camera.ptz.stop()
     *           }, 5000) // stop the camera after 5 seconds
     *         })
     *     }
     *   })
     */
    continuousMove(profileToken?: string | undefined, velocity: {
        x?: float | undefined;
        y?: float | undefined;
        z?: float | undefined;
    }, timeout?: integer, callback?: any): any;
    /**
     * <strong>+++ This function is untested as I do not have any cameras that support this feature.</strong><br>
     * A device signaling GeoMove in one of its PTZ nodes shall support this command.
     * The optional AreaHeight and AreaWidth parameters can be added to the request, so that the
     * PTZ-capable device can internally determine the zoom factor. In case both AreaHeight and
     * AreaWidth are not provided, the unit will not change the zoom. AreaHeight and AreaWidth are
     * expressed in meters.<br>
     * An existing speed argument overrides the DefaultSpeed of the corresponding PTZ configuration
     * during movement by the requested translation. If spaces are referenced within the speed
     * argument, they shall be speed spaces supported by the PTZ node.<br>
     * If the PTZ-capable device does not support automatic retrieval of the geolocation, it shall be
     * configured by using SetGeoLocation before it can perform geo-referenced commands. In case
     * the client requests a GeoMove command before the geolocation of the device is configured,
     * the device shall return an error.<br>
     * Depending on the kinematics of the PTZ-capable device, the requested position may not be
     * reachable. In this situation the device shall return an error, signalling that it cannot perform the
     * requested action due to physical limitations.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {object} geoLocation Target coordinates.
     * @param {float} geoLocation.lon East west location as angle.
     * @param {float} geoLocation.lat North south location as angle.
     * @param {float} geoLocation.elevation Height in meters above sea level.
     * @param {object=} speed Speed vector specifying the velocity of pan, tilt and zoom.
     * @param {float=} speed.x The x component corresponds to pan.  If omitted in a request, the current (if any) PanTilt movement should not be affected.
     * @param {float=} speed.y The y component corresponds to tilt.  If omitted in a request, the current (if any) PanTilt movement should not be affected
     * @param {float=} speed.z A zoom speed. If omitted in a request, the current (if any) Zoom movement should not be affected.
     * @param {float=} areaWidth Optional area to be shown.
     * @param {float=} areaHeight Optional area to be shown.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    geoMove(profileToken?: string | undefined, geoLocation: {
        lon: float;
        lat: float;
        elevation: float;
    }, speed?: object | undefined, areaWidth?: float, areaHeight?: float, callback?: any): any;
    /**
     * A PTZ-capable device shall support the stop operation. If no stop filter arguments are present,
     * this command stops all ongoing pan, tilt and zoom movements. The stop operation can be
     * filtered to stop a specific movement by setting the corresponding stop argument.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {boolean=} panTilt Defaults to true..........
     * @param {boolean=} zoom Defaults to true
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    stop(profileToken?: string | undefined, panTilt?: boolean | undefined, zoom?: boolean | undefined, callback?: any): any;
    /**
     * A PTZ-capable device shall be able to report its PTZ status through the GetStatus command.
     * The PTZ status contains the following information:
     * <ul>
     * <li>Position (optional) – Specifies the absolute position of the PTZ unit together with the
     * space references. The default absolute spaces of the corresponding PTZ configuration
     * shall be referenced within the position element. This information shall be present if the
     * device signals support via the capability StatusPosition.</li>
     * <li>MoveStatus (optional) – Indicates if the Pan/Tilt/Zoom device unit is currently moving, idle
     * or in an unknown state. This information shall be present if the device signals support
     * via the capability MoveStatus. The state Unknown shall not be used during normal
     * operation, but is reserved to initialization or error conditions.</li>
     * <li>Error (optional) – States a current PTZ error condition. This field shall be present if the
     * MoveStatus signals Unknown.</li>
     * <li>UTC Time – Specifies the UTC time when this status was generated.</li>
     * </ul>.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getStatus(profileToken?: string | undefined, callback?: any): any;
    /**
     * The SetPreset command saves the current device position parameters so that the device can
     * move to the saved preset position through the GotoPreset operation.<br>
     * If the PresetToken parameter is absent, the device shall create a new preset. Otherwise it shall
     * update the stored position and optionally the name of the given preset. If creation is successful,
     * the response contains the PresetToken which uniquely identifies the preset. An existing preset
     * can be overwritten by specifying the PresetToken of the corresponding preset. In both cases
     * (overwriting or creation) an optional PresetName can be specified. The operation fails if the PTZ
     * device is moving during the SetPreset operation.<br>
     * The device MAY internally save additional states such as imaging properties in the PTZ preset
     * which then should be recalled in the GotoPreset operation. A device shall accept a valid
     * SetPresetRequest that does not include the optional element PresetName.
     * Devices may require unique preset names and reject a request that contains an already existing
     * PresetName by responding with the error message ter:PresetExist.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {string=} presetToken Optional existing preset token to update a preset position.
     * @param {string=} presetName Optional name to be assigned to the preset position.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    setPreset(profileToken?: string | undefined, presetToken?: string | undefined, presetName?: string | undefined, callback?: any): any;
    /**
     * The GetPresets operation returns the saved presets consisting of the following elements:
     * <ul>
     * <li>Token – A unique identifier to reference the preset.</li>
     * <li>Name – An optional mnemonic name.</li>
     * <li>PTZ Position – An optional absolute position. If the PTZ node supports absolute
     * Pan/Tilt position spaces, the Pan/Tilt position shall be specified. If the PTZ node
     * supports absolute zoom position spaces, the zoom position shall be specified.</li>
     * </ul>.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getPresets(profileToken?: string | undefined, callback?: any): any;
    /**
     * The GotoPreset operation recalls a previously set preset. If the speed parameter is omitted, the
     * default speed of the corresponding PTZ configuration shall be used. The speed parameter can
     * only be specified when speed spaces are available for the PTZ node. The GotoPreset command
     * is a non-blocking operation and can be interrupted by other move commands.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {string} presetToken Reference to an existing preset token.
     * @param {object=} speed Speed vector specifying the velocity of pan, tilt and zoom.
     * @param {float=} speed.x The x component corresponds to pan.  If omitted in a request, the current (if any) PanTilt movement should not be affected.
     * @param {float=} speed.y The y component corresponds to tilt.  If omitted in a request, the current (if any) PanTilt movement should not be affected
     * @param {float=} speed.z A zoom speed. If omitted in a request, the current (if any) Zoom movement should not be affected.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    gotoPreset(profileToken?: string | undefined, presetToken: string, speed?: object | undefined, callback?: any): any;
    /**
     * The RemovePreset operation removes a previously set preset.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {string} presetToken Existing preset token to be removed.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    removePreset(profileToken?: string | undefined, presetToken: string, callback?: any): any;
    /**
     * This operation moves the PTZ unit to its home position. If the speed parameter is omitted, the
     * default speed of the corresponding PTZ configuration shall be used. The speed parameter can
     * only be specified when speed spaces are available for the PTZ node.The command is nonblocking
     * and can be interrupted by other move commands.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {object=} speed Speed vector specifying the velocity of pan, tilt and zoom.
     * @param {float=} speed.x The x component corresponds to pan.  If omitted in a request, the current (if any) PanTilt movement should not be affected.
     * @param {float=} speed.y The y component corresponds to tilt.  If omitted in a request, the current (if any) PanTilt movement should not be affected
     * @param {float=} speed.z A zoom speed. If omitted in a request, the current (if any) Zoom movement should not be affected.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    gotoHomePosition(profileToken?: string | undefined, speed?: object | undefined, callback?: any): any;
    /**
     * The SetHome operation saves the current position parameters as the home position, so that the
     * GotoHome operation can request that the device move to the home position.<br>
     * The SetHomePosition command shall return with a failure if the “home” position is fixed and
     * cannot be overwritten. If the SetHomePosition is successful, it shall be possible to recall the
     * home position with the GotoHomePosition command.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    setHomePosition(profileToken?: string | undefined, callback?: any): any;
    /**
     * This operation is used to call an auxiliary operation on the device. The supported commands
     * can be retrieved via the PTZ node properties. The AuxiliaryCommand should match the
     * supported command listed in the PTZ node; no other syntax is supported. If the PTZ node lists
     * the tt:IRLamp command, then the parameter of AuxiliaryCommand command shall conform to
     * the syntax specified in Section 8.6 Auxiliary operation of ONVIF Core Specification. The
     * SendAuxiliaryCommand shall be implemented when the PTZ node supports auxiliary commands.
     * @param {string=} profileToken If no profileToken is provided, then the defaultProfileToken will be used.
     * @param {string} auxiliaryData Auxiliary command to be applied.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    sendAuxiliaryCommand(profileToken?: string | undefined, auxiliaryData: string, callback?: any): any;
}
import Soap = require("../utils/soap");
