import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router-dom';
import createHashHistory from 'history/createHashHistory';

import configureStore from './store/configureStore';
import App from './containers/App/App';
import registerServiceWorker from './registerServiceWorker';

const history = createHashHistory();
const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
        <Route path="/" component={App} />
    </Router>
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
