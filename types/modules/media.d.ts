export = Media;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/media/ONVIF-Media-Service-Spec-v1706.pdf}<br>
 * {@link https://www.onvif.org/ver10/media/wsdl/media.wsdl}<br>
 * </p>
 * <h3>Functions</h3>
 * {@link Media#createProfile},
 * {@link Media#getProfiles},
 * {@link Media#getProfile},
 * {@link Media#addVideoSourceConfiguration},
 * {@link Media#addVideoEncoderConfiguration},
 * {@link Media#addAudioSourceConfiguration},
 * {@link Media#addAudioEncoderConfiguration},
 * {@link Media#addPTZConfiguration},
 * {@link Media#addVideoAnalyticsConfiguration},
 * {@link Media#addMetadataConfiguration},
 * {@link Media#addAudioOutputConfiguration},
 * {@link Media#addAudioDecoderConfiguration},
 * {@link Media#removeVideoSourceConfiguration},
 * {@link Media#removeVideoEncoderConfiguration},
 * {@link Media#removeAudioSourceConfiguration},
 * {@link Media#removeAudioEncoderConfiguration},
 * {@link Media#removePTZConfiguration},
 * {@link Media#removeVideoAnalyticsConfiguration},
 * {@link Media#removeMetadataConfiguration},
 * {@link Media#removeAudioOutputConfiguration},
 * {@link Media#removeAudioDecoderConfiguration},
 * {@link Media#deleteProfile},
 * {@link Media#getVideoSources},
 * {@link Media#getVideoSourceConfigurations},
 * {@link Media#getVideoSourceConfiguration},
 * {@link Media#getCompatibleVideoSourceConfigurations},
 * {@link Media#getVideoSourceConfigurationOptions},
 * setVideoSourceConfiguration,
 * {@link Media#getVideoEncoderConfigurations},
 * {@link Media#getVideoEncoderConfiguration},
 * {@link Media#getCompatibleVideoEncoderConfigurations},
 * {@link Media#getVideoEncoderConfigurationOptions},
 * setVideoEncoderConfiguration,
 * {@link Media#getGuaranteedNumberOfVideoEncoderInstances},
 * {@link Media#getAudioSources},
 * {@link Media#getAudioSourceConfigurations},
 * {@link Media#getAudioSourceConfiguration},
 * {@link Media#getCompatibleAudioSourceConfigurations},
 * {@link Media#getAudioSourceConfigurationOptions},
 * setAudioSourceConfiguration,
 * {@link Media#getAudioEncoderConfigurations},
 * {@link Media#getAudioEncoderConfiguration},
 * {@link Media#getCompatibleAudioEncoderConfigurations},
 * {@link Media#getAudioEncoderConfigurationOptions},
 * setAudioEncoderConfiguration,
 * {@link Media#getVideoAnalyticsConfigurations},
 * {@link Media#getVideoAnalyticsConfiguration},
 * {@link Media#getCompatibleVideoAnalyticsConfigurations},
 * setVideoAnalyticsConfiguration,
 * {@link Media#getMetadataConfigurations},
 * {@link Media#getMetadataConfiguration},
 * {@link Media#getCompatibleMetadataConfigurations},
 * {@link Media#getMetadataConfigurationOptions},
 * setMetadataConfiguration,
 * {@link Media#getAudioOutputs},
 * {@link Media#getAudioOutputConfigurations},
 * {@link Media#getAudioOutputConfiguration},
 * {@link Media#getCompatibleAudioOutputConfigurations},
 * {@link Media#getAudioOutputConfigurationOptions},
 * setAudioOutputConfiguration,
 * {@link Media#getAudioDecoderConfigurations},
 * {@link Media#getAudioDecoderConfiguration},
 * {@link Media#getCompatibleAudioDecoderConfigurations},
 * {@link Media#getAudioDecoderConfigurationOptions},
 * setAudioDecoderConfiguration,
 * {@link Media#getStreamUri},
 * {@link Media#getSnapshotUri},
 * {@link Media#startMulticastStreaming},
 * {@link Media#stopMulticastStreaming},
 * {@link Media#setSynchronizationPoint},
 * {@link Media#getVideoSourceModes},
 * setVideoSourceMode,
 * createOSD,
 * {@link Media#deleteOSD},
 * {@link Media#getOSDs},
 * {@link Media#getOSD},
 * setOSD,
 * {@link Media#getOSDOptions}
 * <br><br>
 * <h3>Overview</h3>
 */
declare class Media {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Media object.
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
    buildRequest(methodName: any, xml: any, callback: any): any;
    requestWithProfileToken(methodName: any, profileToken: any, callback: any): any;
    requestWithConfigurationToken(methodName: any, configurationToken: any, callback: any): any;
    requestWithOptionalTokens(methodName: any, profileToken: any, configurationToken: any, callback: any): any;
    addConfiguration(methodName: any, profileToken: any, configurationToken: any, callback: any): any;
    /**
     * This operation creates a new empty media profile. The media profile shall be created in the device and shall be persistent (remain after reboot). A created profile shall be deletable and a device shall set the “fixed” attribute to false in the returned Profile.
     * @param {string} name friendly name of the profile to be created.
     * @param {string=} token Optional token, specifying the unique identifier of the new profile.<br>
     * A device supports at least a token length of 12 characters and characters "A-Z" | "a-z" | "0-9" | "-.".
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    createProfile(name: string, token?: string | undefined, callback?: any): any;
    /**
     * Any endpoint can ask for the existing media profiles of a device using the GetProfiles
     * command. Pre-configured or dynamically configured profiles can be retrieved using this
     * command. This command lists all configured profiles in a device. The client does not need to
     * know the media profile in order to use the command. The device shall support the retrieval of
     * media profiles through the GetProfiles command.<br>
     * A device shall include the “fixed” attribute in all the returned Profile elements.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getProfiles(callback?: any): any;
    /**
     * If the profile token is already known, a profile can be fetched through the GetProfile command.
     * The device shall support the retrieval of a specific media profile through the GetProfile
     * command.<br>
     * A device shall include the “fixed” attribute in the returned Profile element.
     * @param {string} profileToken this command requests a specific profile
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getProfile(profileToken: string, callback?: any): any;
    /**
     * This operation adds a VideoSourceConfiguration to an existing media profile. If such a
     * configuration exists in the media profile, it will be replaced. The change shall be persistent.<br>
     * The device shall support addition of a video source configuration to a profile through the
     * AddVideoSourceConfiguration command.
     * @param {string} profileToken Reference to the profile where the configuration should be added
     * @param {string} configurationToken Contains a reference to the VideoSourceConfiguration to add
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    addVideoSourceConfiguration(profileToken: string, configurationToken: string, callback?: any): any;
    /**
     * This operation adds a VideoEncoderConfiguration to an existing media profile. If a configuration exists in the media profile, it will be replaced. The change shall be persistent. A device shall support adding a compatible VideoEncoderConfiguration to a Profile containing a VideoSourceConfiguration and shall support streaming video data of such a profile.
     * @param {string} profileToken Reference to the profile where the configuration should be added
     * @param {string} configurationToken Contains a reference to the VideoEncoderConfiguration to add
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    addVideoEncoderConfiguration(profileToken: string, configurationToken: string, callback?: any): any;
    /**
     * This operation adds an AudioSourceConfiguration to an existing media profile. If a configuration exists in the media profile, it will be replaced. The change shall be persistent.
     * @param {string} profileToken Reference to the profile where the configuration should be added
     * @param {string} configurationToken Contains a reference to the AudioSourceConfiguration to add
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    addAudioSourceConfiguration(profileToken: string, configurationToken: string, callback?: any): any;
    /**
     * This operation adds an AudioEncoderConfiguration to an existing media profile. If a configuration exists in the media profile, it will be replaced. The change shall be persistent. A device shall support adding a compatible AudioEncoderConfiguration to a profile containing an AudioSourceConfiguration and shall support streaming audio data of such a profile.
     * @param {string} profileToken Reference to the profile where the configuration should be added.
     * @param {string} configurationToken Contains a reference to the AudioEncoderConfiguration to add.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    addAudioEncoderConfiguration(profileToken: string, configurationToken: string, callback?: any): any;
    /**
     * This operation adds a PTZConfiguration to an existing media profile. If a configuration exists in the media profile, it will be replaced. The change shall be persistent. Adding a PTZConfiguration to a media profile means that streams using that media profile can contain PTZ status (in the metadata), and that the media profile can be used for controlling PTZ movement.
     * @param {string} profileToken Reference to the profile where the configuration should be added.
     * @param {string} configurationToken Contains a reference to the PTZConfiguration to add.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    addPTZConfiguration(profileToken: string, configurationToken: string, callback?: any): any;
    /**
     * This operation adds a VideoAnalytics configuration to an existing media profile. If a configuration exists in the media profile, it will be replaced. The change shall be persistent. Adding a VideoAnalyticsConfiguration to a media profile means that streams using that media profile can contain video analytics data (in the metadata) as defined by the submitted configuration reference. A profile containing only a video analytics configuration but no video source configuration is incomplete. Therefore, a client should first add a video source configuration to a profile before adding a video analytics configuration. The device can deny adding of a video analytics configuration before a video source configuration.
     * @param {string} profileToken Reference to the profile where the configuration should be added.
     * @param {string} configurationToken Contains a reference to the VideoAnalyticsConfiguration to add.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    addVideoAnalyticsConfiguration(profileToken: string, configurationToken: string, callback?: any): any;
    /**
     * This operation adds a Metadata configuration to an existing media profile. If a configuration exists in the media profile, it will be replaced. The change shall be persistent. Adding a MetadataConfiguration to a Profile means that streams using that profile contain metadata. Metadata can consist of events, PTZ status, and/or video analytics data.
     * @param {string} profileToken Reference to the profile where the configuration should be added.
     * @param {string} configurationToken Contains a reference to the MetadataConfiguration to add.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    addMetadataConfiguration(profileToken: string, configurationToken: string, callback?: any): any;
    /**
     * This operation adds an AudioOutputConfiguration to an existing media profile. If a configuration exists in the media profile, it will be replaced. The change shall be persistent.
     * @param {string} profileToken Reference to the profile where the configuration should be added.
     * @param {string} configurationToken Contains a reference to the AudioOutputConfiguration to add.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    addAudioOutputConfiguration(profileToken: string, configurationToken: string, callback?: any): any;
    /**
     * This operation adds an AudioDecoderConfiguration to an existing media profile. If a configuration exists in the media profile, it shall be replaced. The change shall be persistent.
     * @param {string} profileToken Reference to the profile where the configuration should be added.
     * @param {string} configurationToken This element contains a reference to the AudioDecoderConfiguration to add.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    addAudioDecoderConfiguration(profileToken: string, configurationToken: string, callback?: any): any;
    /**
     * This operation removes a VideoSourceConfiguration from an existing media profile. If the media profile does not contain a VideoSourceConfiguration, the operation has no effect. The removal shall be persistent. Video source configurations should only be removed after removing a VideoEncoderConfiguration from the media profile.
     * @param {string} profileToken Contains a reference to the media profile from which the VideoSourceConfiguration shall be removed.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    removeVideoSourceConfiguration(profileToken: string, callback?: any): any;
    /**
     * This operation removes a VideoSourceConfiguration from an existing media profile. If the media profile does not contain a VideoSourceConfiguration, the operation has no effect. The removal shall be persistent. Video source configurations should only be removed after removing a VideoEncoderConfiguration from the media profile.
     * @param {string} profileToken Contains a reference to the media profile from which the VideoEncoderConfiguration shall be removed.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    removeVideoEncoderConfiguration(profileToken: string, callback?: any): any;
    /**
     * This operation removes an AudioSourceConfiguration from an existing media profile. If the media profile does not contain an AudioSourceConfiguration, the operation has no effect. The removal shall be persistent. Audio source configurations should only be removed after removing an AudioEncoderConfiguration from the media profile.
     * @param {string} profileToken Contains a reference to the media profile from which the AudioSourceConfiguration shall be removed.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    removeAudioSourceConfiguration(profileToken: string, callback?: any): any;
    /**
     * This operation removes an AudioSourceConfiguration from an existing media profile. If the media profile does not contain an AudioSourceConfiguration, the operation has no effect. The removal shall be persistent. Audio source configurations should only be removed after removing an AudioEncoderConfiguration from the media profile.
     * @param {string} profileToken Contains a reference to the media profile from which the AudioSourceConfiguration shall be removed.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    removeAudioEncoderConfiguration(profileToken: string, callback?: any): any;
    /**
     * This operation removes a PTZConfiguration from an existing media profile. If the media profile does not contain a PTZConfiguration, the operation has no effect. The removal shall be persistent.
     * @param {string} profileToken Contains a reference to the media profile from which the PTZConfiguration shall be removed.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    removePTZConfiguration(profileToken: string, callback?: any): any;
    /**
     * This operation removes a VideoAnalyticsConfiguration from an existing media profile. If the media profile does not contain a VideoAnalyticsConfiguration, the operation has no effect. The removal shall be persistent.
     * @param {string} profileToken Contains a reference to the media profile from which the VideoAnalyticsConfiguration shall be removed.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    removeVideoAnalyticsConfiguration(profileToken: string, callback?: any): any;
    /**
     * This operation removes a MetadataConfiguration from an existing media profile. If the media profile does not contain a MetadataConfiguration, the operation has no effect. The removal shall be persistent.
     * @param {string} profileToken Contains a reference to the media profile from which the MetadataConfiguration shall be removed.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    removeMetadataConfiguration(profileToken: string, callback?: any): any;
    /**
     * This operation removes an AudioOutputConfiguration from an existing media profile. If the media profile does not contain an AudioOutputConfiguration, the operation has no effect. The removal shall be persistent.
     * @param {string} profileToken Contains a reference to the media profile from which the AudioOutputConfiguration shall be removed.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    removeAudioOutputConfiguration(profileToken: string, callback?: any): any;
    /**
     * This operation removes an AudioDecoderConfiguration from an existing media profile. If the media profile does not contain an AudioDecoderConfiguration, the operation has no effect. The removal shall be persistent.
     * @param {string} profileToken Contains a reference to the media profile from which the AudioDecoderConfiguration shall be removed.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    removeAudioDecoderConfiguration(profileToken: string, callback?: any): any;
    /**
     * This operation deletes a profile. This change shall always be persistent. Deletion of a profile is only possible for non-fixed profiles
     * @param {string} profileToken Contains a reference to the profile that should be deleted.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    deleteProfile(profileToken: string, callback?: any): any;
    /**
     * This command lists all available physical video inputs of the device.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getVideoSources(callback?: any): any;
    /**
     * This operation lists all existing video source configurations for a device. The client need not know anything about the video source configurations in order to use the command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getVideoSourceConfigurations(callback?: any): any;
    /**
     * If the video source configuration token is already known, the video source configuration can be fetched through the GetVideoSourceConfiguration command.
     * @param {string} configurationToken Token of the requested video source configuration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getVideoSourceConfiguration(configurationToken: string, callback?: any): any;
    /**
     * This operation requests all the video source configurations of the device that are compatible with a certain media profile. Each of the returned configurations shall be a valid input parameter for the AddVideoSourceConfiguration command on the media profile. The result will vary depending on the capabilities, configurations and settings in the device.
     * @param {string} profileToken Contains the token of an existing media profile the configurations shall be compatible with.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCompatibleVideoSourceConfigurations(profileToken: string, callback?: any): any;
    /**
     * This operation returns the available options (supported values and ranges for video source configuration parameters) when the video source parameters are reconfigured If a video source configuration is specified, the options shall concern that particular configuration. If a media profile is specified, the options shall be compatible with that media profile.
     * @param {string=} profileToken Optional ProfileToken that specifies an existing media profile that the options shall be compatible with.
     * @param {string=} configurationToken Optional video source configurationToken that specifies an existing configuration that the options are intended for.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getVideoSourceConfigurationOptions(profileToken?: string | undefined, configurationToken?: string | undefined, callback?: any): any;
    setVideoSourceConfiguration(): any;
    /**
     * This operation lists all existing video encoder configurations of a device. This command lists all configured video encoder configurations in a device. The client need not know anything apriori about the video encoder configurations in order to use the command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getVideoEncoderConfigurations(callback?: any): any;
    /**
     * If the video encoder configuration token is already known, the encoder configuration can be fetched through the GetVideoEncoderConfiguration command.
     * @param {string} configurationToken Token of the requested video encoder configuration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getVideoEncoderConfiguration(configurationToken: string, callback?: any): any;
    /**
     * This operation lists all the video encoder configurations of the device that are compatible with a certain media profile. Each of the returned configurations shall be a valid input parameter for the AddVideoEncoderConfiguration command on the media profile. The result will vary depending on the capabilities, configurations and settings in the device.
     * @param {string} profileToken Contains the token of an existing media profile the configurations shall be compatible with.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCompatibleVideoEncoderConfigurations(profileToken: string, callback?: any): any;
    /**
     * This operation returns the available options (supported values and ranges for video encoder configuration parameters) when the video encoder parameters are reconfigured.<br>
     * For JPEG, MPEG4 and H264 extension elements have been defined that provide additional information. A device must provide the XxxOption information for all encodings supported and should additionally provide the corresponding XxxOption2 information.<br>
     * This response contains the available video encoder configuration options. If a video encoder configuration is specified, the options shall concern that particular configuration. If a media profile is specified, the options shall be compatible with that media profile. If no tokens are specified, the options shall be considered generic for the device.
     * @param {string=} profileToken Optional ProfileToken that specifies an existing media profile that the options shall be compatible with.
     * @param {string=} configurationToken Optional video encoder configuration token that specifies an existing configuration that the options are intended for.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getVideoEncoderConfigurationOptions(profileToken?: string | undefined, configurationToken?: string | undefined, callback?: any): any;
    setVideoEncoderConfiguration(): any;
    /**
     * The GetGuaranteedNumberOfVideoEncoderInstances command can be used to request the minimum number of guaranteed video encoder instances (applications) per Video Source Configuration.
     * @param {string} configurationToken Token of the video source configuration
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getGuaranteedNumberOfVideoEncoderInstances(configurationToken: string, callback?: any): any;
    /**
     * This command lists all available physical audio inputs of the device.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioSources(callback?: any): any;
    /**
     * This operation lists all existing audio source configurations of a device. This command lists all audio source configurations in a device. The client need not know anything apriori about the audio source configurations in order to use the command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioSourceConfigurations(callback?: any): any;
    /**
     * The GetAudioSourceConfiguration command fetches the audio source configurations if the audio source configuration token is already known.
     * @param {string} configurationToken Token of the requested audio source configuration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioSourceConfiguration(configurationToken: string, callback?: any): any;
    /**
     * This operation requests all audio source configurations of the device that are compatible with a certain media profile. Each of the returned configurations shall be a valid input parameter for the AddAudioEncoderConfiguration command on the media profile. The result varies depending on the capabilities, configurations and settings in the device.
     * @param {string} profileToken Contains the token of an existing media profile the configurations shall be compatible with.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCompatibleAudioSourceConfigurations(profileToken: string, callback?: any): any;
    /**
     * This operation returns the available options (supported values and ranges for audio source configuration parameters) when the audio source parameters are reconfigured. If an audio source configuration is specified, the options shall concern that particular configuration. If a media profile is specified, the options shall be compatible with that media profile.
     * @param {string=} profileToken Optional ProfileToken that specifies an existing media profile that the options shall be compatible with.
     * @param {string=} configurationToken Optional audio source configuration token that specifies an existing configuration that the options are intended for.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioSourceConfigurationOptions(profileToken?: string | undefined, configurationToken?: string | undefined, callback?: any): any;
    setAudioSourceConfiguration(): any;
    /**
     * This operation lists all existing device audio encoder configurations. The client need not know anything apriori about the audio encoder configurations in order to use the command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioEncoderConfigurations(callback?: any): any;
    /**
     * The GetAudioEncoderConfiguration command fetches the encoder configuration if the audio encoder configuration token is known.
     * @param {string} configurationToken Token of the requested audio encoder configuration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioEncoderConfiguration(configurationToken: string, callback?: any): any;
    /**
     * This operation requests all audio encoder configurations of a device that are compatible with a certain media profile. Each of the returned configurations shall be a valid input parameter for the AddAudioSourceConfiguration command on the media profile. The result varies depending on the capabilities, configurations and settings in the device.
     * @param {string} profileToken Contains the token of an existing media profile the configurations shall be compatible with.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCompatibleAudioEncoderConfigurations(profileToken: string, callback?: any): any;
    /**
     * This operation returns the available options (supported values and ranges for audio encoder configuration parameters) when the audio encoder parameters are reconfigured.
     * @param {string=} profileToken Optional ProfileToken that specifies an existing media profile that the options shall be compatible with.
     * @param {string=} configurationToken Optional audio encoder configuration token that specifies an existing configuration that the options are intended for.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioEncoderConfigurationOptions(profileToken?: string | undefined, configurationToken?: string | undefined, callback?: any): any;
    setAudioEncoderConfiguration(): any;
    /**
     * This operation lists all video analytics configurations of a device. This command lists all configured video analytics in a device. The client need not know anything apriori about the video analytics in order to use the command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getVideoAnalyticsConfigurations(callback?: any): any;
    /**
     * The GetVideoAnalyticsConfiguration command fetches the video analytics configuration if the video analytics token is known.
     * @param {*} configurationToken Token of the requested video analytics configuration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getVideoAnalyticsConfiguration(configurationToken: any, callback?: any): any;
    /**
     * This operation requests all video analytic configurations of the device that are compatible with a certain media profile. Each of the returned configurations shall be a valid input parameter for the AddVideoAnalyticsConfiguration command on the media profile. The result varies depending on the capabilities, configurations and settings in the device.
     * @param {string} profileToken Contains the token of an existing media profile the configurations shall be compatible with.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCompatibleVideoAnalyticsConfigurations(profileToken: string, callback?: any): any;
    setVideoAnalyticsConfiguration(): any;
    /**
     * This operation lists all existing metadata configurations. The client need not know anything apriori about the metadata in order to use the command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getMetadataConfigurations(callback?: any): any;
    /**
     * The GetMetadataConfiguration command fetches the metadata configuration if the metadata token is known.
     * @param {string} configurationToken Token of the requested metadata configuration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getMetadataConfiguration(configurationToken: string, callback?: any): any;
    /**
     * This operation requests all the metadata configurations of the device that are compatible with a certain media profile. Each of the returned configurations shall be a valid input parameter for the AddMetadataConfiguration command on the media profile. The result varies depending on the capabilities, configurations and settings in the device.
     * @param {string} profileToken Contains the token of an existing media profile the configurations shall be compatible with.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCompatibleMetadataConfigurations(profileToken: string, callback?: any): any;
    /**
     * This operation returns the available options (supported values and ranges for metadata configuration parameters) for changing the metadata configuration.
     * @param {string=} profileToken Optional ProfileToken that specifies an existing media profile that the options shall be compatible with.
     * @param {string=} configurationToken Optional metadata configuration token that specifies an existing configuration that the options are intended for.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getMetadataConfigurationOptions(profileToken?: string | undefined, configurationToken?: string | undefined, callback?: any): any;
    setMetadataConfiguration(): any;
    /**
     * This operation lists all existing metadata configurations. The client need not know anything apriori about the metadata in order to use the command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioOutputs(callback?: any): any;
    /**
     * This command lists all existing AudioOutputConfigurations of a device. The NVC need not know anything apriori about the audio configurations to use this command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioOutputConfigurations(callback?: any): any;
    /**
     * If the audio output configuration token is already known, the output configuration can be fetched through the GetAudioOutputConfiguration command.
     * @param {string} configurationToken Token of the requested audio output configuration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioOutputConfiguration(configurationToken: string, callback?: any): any;
    /**
     * This command lists all audio output configurations of a device that are compatible with a certain media profile. Each returned configuration shall be a valid input for the AddAudioOutputConfiguration command.
     * @param {string} profileToken Contains the token of an existing media profile the configurations shall be compatible with.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCompatibleAudioOutputConfigurations(profileToken: string, callback?: any): any;
    /**
     * This operation returns the available options (supported values and ranges for audio output configuration parameters) for configuring an audio output.
     * @param {string=} profileToken Optional ProfileToken that specifies an existing media profile that the options shall be compatible with.
     * @param {string=} configurationToken Optional audio output configuration token that specifies an existing configuration that the options are intended for.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioOutputConfigurationOptions(profileToken?: string | undefined, configurationToken?: string | undefined, callback?: any): any;
    setAudioOutputConfiguration(): any;
    /**
     * This command lists all existing AudioDecoderConfigurations of a device. The NVC need not know anything apriori about the audio decoder configurations in order to use this command.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioDecoderConfigurations(callback?: any): any;
    /**
     * If the audio decoder configuration token is already known, the decoder configuration can be fetched through the GetAudioDecoderConfiguration command.
     * @param {string} configurationToken Token of the requested audio decoder configuration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioDecoderConfiguration(configurationToken: string, callback?: any): any;
    /**
     * This operation lists all the audio decoder configurations of the device that are compatible with a certain media profile. Each of the returned configurations shall be a valid input parameter for the AddAudioDecoderConfiguration command on the media profile.
     * @param {string} profileToken Contains the token of an existing media profile the configurations shall be compatible with.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getCompatibleAudioDecoderConfigurations(profileToken: string, callback?: any): any;
    /**
     * This command list the audio decoding capabilities for a given profile and configuration of a device.
     * @param {string=} profileToken Optional ProfileToken that specifies an existing media profile that the options shall be compatible with.
     * @param {string=} configurationToken Optional audio decoder configuration token that specifies an existing configuration that the options are intended for.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getAudioDecoderConfigurationOptions(profileToken?: string | undefined, configurationToken?: string | undefined, callback?: any): any;
    setAudioDecoderConfiguration(): any;
    /**
     * This operation requests a URI that can be used to initiate a live media stream using RTSP as the control protocol. The returned URI shall remain valid indefinitely even if the profile is changed. The ValidUntilConnect, ValidUntilReboot and Timeout Parameter shall be set accordingly (ValidUntilConnect=false, ValidUntilReboot=false, timeout=PT0S).<br>
     * The correct syntax for the StreamSetup element for these media stream setups defined in 5.1.1 of the streaming specification are as follows:<br>
     * <ul>
     * <li>RTP unicast over UDP: StreamType = "RTP_unicast", TransportProtocol = "UDP"</li>
     * <li>RTP over RTSP over HTTP over TCP: StreamType = "RTP_unicast", TransportProtocol = "HTTP"</li>
     * <li>RTP over RTSP over TCP: StreamType = "RTP_unicast", TransportProtocol = "RTSP"</li>
     * </ul>
     * If a multicast stream is requested the VideoEncoderConfiguration, AudioEncoderConfiguration and MetadataConfiguration element inside the corresponding media profile must be configured with valid multicast settings.<br>
     * For full compatibility with other ONVIF services a device should not generate Uris longer than 128 octets.
     * @param {RTP-Unicast|RTP-Multicast} streamType Defines if a multicast or unicast stream is requested.
     * @param {UDP|HTTP|RTSP} protocolType The transport protocol to use.
     * @param {string} profileToken The ProfileToken element indicates the media profile to use and will define the configuration of the content of the stream.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getStreamUri(streamType: any, protocolType: UDP | HTTP | RTSP, profileToken: string, callback?: any): any;
    /**
     * A client uses the GetSnapshotUri command to obtain a JPEG snapshot from the device. The returned URI shall remain valid indefinitely even if the profile is changed. The ValidUntilConnect, ValidUntilReboot and Timeout Parameter shall be set accordingly (ValidUntilConnect=false, ValidUntilReboot=false, timeout=PT0S). The URI can be used for acquiring a JPEG image through a HTTP GET operation. The image encoding will always be JPEG regardless of the encoding setting in the media profile. The Jpeg settings (like resolution or quality) may be taken from the profile if suitable. The provided image will be updated automatically and independent from calls to GetSnapshotUri.
     * @param {string} profileToken The ProfileToken element indicates the media profile to use and will define the source and dimensions of the snapshot.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getSnapshotUri(profileToken: string, callback?: any): any;
    /**
     * This command starts multicast streaming using a specified media profile of a device. Streaming continues until StopMulticastStreaming is called for the same Profile. The streaming shall continue after a reboot of the device until a StopMulticastStreaming request is received. The multicast address, port and TTL are configured in the VideoEncoderConfiguration, AudioEncoderConfiguration and MetadataConfiguration respectively.
     * @param {string} profileToken Contains the token of the Profile that is used to define the multicast stream.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    startMulticastStreaming(profileToken: string, callback?: any): any;
    /**
     * This command stop multicast streaming using a specified media profile of a device.
     * @param {string} profileToken Contains the token of the Profile that is used to define the multicast stream.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    stopMulticastStreaming(profileToken: string, callback?: any): any;
    /**
     * Synchronization points allow clients to decode and correctly use all data after the synchronization point. For example, if a video stream is configured with a large I-frame distance and a client loses a single packet, the client does not display video until the next I-frame is transmitted. In such cases, the client can request a Synchronization Point which enforces the device to add an I-Frame as soon as possible. Clients can request Synchronization Points for profiles. The device shall add synchronization points for all streams associated with this profile. Similarly, a synchronization point is used to get an update on full PTZ or event status through the metadata stream. If a video stream is associated with the profile, an I-frame shall be added to this video stream. If a PTZ metadata stream is associated to the profile, the PTZ position shall be repeated within the metadata stream.
     * @param {string} profileToken Contains a Profile reference for which a Synchronization Point is requested.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    setSynchronizationPoint(profileToken: string, callback?: any): any;
    /**
     * A device returns the information for current video source mode and settable video source modes of specified video source. A device that indicates a capability of VideoSourceModes shall support this command.
     * @param {string} videoSourceToken Contains a video source reference for which a video source mode is requested.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getVideoSourceModes(videoSourceToken: string, callback?: any): any;
    setVideoSourceMode(): any;
    createOSD(): any;
    /**
     * Delete the OSD.
     * @param {string} OSDToken This element contains a reference to the OSD configuration that should be deleted.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    deleteOSD(OSDToken: string, callback?: any): any;
    /**
     * Get the OSDs.
     * @param {string=} configurationToken Optional token of the Video Source Configuration, which has OSDs associated with are requested. If token not exist, request all available OSDs.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getOSDs(configurationToken?: string | undefined, callback?: any): any;
    /**
     * Get the OSD.
     * @param {string} OSDToken The GetOSD command fetches the OSD configuration if the OSD token is known.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getOSD(OSDToken: string, callback?: any): any;
    setOSD(): any;
    /**
     * Get the OSD Options.
     * @param {string} configurationToken Video Source Configuration Token that specifies an existing video source configuration that the options shall be compatible with.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    getOSDOptions(configurationToken: string, callback?: any): any;
}
import Soap = require("../utils/soap");
