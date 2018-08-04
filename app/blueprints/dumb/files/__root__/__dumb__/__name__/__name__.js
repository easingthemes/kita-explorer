import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './<%= pascalEntityName %>.css';

/**
 * React component implementation.
 *
 * @author dfilipovic
 * @class <%= pascalEntityName %>
 */
export class <%= pascalEntityName %> extends Component {
  constructor(props) {
 		super(props);
 		this.state = {
 			isLoading: true
 		};
 	}

  componentDidMount () {

	}

	render() {
		return (
			<div className='c-<%= pascalEntityName %>'>
				<h1><%= pascalEntityName %></h1>
			</div>
		);
	}
}

<%= pascalEntityName %>.propTypes = {
	str: PropTypes.string,
	oneof: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	])
};

<%= pascalEntityName %>.defaultProps = {
	str: 'string',
	oneof: 0
};

export default <%= pascalEntityName %>;
