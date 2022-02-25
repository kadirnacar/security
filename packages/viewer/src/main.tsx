import { createTheme, ThemeProvider } from '@mui/material';
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

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Main />
      </BrowserRouter>
    </ThemeProvider>
  </Provider>,
  document.getElementById('root')
);
