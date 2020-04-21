import React from 'react';
import {Expo, TimelineMax} from 'gsap/all';
export var animateText = (span, i) =>{
    //extended from https://codepen.io/natewiley/pen/xGyZXp Nate Wiley
    let textAnimation = new TimelineMax()
    .from(span, 1, {
        opacity: 0,
        ease: Expo.easeIn,
        x: random(-50, 50),
        y: random(-5, 500),
        z: random(-50, 50),
        scale: .1,
        delay: i * .02
    });
    return textAnimation;
}
export var reanimateText = (span) => {
    let textAnimation = new TimelineMax()
    .to(span, 1, {
        ease: Expo.easeIn,
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
        opacity:1 
    });
    return textAnimation;
}
export var generateTextForAnimation = (text) => {
    return text.map((el,i) =>{
        return <span key={i}>{el}</span>;
    })
}
const random = (min, max) =>{
    return (Math.random() * (max - min)) + min;
}