import React, {Component} from 'react';
import {TweenMax, Expo} from 'gsap/all';
import ScrollMagic from 'scrollmagic';
import texts from '../dictionary/en.json';
class LoadingApp extends Component{
    
    constructor(props){
        super(props);
        this.state={
                loaded: false,
                 counter: 100
            }
        this.headingRef = null;
        this.counterRef = null;
        this.controller = new ScrollMagic.Controller();
    }
    componentDidMount(){
        this.startAnimating();
    }
    componentDidUpdate(prevProps, prevState){
        // if(this.props.loading !== prevProps.loading){
        //     this.setState({
        //         loaded: true
        //     })
        // }
        if(this.state.counter === 2 && this.state.counter !== prevState.counter){
            this.animateText();
        }
    }
    
    startAnimating(){
        let counter = {value:this.state.counter};
        TweenMax.to(counter, 16, {
            value: 1, 
            roundProps: 'value',
            ease: Expo.easeOut,
            onUpdate: function(){
                updateCounter(counter.value)
            }
        })

        TweenMax.to(this.counterRef, 16, {
            ease: Expo.easeOut,
            fontSize: '100px'
        })
        var updateCounter=(value)=>{
            this.setState({
                counter: value
            })
        }
    }
    
    animateText = () =>{
        //extended from https://codepen.io/natewiley/pen/xGyZXp Nate Wiley
        
        const text = texts.pageOne.description.split('');
        let random = (min, max) =>{
            return (Math.random() * (max - min)) + min;
        }
        text.forEach((element, i) => {
            let span = document.createElement('span');
            span.innerText = element;
            this.headingRef.appendChild(span);
            TweenMax.from(span, 2.5, {
                opacity: 0,
                x: random(-500, 500),
                y: random(-500, 500),
                z: random(-500, 500),
                scale: .1,
                delay: i * .02
            })
        });

    }
    render(){
        return <div>
            <div id="loader" className={this.state.counter <= 1 ? 'finished': ''}>
                <span className="fullNumber" ref={element => {this.counterRef = element}}>{this.state.counter}</span>
                {/* <span className="decimal">{(this.state.counter).toFixed(2).toString().split('.')[1]}</span> */}
                {/* <span className="percent">%</span> */}
            </div>
            <div ref={element => {this.headingRef = element}} id="introText">
            </div>
        </div>
    }
}

export default LoadingApp;