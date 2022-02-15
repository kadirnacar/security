import { IJsonModel } from 'flexlayout-react';

const json: IJsonModel = {
  global: {
    tabEnableFloat: true,
    tabSetMinHeight: 100,
    tabSetMinWidth: 100,
    borderMinSize: 100,
    enableEdgeDock: true,
    borderEnableDrop: false,
    tabSetEnableDrag: true,
    tabSetEnableDivide: true,
  },
  layout: {
    type: 'row',
    children: [
      {
        type: 'tabset',
        id: '#windows',
        children: [
          {
            name: 'One',
            component: 'button',
          },
          {
            name: 'Two',
            component: 'text',
          },
        ],
      },
    ],
  },
  borders: [
    {
      type: 'border',
      location: 'left',
      selected: 0,
      size: 300,
      children: [
        {
          id: 'explorer',
          name: 'Kameralar',
          component: 'CameraList',
          enableClose: false,
        },
      ],
    },
  ],
};

export default json;
