import React, { Component } from 'react';
import './styles/base.scss';
import LoadingApp from './pages/LoadingApp';
import DressesSequence from './pages/DressesSequence';
class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <h1><LoadingApp loading="true"/></h1> */}
        <DressesSequence />
      </div>
    );
  }
}

export default App;
