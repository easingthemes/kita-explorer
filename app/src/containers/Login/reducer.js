import { fromJS } from 'immutable';
import {
  DEFAULT_ACTION,
  GET_DEMO,
} from './constants';

const initialState = fromJS({
  str: '0',
});

function loginReducer(state = initialState, action) {
  switch (action.type) {
    case DEFAULT_ACTION:
      return state;

    case GET_DEMO:
      return state
        .set('str', action.payload);
    default:
      return state;
  }
}

export default loginReducer;
