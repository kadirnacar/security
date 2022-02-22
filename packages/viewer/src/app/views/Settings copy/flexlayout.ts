import { IJsonModel } from 'flexlayout-react';

const json: IJsonModel = {
  global: {
    splitterSize: 8,
    tabEnableFloat: false,
  },
  borders: [],
  layout: {
    type: 'row',
    children: [
      {
        type: 'tabset',
        weight: 20,
        name: 'Menü',
        enableDrop: false,
        enableDrag: false,
        enableDivide: false,
        enableDeleteWhenEmpty: false,
        enableClose: false,
        enableTabStrip: false,
        enableMaximize: false,
        children: [{ component: 'Settings' }],
      },
      {
        type: 'tabset',
        weight: 80,
        name: 'Ayarlar',
        enableDrop: false,
        enableDrag: false,
        enableDivide: false,
        enableDeleteWhenEmpty: false,
        enableClose: false,
        enableTabStrip: false,
        enableMaximize: false,
        children: [],
      },
    ],
  },
};

export default json;
