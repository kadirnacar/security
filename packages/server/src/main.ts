/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import { DataRouter } from './app/routers/data';
import * as bodyParser from 'body-parser';
// import * as OnvifManager from 'onvif-nvt';
import * as OnvifManager from './onvif-nvt/onvif-nvt';
import { CameraRouter } from './app/routers/camera';

const app = express();
let camera: any;
const dataRouter = new DataRouter();
const cameraRouter = new CameraRouter();

OnvifManager.connect('78.189.93.133', 91, 'admin', 'admin123').then(
  (results) => {
    camera = results;
    dataRouter.initCamera(camera);
  }
);

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

app.use(corsPrefetch as any);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api', dataRouter.router);
app.use('/api/camera', cameraRouter.router);

// app.get('/api', async (req, res) => {
//   res.send({ message: 'Welcome to server!' });
// });

// app.post('/api/:entity/list', async (req, res) => {
//   const userRepo = Services[req.params.entity];
//   res.send({ message: 'Welcome to server!', data: userRepo.all() });
// });

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
