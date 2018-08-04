import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './Button.css';

/**
 * React component implementation.
 *
 * @author dfilipovic
 * @class Button
 */
export class Button extends Component {
  handleClick() {
    this.props.handleClick();
  }

  renderLabel() {
    return (
      <span className="button__label">{this.props.label}</span>
    );
  }

  renderLink() {
    return (
      <a href={this.props.href}
         className="button button--link"
         target="_blank">
        {this.renderLabel()}
      </a>
    );
  }

  renderLinkToRoute() {
    return (
      <Link to={this.props.route} className='button button--link'>
        {this.renderLabel()}
      </Link>
    );
  }

  renderButton() {
    return (
      <button className='button' onClick={() => this.handleClick()}>
        {this.renderLabel()}
      </button>
    );
  }

	render() {
    if (this.props.href) {
      return this.renderLink();
    } else if (this.props.route) {
      return this.renderLinkToRoute();
    }

    return this.renderButton();
	}
}

Button.propTypes = {
	label: PropTypes.string,
  handleClick: PropTypes.func,
  href: PropTypes.string,
  route: PropTypes.string
};

Button.defaultProps = {
	label: 'button',
  handleClick: () => {}
};

export default Button;
