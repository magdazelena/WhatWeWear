import React, { Component } from 'react';
import './styles/base.scss';
import LoadingApp from './pages/LoadingApp';

class App extends Component {
  render() {
    return (
      <div className="App">
        <h1><LoadingApp loading="true"/></h1>
      </div>
    );
  }
}

export default App;
