import { Camera, IGlRect } from '@security/models';
import React from 'react';
import { PursuitController } from './views/Home/PursuitController';

export function generateGuid() {
  var result, i, j;
  result = '';
  for (j = 0; j < 32; j++) {
    if (j == 8 || j == 12 || j == 16 || j == 20) result = result + '';
    i = Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase();
    result = result + i;
  }
  return result;
}

export interface ICamComtext {
  render: (state) => void;
  camera?: Camera;
  boxes: IGlRect[];
  camOptions: any;
  parent?: ICamComtext;
  pursuitController?: PursuitController;
  limitPosition?: any;
}

export const CamContext = React.createContext<ICamComtext>({
  render: () => {},
  boxes: [],
  camOptions: {},
});
