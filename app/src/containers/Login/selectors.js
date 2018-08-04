import { createSelector } from 'reselect';

const selectLogin = () => state => state.get('login');

const selectDemo = () => createSelector(
  selectLogin(),
  substate => substate.toJS(),
);

export default selectDemo;
export {
  selectDemo,
  selectLogin,
};
