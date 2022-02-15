import { CameraService } from './CameraService';
import { UserService } from './UserService';

export const Services = {
  User: new UserService(),
  Camera: new CameraService(),
};
