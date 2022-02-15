import { IJsonModel } from 'flexlayout-react';

const json: IJsonModel = {
  global: {
    tabSetEnableClose: true,
  },
  borders: [
    {
      type: 'border',
      selected: 0,
      enableDrop: false,
      size: 300,
      location: 'left',
      children: [
        {
          type: 'tab',
          id: 'explorer',
          name: 'Kameralar',
          component: 'CameraList',
          enableClose: false,
          enableDrag: false,
        },
      ],
    },
  ],
  layout: {
    type: 'row',
    children: [
      {
        type: 'tabset',
        weight: 50,
        children: [
          {
            type: 'tab',
            name: 'One',
            component: 'CameraList',
          },
        ],
        active: true,
      },
      {
        type: 'tabset',
        weight: 50,
        children: [
          {
            type: 'tab',
            name: 'Two',
            component: 'CameraList',
          },
        ],
      },
    ],
  },
};

export default json;
