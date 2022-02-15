var Util = require('./util');
var testCameraType = '';
function setDebugData(cameraType) {
    var errMsg = '';
    if ((errMsg = Util.isInvalidValue(cameraType, 'string'))) {
        throw new Error('cameraType is invalid: ' + errMsg);
    }
    testCameraType = cameraType;
}
function reset() {
    testCameraType = '';
}
function isTest() {
    if (testCameraType.length) {
        return true;
    }
    return false;
}
function getCameraType() {
    return testCameraType;
}
module.exports = {
    setDebugData: setDebugData,
    reset: reset,
    isTest: isTest,
    getCameraType: getCameraType
};
