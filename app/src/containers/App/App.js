import React, { Component } from 'react';
import { Route } from "react-router-dom";

import Login from '../Login';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="container">
        <Route exact path="/" component={Login}/>
        <Route path="/login" component={Login} />
      </div>
    );
  }
}

export default App;
