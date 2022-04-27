import { CameraService } from './CameraService';
import { UserService } from './UserService';
import { SettingsService } from './SettingsService';
import { CaptureService } from './CaptureService';

export const Services = {
  User: new UserService(),
  Camera: new CameraService(),
  Settings: new SettingsService(),
  Capture: new CaptureService(),
};
