import React, { Component } from 'react';
import './styles/base.scss';
import ScrollMagic from 'scrollmagic';
import LoadingApp from './pages/LoadingApp';
import DressesSequence from './pages/DressesSequence';
import ExplosionsSequence from './pages/ExplosionsSequence';
import SweatshopsSequence from './pages/SweatshopsSequence';
import TextileSequence from './pages/TextileSequence';
import FindOutMore from './pages/FindOutMore';
import TrashSequence from './pages/TrashSequence';
class App extends Component {
  constructor(props){
    super(props);
    this.state ={
      introIsDone: true
    }
    this.controller = new ScrollMagic.Controller();
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
        {/* {this.state.introIsDone && (<DressesSequence controller={this.controller}/>)}  */}
        {/* <ExplosionsSequence controller={this.controller}/> */}
        {/* <SweatshopsSequence /> */}
        {/* <TextileSequence /> */}
        <TrashSequence />
        {/* <FindOutMore/> */}
      </div>
    );
  }
}

export default App;
