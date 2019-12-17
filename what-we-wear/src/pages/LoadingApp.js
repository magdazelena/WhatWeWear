import React, {Component} from 'react';
import {TweenMax, Expo, TimelineMax} from 'gsap/all';
import ScrollMagic from 'scrollmagic';
import texts from '../dictionary/en.json';
require("../helpers/scrollmagicdebug.js");
class LoadingApp extends Component{
    
    constructor(props){
        super(props);
        this.state={
                loaded: false,
                 counter: 0,
                 animation :0
            }
        this.headingRef = null;
        this.counterRef = null;
        this.loader1Ref = null;
        this.loader2Ref = null;
        this.controller = new ScrollMagic.Controller();
    }
    componentDidMount(){
        this.startAnimating();
        new ScrollMagic.Scene({
            duration: "50%",
        })
        .setPin(this.loader2Ref)
        .addIndicators()
        .on('leave', () => {
            [...this.headingRef.getElementsByTagName('span')].forEach((span, i)=>{
                this.animateText(span, i).reverse(0);
            })
        })
        .on('enter', event =>{
            if(event.scrollDirection === "REVERSE"){
                [...this.headingRef.getElementsByTagName('span')].forEach((span, i)=>{
                    this.reanimateText(span);
                })
            }
        })
        .addTo(this.controller);
    }
    componentDidUpdate(prevProps, prevState){
        // if(this.props.loading !== prevProps.loading){
        //     this.setState({
        //         loaded: true
        //     })
        // }
        if(this.state.animation === 1 && this.state.animation !== prevState.animation){
            [...this.headingRef.getElementsByTagName('span')].forEach((span, i)=>{
                this.animateText(span, i).play();
            })
        }
    }
    
    startAnimating(){
        let counter = {value:this.state.counter};
        let timeline = new TimelineMax();
        timeline.to(counter, 10, {
            value: 100,
            roundProps: 'value',
            ease: Expo.easeOut,
            onUpdate: function(){
                updateCounter(counter.value)
            }
        })
        .to(this.counterRef, 6, {
            ease: Expo.easeOut,
            fontSize: 100
        }, "-=10")
        .to(counter, 6, {
            value: 710,
            roundProps: 'value',
            ease: Expo.easeIn,
            onUpdate: function(){
                updateCounter(counter.value)
            }
        })
        .delay(2)
        .to(counter, 1,
            {
                value: "710 000",
                onUpdate: function(){
                    updateCounter("710 000")
                },
                onComplete: function(){
                    nextAnimation();
                }
        })
        .to(this.counterRef, .5, {
            ease: Expo.easeOut,
            fontSize: '60px'
        }, '-=1')
        .delay(2)
        .to(counter, 1,
            {
                value: "710 000 000",
                onUpdate: function(){
                    updateCounter("710 000 000")
                }
            })
            .to(this.counterRef, .5, {
                ease: Expo.easeOut,
                fontSize: '50px'
            }, '-=1')
        

        var updateCounter=(value)=>{
            this.setState({
                counter: value
            })
        }
        var nextAnimation=()=>{
            this.setState({
                animation: this.state.animation+1
            })
        }
    }
    
    animateText = (span, i) =>{
        //extended from https://codepen.io/natewiley/pen/xGyZXp Nate Wiley
        let textAnimation = new TimelineMax()
        .from(span, 2, {
            //opacity: 0,
            ease: Expo.easeIn,
            x: this.random(-50, 50),
            y: this.random(-5, 500),
            z: this.random(-50, 50),
            scale: .1,
            delay: i * .02
        });
        return textAnimation;
    }
    reanimateText = (span) => {
        let textAnimation = new TimelineMax()
        .to(span, 1, {
            //opacity: 0,
            ease: Expo.easeIn,
            x: 0,
            y: 0,
            z: 0,
            scale: 1
        });
        return textAnimation;
    }
    random = (min, max) =>{
        return (Math.random() * (max - min)) + min;
    }
    generateTextForAnimation = (text) => {
        return text.map((el,i) =>{
            return <span key={i}>{el}</span>;
        })
    }
    render(){
        return <div>
            
                    <div id="loadingPage">
                            <div id="loadingSectionOne" className="loadingSection">
                                <div 
                                    id="loader"  
                                    ref={el => this.loader1Ref = el } 
                                    className={this.state.counter <= 1 ? 'finished': ''}
                                >
                                    <span className="fullNumber" ref={element => {this.counterRef = element}}>         {this.state.counter}
                                    </span>
                                </div>
                                <div 
                                    ref={element => {this.headingRef = element}} 
                                    className="introText"
                                >
                                    {
                                        this.state.animation === 1 && (this.generateTextForAnimation(texts.pageOne.description.split('')))
                                    }
                                </div>
                            </div>
                            <div id="loadingSectionTwo" className="loadingSection">
                                <div 
                                    ref={element => {this.loader2Ref = element}} 
                                    className="introText"
                                >
                                    {
                                       (this.generateTextForAnimation(texts.pageTwo.description.split('')))
                                    }
                                </div>
                            </div>
                        </div>
        </div>
    }
}

export default LoadingApp;