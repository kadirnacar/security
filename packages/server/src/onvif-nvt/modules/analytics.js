var Soap = require('../utils/soap');
var Util = require('../utils/util');
/**
 * @class
 * This code is curently untested.
 * <p>
 * {@link https://www.onvif.org/specs/srv/analytics/ONVIF-Analytics-Service-Spec-v1712.pdf}<br>
 * {@link https://www.onvif.org/ver20/analytics/wsdl/analytics.wsdl}<br>
 * </p>
 * <h3>Functions</h3>
 * {@link Analytics#createAnalyticsModules},
 * {@link Analytics#deleteAnalyticsModules},
 * {@link Analytics#getAnalyticsModuleOptions},
 * {@link Analytics#getAnalyticsModules},
 * {@link Analytics#getServiceCapabilities},
 * {@link Analytics#getSupportedAnalyticsModules},
 * {@link Analytics#modifyAnalyticsModules},
 * {@link Analytics#createRules},
 * {@link Analytics#deleteRules},
 * {@link Analytics#getRuleOptions},
 * {@link Analytics#getRules},
 * {@link Analytics#getSupportedRules},
 * {@link Analytics#modifyRules}
 * <br><br>
 * <h3>Overview</h3>
 */
var Analytics = /** @class */ (function () {
    function Analytics() {
        this.soap = new Soap();
        this.timeDiff = 0;
        this.serviceAddress = null;
        this.username = null;
        this.password = null;
        this.namespaceAttributes = [
            // TODO: for analytics2
            // 'xmlns:tan="http://www.onvif.org/ver20/analytics/wsdl"
            'xmlns:tns1="http://www.onvif.org/ver10/topics"',
            'xmlns:tan="http://www.onvif.org/ver10/analytics"',
            'xmlns:ttr="http://www.onvif.org/ver10/analytics/radiometry"'
        ];
    }
    /**
     * Call this function directly after instantiating an Analytics object.
     * @param {number} timeDiff The onvif device's time difference.
     * @param {object} serviceAddress An url object from url package - require('url').
     * @param {string=} username Optional only if the device does NOT have a user.
     * @param {string=} password Optional only if the device does NOT have a password.
     */
    Analytics.prototype.init = function (timeDiff, serviceAddress, username, password) {
        this.timeDiff = timeDiff;
        this.serviceAddress = serviceAddress;
        this.username = username;
        this.password = password;
    };
    /**
     * Private function for creating a SOAP request.
     * @param {string} body The body of the xml.
     */
    Analytics.prototype.createRequest = function (body) {
        var soapEnvelope = this.soap.createRequest({
            body: body,
            xmlns: this.namespaceAttributes,
            diff: this.timeDiff,
            username: this.username,
            password: this.password
        });
        return soapEnvelope;
    };
    Analytics.prototype.buildRequest = function (methodName, xml, callback) {
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
            if (typeof xml === 'undefined' || xml === null || xml === '') {
                soapBody += "<tan:".concat(methodName, "/>");
            }
            else {
                soapBody += "<tan:".concat(methodName, ">");
                soapBody += xml;
                soapBody += "</tan:".concat(methodName, ">");
            }
            var soapEnvelope = _this.createRequest(soapBody);
            _this.soap.makeRequest('analytics', _this.serviceAddress, methodName, soapEnvelope)
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
    Analytics.prototype.requestWithConfigurationToken = function (methodName, configurationToken, xml, callback) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var errMsg = '';
            if (typeof callback !== 'undefined' && callback !== null) {
                if ((errMsg = Util.isInvalidValue(callback, 'function'))) {
                    reject(new Error("The \"callback\" argument for ".concat(methodName, " is invalid:") + errMsg));
                    return;
                }
            }
            if ((errMsg = Util.isInvalidValue(configurationToken, 'string'))) {
                reject(new Error("The \"configurationToken\" argument for ".concat(methodName, " is invalid: ") + errMsg));
                return;
            }
            if (typeof xml !== 'undefined' && xml !== null) {
                if ((errMsg = Util.isInvalidValue(xml, 'xml'))) {
                    reject(new Error("The \"xml\" argument for ".concat(methodName, " is invalid: ") + errMsg));
                    return;
                }
            }
            var soapBody = '';
            soapBody += '<tan:ConfigurationToken>' + configurationToken + '</tan:ConfigurationToken>';
            if (typeof xml !== 'undefined' && xml !== null) {
                soapBody += xml;
            }
            _this.buildRequest(methodName, soapBody)
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
    // ---------------------------------------------
    // Analytics API
    // ---------------------------------------------
    /**
     * @typedef {object} AnalyticsModule-xml
     * @property {object} AnalyticsModule This object must be XML.
     * @property {string} AnalyticsModule.Name Name of the configuration.
     * @property {string} AnalyticsModule.Type The Type attribute specifies the type of rule and shall be equal to value of one of Name attributes of ConfigDescription elements returned by GetSupportedRules and GetSupportedAnalyticsModules command.
     * @property {array} AnalyticsModule.Parameters List of configuration parameters as defined in the corresponding description.
     * @property {object=} AnalyticsModule.Parameters.SimpleItem Value name pair as defined by the corresponding description.
     * @property {string} AnalyticsModule.Parameters.SimpleItem.Name Item name.
     * @property {string} AnalyticsModule.Parameters.SimpleItem.Value Item value. The type is defined in the corresponding description.
     * @property {object=} AnalyticsModule.Parameters.ElementItem Complex value structure.
     * @property {string} AnalyticsModule.Parameters.ElementItem.Name Item name.
     * @property {object=} AnalyticsModule.Parameters.Extension ItemListExtension
     */
    /**
     * Add one or more analytics modules to an existing VideoAnalyticsConfiguration. The available supported types can be retrieved via GetSupportedAnalyticsModules, where the Name of the supported AnalyticsModules correspond to the type of an AnalyticsModule instance.<br>
     * Pass unique module names which can be later used as reference. The Parameters of the analytics module must match those of the corresponding AnalyticsModuleDescription.<br>
     * Although this method is mandatory a device implementation must not support adding modules. Instead it can provide a fixed set of predefined configurations via the media service function GetCompatibleVideoAnalyticsConfigurations.<br>
     * The device shall ensure that a corresponding analytics engine starts operation when a client subscribes directly or indirectly for events produced by the analytics or rule engine or when a client requests the corresponding scene description stream. An analytics module must be attached to a Video source using the media profiles before it can be used. In case differing analytics configurations are attached to the same profile it is undefined which of the analytics module configuration becomes active if no stream is activated or multiple streams with different profiles are activated at the same time.
     * @param {string} configurationToken Reference to an existing VideoAnalyticsConfiguration.
     * @param {AnalyticsModule-xml} xml AnalyticsModule xml.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.createAnalyticsModules = function (configurationToken, xml, callback) {
        return this.requestWithConfigurationToken('CreateAnalyticsModules', configurationToken, xml, callback);
    };
    /**
     * Remove one or more analytics modules from a VideoAnalyticsConfiguration referenced by their names.
     * @param {string} configurationToken Reference to an existing Video Analytics configuration.
     * @param {string} analyticsModuleName Name of the AnalyticsModule to be deleted.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.deleteAnalyticsModules = function (configurationToken, analyticsModuleName, callback) {
        var soapBody = '<tan:AnalyticsModuleName>' + analyticsModuleName + '</tan:AnalyticsModuleName>';
        return this.requestWithConfigurationToken('DeleteAnalyticsModules', configurationToken, soapBody, callback);
    };
    /**
     * Return the options for the supported analytics modules that specify an Option attribute.
     * @param {string} configurationToken Reference to an existing AnalyticsConfiguration.
     * @param {string} type Reference to an SupportedAnalyticsModule Type returned from GetSupportedAnalyticsModules.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.getAnalyticsModuleOptions = function (configurationToken, type, callback) {
        var soapBody = '<tan:Type>' + type + '</tan:Type>';
        return this.requestWithConfigurationToken('GetAnalyticsModuleOptions', configurationToken, soapBody, callback);
    };
    /**
     * List the currently assigned set of analytics modules of a VideoAnalyticsConfiguration.
     * @param {string} configurationToken Reference to an existing VideoAnalyticsConfiguration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     * @returns {AnalyticsModule-xml} AnalyticsModule xml.
     */
    Analytics.prototype.getAnalyticsModules = function (configurationToken, callback) {
        return this.requestWithConfigurationToken('GetAnalyticsModules', configurationToken, null, callback);
    };
    /**
     * Returns the capabilities of the analytics service. The result is returned in a typed answer.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.getServiceCapabilities = function (callback) {
        return this.buildRequest('GetServiceCapabilities', null, callback);
    };
    /**
     * List all analytics modules that are supported by the given VideoAnalyticsConfiguration. The result of this method may depend on the overall Video analytics configuration of the device, which is available via the current set of profiles.
     * @param {string} configurationToken Reference to an existing VideoAnalyticsConfiguration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.getSupportedAnalyticsModules = function (configurationToken, callback) {
        return this.requestWithConfigurationToken('GetSupportedAnalyticsModules', configurationToken, null, callback);
    };
    /**
     *
     * @param {string} configurationToken Reference to an existing VideoAnalyticsConfiguration.
     * @param {AnalyticsModule-xml} xml AnalyticsModule xml.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.modifyAnalyticsModules = function (configurationToken, xml, callback) {
        return this.requestWithConfigurationToken('ModifyAnalyticsModules', configurationToken, xml, callback);
    };
    /**
     * @typedef {object} Rule-xml
     * @property {object} Rule This object must be XML.
     * @property {string} Rule.Name Name of the configuration.
     * @property {string} Rule.Type The Type attribute specifies the type of rule and shall be equal to value of one of Name attributes of ConfigDescription elements returned by GetSupportedRules and GetSupportedAnalyticsModules command.
     * @property {array} Rule.Parameters List of configuration parameters as defined in the corresponding description.
     * @property {object=} Rule.Parameters.SimpleItem Value name pair as defined by the corresponding description.
     * @property {string} Rule.Parameters.SimpleItem.Name Item name.
     * @property {string} Rule.Parameters.SimpleItem.Value Item value. The type is defined in the corresponding description.
     * @property {object=} Rule.Parameters.ElementItem Complex value structure.
     * @property {string} Rule.Parameters.ElementItem.Name Item name.
     * @property {object=} Rule.Parameters.Extension ItemListExtension
     */
    /**
     * Add one or more rules to an existing VideoAnalyticsConfiguration. The available supported types can be retrieved via GetSupportedRules, where the Name of the supported rule correspond to the type of an rule instance.<br>
     * Pass unique module names which can be later used as reference. The Parameters of the rules must match those of the corresponding description.<br>
     * Although this method is mandatory a device implementation must not support adding rules. Instead it can provide a fixed set of predefined configurations via the media service function GetCompatibleVideoAnalyticsConfigurations.
     * @param {string} configurationToken Reference to an SupportedAnalyticsModule Type returned from GetSupportedAnalyticsModules.
     * @param {Rule-xml} xml Rule xml.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.createRules = function (configurationToken, xml, callback) {
        return this.requestWithConfigurationToken('CreateRules', configurationToken, xml, callback);
    };
    /**
     * Remove one or more rules from a VideoAnalyticsConfiguration.
     * @param {string} configurationToken Reference to an existing VideoAnalyticsConfiguration.
     * @param {string} ruleName References the specific rule to be deleted (e.g. "MyLineDetector").
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.deleteRules = function (configurationToken, ruleName, callback) {
        var soapBody = '<tan:RuleName>' + ruleName + '</tan:RuleName>';
        return this.requestWithConfigurationToken('DeleteRules', configurationToken, soapBody, callback);
    };
    /**
     * Return the options for the supported rules that specify an Option attribute.
     * @param {string} configurationToken Reference to an existing analytics configuration.
     * @param {string} ruleType Reference to an SupportedRule Type returned from GetSupportedRules.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.getRuleOptions = function (configurationToken, ruleType, callback) {
        var soapBody = '<tan:RuleType>' + ruleType + '</tan:RuleType>';
        return this.requestWithConfigurationToken('GetRuleOptions', configurationToken, soapBody, callback);
    };
    /**
     * List the currently assigned set of rules of a VideoAnalyticsConfiguration.
     * @param {string} configurationToken Reference to an existing VideoAnalyticsConfiguration.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.getRules = function (configurationToken, callback) {
        return this.requestWithConfigurationToken('GetRules', configurationToken, null, callback);
    };
    /**
     * List all rules that are supported by the given VideoAnalyticsConfiguration. The result of this method may depend on the overall Video analytics configuration of the device, which is available via the current set of profiles.
     * @param {string} configurationToken References an existing Video Analytics configuration. The list of available tokens can be obtained via the Media service Media#getVideoAnalyticsConfigurations method.
     * @param {callback=} callback Optional callback, instead of a Promise.
     * @returns {Rules-xml} The Rules xml.
     */
    Analytics.prototype.getSupportedRules = function (configurationToken, callback) {
        return this.requestWithConfigurationToken('GetSupportedRules', configurationToken, null, callback);
    };
    /**
     * Modify one or more rules of a VideoAnalyticsConfiguration. The rules are referenced by their names.
     * @param {string} configurationToken Reference to an existing VideoAnalyticsConfiguration.
     * @param {Rule-xml} xml Rule xml.
     * @param {callback=} callback Optional callback, instead of a Promise.
     */
    Analytics.prototype.modifyRules = function (configurationToken, xml, callback) {
        return this.requestWithConfigurationToken('ModifyRules', configurationToken, xml, callback);
    };
    return Analytics;
}());
module.exports = Analytics;
