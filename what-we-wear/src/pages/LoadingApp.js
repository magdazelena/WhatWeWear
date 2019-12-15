import React, {Component} from 'react';
import {TweenMax, Expo} from 'gsap/all';
import {Controller, Scene} from 'react-scrollmagic';
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
        this.loader1Ref = null;
        this.loader2Ref = null;
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
            this.animateText(false);
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
    
    animateText = (reverse) =>{
        //extended from https://codepen.io/natewiley/pen/xGyZXp Nate Wiley
        
        
        let random = (min, max) =>{
            return (Math.random() * (max - min)) + min;
        }
        let textAnimation = (span,i)=>TweenMax.from(span, 2, {
            opacity: 0,
            ease: Expo.easeIn,
            x: random(-50, 50),
            y: random(-5, 500),
            z: random(-50, 50),
            scale: .1,
            delay: i * .02
        });
        [...this.headingRef.getElementsByTagName('span')].forEach((span, i)=>{
            if(!reverse) textAnimation(span, i).play();
            if(reverse) textAnimation(span, i).reverse(0);
        })

    }
    generateTextForAnimation = (text) => {
        return text.map((el,i) =>{
            return <span key={i}>{el}</span>;
        })
    }
    render(){
        return <div>
            <Controller>
                <Scene 
                    indicators={true}
                    duration="100%"
                >
                  {(progress, event) => {
                      console.log(event)
                      if(event.type === 'leave' && event.scrollDirection === 'FORWARD') this.animateText(true);
                      if(event.type === 'enter' && event.scrollDirection === 'REVERSE') this.animateText(false);
                       return <div id="loadingPage">
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
                                        this.state.counter <=2 && (this.generateTextForAnimation(texts.pageOne.description.split('')))
                                    }
                                </div>
                            </div>
                            <div id="loadingSectionTwo" className="loadingSection">
                                <div 
                                    ref={element => {this.loader2Ref = element}} 
                                    className="introText"
                                >
                                </div>
                            </div>
                        </div>
                  }}
                </Scene>
            </Controller>
        </div>
    }
}

export default LoadingApp;