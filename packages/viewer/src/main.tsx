import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Main } from './app/container/main';
import { loadState } from './app/store/localStorage';
import { StoreHelper } from './app/store/StoreHelper';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'flexlayout-react/style/dark.css';

const initialState = loadState();
const store = StoreHelper.initStore(history, initialState);

ReactDOM.render(
  <Provider store={store}>
    <StrictMode>
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    </StrictMode>
  </Provider>,
  document.getElementById('root')
);
