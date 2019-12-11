import React, {Component} from 'react';
import {TweenMax} from 'gsap/all';
import texts from '../dictionary/en.json';
class LoadingApp extends Component{
    
    constructor(props){
        super(props);
        this.state={
                loaded: false,
                 counter: 0.00
            }
        this.headingRef = null;
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
        if(this.state.counter === 1 && this.state.counter !== prevState.counter){
            this.animateText();
        }
    }
    
    startAnimating(){
        let counter = this.state.counter;
        let timer = 400;
        let iteration = () => {
            
            if(counter >= 1){
                clearInterval(interval);
                if(counter > 1){
                    this.setState({
                        counter : 1.00
                    })
                }
            }else{
                counter+=Math.random()/10;
                this.setState({
                    counter: counter
                })
            }   
        }
        let interval = setInterval(iteration, timer);
        
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
            <div id="loader" className={this.state.counter >= 1 ? 'finished': ''}>
                <span className="fullNumber">{this.state.counter.toString().split(".")[0]}.</span>
                <span className="decimal">{(this.state.counter).toFixed(2).toString().split('.')[1]}</span>
                <span className="percent">%</span>
            </div>
            <div ref={element => {this.headingRef = element}} id="introText">
            </div>
        </div>
    }
}

export default LoadingApp;