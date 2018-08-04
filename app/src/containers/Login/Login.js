import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import selectDemo from './selectors';
import {
  getDemo,
} from './actions';

import Button from '../../components/Button';

class Login extends Component {
  componentDidMount() {
    this.props.handleGetDemo('123');
  }

  handleLogin() {
    console.log('login');
  }

  render() {
    return (
      <div className="login__container">
        <Button
            label="PRIJAVI SE"
            handleClick={this.handleLogin}/>
      </div>
    );
  }
}

Login.propTypes = {
  str: PropTypes.string,
};

const mapStateToProps = selectDemo();

function mapDispatchToProps(dispatch) {
  return {
    handleGetDemo: (param) => dispatch(getDemo(param)),
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

