export = Security;
/**
 * @class
 * <p>
 * {@link https://www.onvif.org/specs/srv/security/ONVIF-AdvancedSecurity-Service-Spec-v130.pdf}<br>
 * {@link https://www.onvif.org/ver10/advancedsecurity/wsdl/advancedsecurity.wsdl}<br>
 * </p>
 */
declare class Security {
    soap: Soap;
    timeDiff: number;
    serviceAddress: any;
    username: string;
    password: string;
    namespaceAttributes: string[];
    /**
     * Call this function directly after instantiating a Security object.
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
    uploadPassphrase(): any;
    getAllPassphrases(): any;
    deletePassphrase(): any;
    createRSAKeyPair(): any;
    uploadKeyPairInPKCS8(): any;
    getKeyStatus(): any;
    getPrivateKeyStatus(): any;
    getAllKeys(): any;
    deleteKey(): any;
    createPKCS10CSR(): any;
    createSelfSignedCertificate(): any;
    uploadCertificate(): any;
    uploadCertificateWithPrivateKeyInPKCS12(): any;
    getCertificate(): any;
    getAllCertificates(): any;
    deleteCertificate(): any;
    createCertificationPath(): any;
    getCertificationPath(): any;
    getAllCertificationPaths(): any;
    deleteCertificationPath(): any;
    uploadCRL(): any;
    getCRL(): any;
    getAllCRLs(): any;
    deleteCRL(): any;
    createCertPathValidationPolicy(): any;
    getCertPathValidationPolicy(): any;
    getAllCertPathValidationPolicies(): any;
    deleteCertPathValidationPolicy(): any;
    addServerCertificateAssignment(): any;
    removeServerCertificateAssignment(): any;
    replaceServerCertificateAssignment(): any;
    getAssignedServerCertificates(): any;
    setClientAuthenticationRequired(): any;
    getClientAuthenticationRequired(): any;
    addCertPathValidationPolicyAssignment(): any;
    removeCertPathValidationPolicyAssignment(): any;
    replaceCertPathValidationPolicyAssignment(): any;
    getAssignedCertPathValidationPolicies(): any;
    addDot1XConfiguration(): any;
    getAllDot1XConfigurations(): any;
    getDot1XConfiguration(): any;
    deleteDot1XConfiguration(): any;
    setNetworkInterfaceDot1XConfiguration(): any;
    getNetworkInterfaceDot1XConfiguration(): any;
    deleteNetworkInterfaceDot1XConfiguration(): any;
    getServiceCapabilities(): any;
}
import Soap = require("../utils/soap");
