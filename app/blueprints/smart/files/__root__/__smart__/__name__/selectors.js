import { createSelector } from 'reselect';

const select<%= pascalEntityName %> = () => state => state.get('demoPage');

const selectDemo = () => createSelector(
  select<%= pascalEntityName %>(),
  (substate) => substate.toJS()
);

export default selectDemo;
export {
  selectDemo,
  select<%= pascalEntityName %>,
};
