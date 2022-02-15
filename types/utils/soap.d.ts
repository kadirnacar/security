export = Soap;
/**
 * SOAP management (sending, receiving, parsing) class for ONVIF modules.
 */
declare class Soap {
    username: string;
    password: string;
    HTTP_TIMEOUT: number;
    /**
     * Internal method for parsing SOAP responses.
     * @param {string} soap The XML to parse.
     */
    parse(soap: string): any;
    /**
     * Internal method used by the module classes.
     * @param {object} params Object containing required parameters to create a SOAP request.
     * @param {string} params.body Description in the &lt;s:Body&gt; of the generated xml.
     * @param {array} params.xmlns A list of xmlns attributes used in the body
     *            e.g., xmlns:tds="http://www.onvif.org/ver10/device/wsdl".
     * @param {number} params.diff Time difference [ms].
     * @param {string} params.username The user name.
     * @param {string} params.password The user Password.
     * @param {string=} params.subscriptionId To string (ex: used in Events#pullMessages).
     * @param {string=} params.subscriptionId.Address Action string (ex: used in Events#pullMessages).
     * @param {string=} params.subscriptionId._ MessageID string (ex: used in Events#pullMessages).
     * @param {string=} params.subscriptionId.$ MessageID string (ex: used in Events#pullMessages).
     */
    createRequest(params: {
        body: string;
        xmlns: any[];
        diff: number;
        username: string;
        password: string;
        subscriptionId?: string | undefined;
    }): string;
    /**
     * Internal method to send a SOAP request to the specified serviceAddress.
     * @param {object} service The service name.
     * @param {object} serviceAddress The service address.
     * @param {string} methodName The request name.
     * @param {xml} soapEnvelope The request SOAP envelope.
     * @param {object=} params Used internally.
     */
    makeRequest(service: object, serviceAddress: object, methodName: string, soapEnvelope: xml, params?: object | undefined): any;
    /**
     * Internal method to send a SOAP request.
     * @param {object} service The service.
     * @param {object} serviceAddress The service address.
     * @param {string} methodName The request name.
     * @param {xml} soapEnvelope The request SOAP envelope.
     */
    runRequest(service: object, serviceAddress: object, methodName: string, soapEnvelope: xml): any;
    parseResponse(methodName: any, response: any): any;
    /**
     * Parses results to see if there is a fault.
     * @param {object} results The results of a communication with a server.
     */
    getFault(results: object): string;
    parseForCode(fault: any): string;
    parseForDetail(fault: any): string;
    parseForReason(fault: any): string;
    /**
     * Internal method used to create the user token xml.
     * @param {integer} diff The server timeDiff [ms].
     * @param {string} user The user name.
     * @param {string=} pass The user password.
     */
    createUserToken(diff: integer, user: string, pass?: string | undefined): string;
    createNonce(digit: any): any;
    getAddress(subscriptionid: any): any;
    getCustomSubscriptionIdXml(subscriptionId: any): string;
}
