import React from 'react';
import ReactDOM from 'react-dom';
import <%= pascalEntityName %> from './<%= pascalEntityName %>';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<<%= pascalEntityName %> />, div);
  ReactDOM.unmountComponentAtNode(div);
});
