import {
  DEFAULT_ACTION,
  GET_DEMO,
} from './constants';

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}

export function getDemo(param) {
  return function (dispatch) {
    dispatch({
      type: GET_DEMO,
      payload: param,
    });
  };
}
