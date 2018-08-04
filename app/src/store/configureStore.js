import { fromJS } from 'immutable';
import { createStore, applyMiddleware, compose } from 'redux';
import { combineReducers } from 'redux-immutable';
import thunkMiddleware from 'redux-thunk';

import reducers from './reducers';

const initialState = fromJS({});

const rootReducer = combineReducers(reducers);

export default function configureStore() {
	const store = createStore(
		rootReducer,
		initialState,
		compose(
      applyMiddleware(thunkMiddleware),
			window.devToolsExtension ? window.devToolsExtension() : f => f
		)
	);

	return store;
}
