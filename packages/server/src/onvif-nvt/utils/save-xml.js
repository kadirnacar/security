'use strict';
var Fs = require('fs');
var Path = require('path');
var pd = require('pretty-data').pd;
var writable = false;
var path = Path.resolve(__dirname, '../../test/data/xml');
function saveXml(service, methodName, xml) {
    if (writable) {
        var prettyXml = pd.xml(xml);
        var folderPath = path + "/".concat(service);
        // make sure folder exists
        if (!Fs.existsSync(folderPath)) {
            // make the folder
            Fs.mkdirSync(folderPath);
        }
        var filePath = folderPath + "/".concat(methodName, ".xml");
        Fs.writeFileSync(filePath, prettyXml);
    }
}
function setPath(folder) {
    path = folder;
    // make sure it exists
    if (!Fs.existsSync(path)) {
        Fs.mkdirSync(path);
    }
}
function setWritable(value) {
    writable = value;
}
var functions = {
    setWritable: setWritable,
    setPath: setPath,
    saveXml: saveXml
};
module.exports = functions;
