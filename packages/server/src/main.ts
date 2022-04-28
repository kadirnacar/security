/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as tslib from 'tslib';
import * as xml2js from 'xml2js';
import * as urlParse from 'url-parse';
import * as prettyData from 'pretty-data';
import * as request from 'request';
import { CameraRouter } from './app/routers/camera';
import { DataRouter } from './app/routers/data';

const app = express();
const dataRouter = new DataRouter();
const cameraRouter = new CameraRouter();
xml2js.defaults['0.1'];
urlParse;
prettyData;
request;
function corsPrefetch(req: Request, res: express.Response, next: Function) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, *');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
}
app.use(express.static(path.join(__dirname, 'assets')));
// app.use(express.static(path.join(__dirname, 'model')));
app.use(express.static(__dirname + '/web'));
app.use(express.static(__dirname + '/model'));
app.use(express.static(__dirname + '/photos'));
app.use(corsPrefetch as any);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'web', '/index.html'));
});

app.use('/api', dataRouter.router);
app.use('/api/camera', cameraRouter.router);

app.use('/model', express.static(__dirname + '/model'));
app.use('/photos', express.static(__dirname + '/photos'));

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', console.error);

// CameraService.initWebSocket(server);
