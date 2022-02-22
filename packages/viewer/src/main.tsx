import { library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { fas } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'react-grid-layout/css/styles.css';
import { Provider } from 'react-redux';
import 'react-resizable/css/styles.css';
import { BrowserRouter } from 'react-router-dom';
import Main from './app/container/main';
import { loadState } from './app/store/localStorage';
import { StoreHelper } from './app/store/StoreHelper';

const initialState = loadState();
const store = StoreHelper.initStore(history, initialState);

library.add(fas);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
