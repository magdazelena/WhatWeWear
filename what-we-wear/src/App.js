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
import SubstanceSequence from './pages/SubstanceSequence';
class App extends Component {
  constructor(props){
    super(props);
    this.state ={
      introIsDone: true,
      sceneId:5
    }
    this.controller = new ScrollMagic.Controller();
    this.markIntroDone = this.markIntroDone.bind(this);
    window.scrollBy({ 
      top: 10, // could be negative value
      left: 0, 
      behavior: 'smooth' 
    });
  }
  markIntroDone=()=>{
    this.setState({
      introIsDone: true
    })
  }
  setSceneID=id=>{
    this.setState({
      sceneId: id
    })
  }
  nextScene= ()=>{
    this.setState({
      sceneId: this.state.sceneId+1
    }, ()=> {
      console.log(this.state.sceneId)
    })
  }
  prevScene=()=>{
    this.setState({
      sceneId: this.state.sceneId-1
    })
  }
  render() {
    return (
      <div className="App">
        {!this.state.introIsDone && (<LoadingApp markIntroDone={this.markIntroDone} loading="true"/>)}
        {this.state.introIsDone && this.state.sceneId===1 &&(<DressesSequence controller={this.controller} prevScene={this.prevScene} nextScene={this.nextScene} id="1" />)} 
        {this.state.introIsDone && this.state.sceneId===2 && (<ExplosionsSequence controller={this.controller} prevScene={this.prevScene} nextScene={this.nextScene} id="2"/>)}
        {this.state.introIsDone && this.state.sceneId===3 && (<SweatshopsSequence controller={this.controller} prevScene={this.prevScene} nextScene={this.nextScene} id="3"/>)}
        {this.state.introIsDone && this.state.sceneId===4 && (<TextileSequence controller={this.controller} prevScene={this.prevScene} nextScene={this.nextScene} id="4"/>)}
        {this.state.introIsDone && this.state.sceneId===5 &&(<SubstanceSequence controller={this.controller} prevScene={this.prevScene} nextScene={this.nextScene} id="5"/>)}
        {this.state.introIsDone && this.state.sceneId===6 &&(<TrashSequence controller={this.controller} prevScene={this.prevScene} nextScene={this.nextScene} id="6"/>)}
       {this.state.introIsDone && ( <FindOutMore setScene={this.setSceneID}/>) }
      </div>
    );
  }
}

export default App;
