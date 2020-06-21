import React, {Component} from 'react';
import {TweenMax, Expo, TimelineMax} from 'gsap/all';
import ScrollMagic from 'scrollmagic';
import texts from '../dictionary/en.json';
import {animateText, reanimateText, generateTextForAnimation} from '../helpers/textAnimations';
import NextButton from '../objects/NextButton.js';
class LoadingApp extends Component{
    
    constructor(props){
        super(props);
        this.state={
                loaded: false,
                 counter: 0,
                 animation :0,
                 animationInProgress: true
            }
        this.headingRef = null;
        this.headingTopRef = null;
        this.counterRef = null;
        this.progressBar = null;
        this.loader1Ref = null;
        this.loader2Ref = null;
        this.loader3Ref = null;
        this.scene1 = null; 
        this.scene2 = null;
        this.scene3 = null;
    }
    
    promiseState = async state => new Promise(resolve => this.setState(state, resolve));

    componentDidMount(){
        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
          }
        this.startAnimating();
        this.scene1 = new ScrollMagic.Scene({
            duration: 50
        })
        .on('leave', () => {
            let requests = [...this.headingRef.getElementsByTagName('span')].map(item =>{
                return new Promise(resolve => {
                    animateText(item, resolve).reverse(0);
                })
            })
            Promise.all(requests);
           TweenMax.to(this.counterRef, 1, {
               fontSize: 200
           })
        })
        .on('enter', event =>{
            if(event.scrollDirection === "REVERSE"){
                
                this.setState({
                    counter: "710 000 000",
                    animation: 1
                }, ()=>{
                    [...this.headingRef.getElementsByTagName('span')].forEach((span, i)=>{
                        reanimateText(span);
                    });
                   
                })
                TweenMax.to(this.counterRef, 1, {
                    fontSize: 50
                })
            }
            
        })
        this.scene2 = new ScrollMagic.Scene({
            duration: 50,
            offset: 100
        })
        .on('enter', event => {
            if(event.scrollDirection === 'FORWARD'){
                this.setState({
                    counter: "73%",
                    animation: 2
                },
                ()=>{
                    [...this.headingTopRef.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).play();
                    });
                    [...this.loader2Ref.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).play();
                    });
                }

                )
                
            }else{
            //     this.setState({
            //         counter: "73%",
            //         animation : 2
            //     })
            //    TweenMax.to(this.counterRef, 1, {
            //        fontSize: 100
            //    })
            }
        })
        .on('leave', ()=>{
            
           TweenMax.to(this.counterRef, 1, {
               fontSize: 400
           })
        })
        this.scene3 = new ScrollMagic.Scene({
            duration: 50,
            offset: 200
        })
        .on('enter', event => {
            if(event.scrollDirection === 'FORWARD'){
                this.setState({
                    counter: "1%",
                    animation : 3
                }, () => {
                    [...this.headingTopRef.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).play();
                    });
                    [...this.loader3Ref.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).play();
                    });
                });
                
            }
        })
        this.props.controller.addScene([this.scene1, this.scene2, this.scene3])

    }
    componentDidUpdate(prevProps, prevState){
        // if(this.props.loading !== prevProps.loading){
        //     this.setState({
        //         loaded: true
        //     })
        // }
        if(this.state.animation === 1 && this.state.animation !== prevState.animation){
            [...this.headingRef.getElementsByTagName('span')].forEach((span, i)=>{
                animateText(span, i).play();
            });
            [...this.headingTopRef.getElementsByTagName('span')].forEach((span, i)=>{
                animateText(span, i).play();
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
        .to(this.progressBar, 10, {
            width: "100vw",
            ease: Expo.easeOut
        }, "-=10")
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
        .to(this.progressBar, 6,{
            opacity: 0
        }, "-=6")
        .delay(2)
        .set(this.progressBar, {
            display: "none"
        })
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
                },
                onComplete: function(){
                    toggleButton();
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
            this.setState(prevState =>({
                animation: prevState.animation+1
            }))
        }
        var toggleButton=()=>{
            this.setState(prevState=>({
                animationInProgress: !prevState.animationInProgress
            }))
        }
    }
    
    
    
   
    slideTextToPercent = () => {
        let textAnimation = new TimelineMax()
        .to(this.counterRef, 3, {
            ease: Expo.easeIn,
            marginLeft: "-90%"
        })
        return textAnimation;
    }
    nextButtonPressed = ()=>{
        switch (this.state.animation){
            case 1:
                window.scrollTo(0,this.scene2.scrollOffset());
                break;
            case 2:
                window.scrollTo(0,this.scene3.scrollOffset());
                break;
            default:
                this.destroyIntro();
        }
    }
    // componentWillUnmount=()=>{
    //     this.props.controller.destroy();
    // }
    destroyIntro=()=>{
        this.scene1.remove();
        this.scene2.remove();
        this.scene3.remove();
        this.props.markIntroDone();
    }
    render(){
        return <div>
            
                    <div id="loadingPage">
                            <div id="loadingSectionOne" className="loadingSection">
                            <div className="introHeadline"
                                        ref= {e => this.headingTopRef = e}>
                                         { this.state.animation === 1 && (generateTextForAnimation(texts.pageOne.headline.split('')))}
                                         { this.state.animation === 2 && (generateTextForAnimation(texts.pageTwo.headline.split('')))}
                                         { this.state.animation === 3 && (generateTextForAnimation(texts.pageThree.headline.split('')))}
                                    </div>
                                <div 
                                    id="loader"  
                                    ref={el => this.loader1Ref = el } 
                                    className={this.state.counter <= 1 ? 'finished': ''}
                                >
                                
                                    <div id="progressBar" >
                                        <span ref={e => this.progressBar = e}></span>
                                    </div>
                                    <span className="fullNumber" ref={element => {this.counterRef = element}}>         {this.state.counter}
                                    </span>
                                    
                                </div>
                                <div 
                                    ref={element => {this.headingRef = element}} 
                                    className="introText"
                                >
                                    {
                                        this.state.animation === 1 && (generateTextForAnimation(texts.pageOne.description.split('')))
                                    }
                                </div>
                            </div>
                            <div id="loadingSectionTwo" className="loadingSection">
                                <div 
                                    ref={element => {this.loader2Ref = element}} 
                                    className="introText"
                                >
                                    {  this.state.animation === 2 && 
                                       (generateTextForAnimation(texts.pageTwo.description.split('')))
                                    }
                                </div>
                            </div>
                            <div id="loadingSectionThree" className="loadingSection">
                                <div 
                                    ref={element => {this.loader3Ref = element}} 
                                    className="introText"
                                >
                                    {  this.state.animation === 3 && 
                                       (generateTextForAnimation(texts.pageThree.description.split('')))
                                    }
                                </div>
                            </div>
                            {!this.state.animationInProgress && (<NextButton onClick={this.nextButtonPressed}/>)}
                        </div>
        </div>
    }
}

export default LoadingApp;