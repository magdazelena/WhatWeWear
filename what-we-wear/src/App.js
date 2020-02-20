import React, { Component } from 'react';
import './styles/base.scss';
import LoadingApp from './pages/LoadingApp';
import DressesSequence from './pages/DressesSequence';
class App extends Component {
  constructor(props){
    super(props);
    this.state ={
      introIsDone: false
    }
    this.markIntroDone = this.markIntroDone.bind(this);
  }
  markIntroDone=()=>{
    this.setState({
      introIsDone: true
    })
  }
  render() {
    return (
      <div className="App">
        {!this.state.introIsDone && (<LoadingApp markIntroDone={this.markIntroDone} loading="true"/>)}
        {this.state.introIsDone && (<DressesSequence />)}
      </div>
    );
  }
}

export default App;
