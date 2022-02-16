import { library } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { fas } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'flexlayout-react/style/dark.css';
import * as React from 'react';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Main } from './app/container/main';
import { AppCtx } from './app/reducers/Base';
import { loadState } from './app/store/localStorage';
import { StoreHelper } from './app/store/StoreHelper';

const initialState = loadState();
const store = StoreHelper.initStore(history, initialState);

library.add(fas);

ReactDOM.render(
  <Provider store={store}>
    <StrictMode>
      <BrowserRouter>
        <AppCtx.Provider value={{}}>
          <Main />
        </AppCtx.Provider>
      </BrowserRouter>
    </StrictMode>
  </Provider>,
  document.getElementById('root')
);
