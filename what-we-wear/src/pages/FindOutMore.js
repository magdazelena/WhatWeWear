import React from 'react';
import * as PIXI from 'pixi.js';
import {TweenMax, TimelineMax} from 'gsap';
import list from '../helpers/resources.json';
import { Timeline } from 'gsap/gsap-core';
function FindOutMore(){
    let findRef = React.useRef(null);
    let targ, coordX, coordY, offsetX,  drag;
    let startDrag = (e) => {
        // determine event object
        if (!e) {
            var e = window.event;
        }
        if(e.preventDefault) e.preventDefault();

        // IE uses srcElement, others use target
        targ = e.target ? e.target : e.srcElement;

        if (targ.className !== 'dragg-area') {return};
        // calculate event X, Y coordinates
            offsetX = e.clientX;

        // assign default values for top and left properties
        if(!targ.style.left) { targ.style.left='0px'};

        // calculate integer values for top and left 
        // properties
        coordX = parseInt(targ.style.left);
        coordY = parseInt(targ.style.top);
        drag = true;

        // move div element
        document.onmousemove=dragDiv;
        playgrounds.map(item => {
            TweenMax.to(item.displacementSprite.scale,{x:0.8+duration, y:0.8+duration}).duration(duration);
        })
        return false;

    }
    let duration = 1;
    let dragDiv = (e) => {
        if (!drag) {return};
        if (!e) { var e= window.event};
        targ.style.left=coordX+e.clientX-offsetX+'px';
        duration+=.3;
       
        return false;
    }
    
    let stopDrag =() =>{
        playgrounds.map(item => {
            TweenMax.to(item.displacementSprite.scale, 1, {x:2, y:2})
        })
        drag=false;
    }

    window.onload = () => {
        document.onmousedown = startDrag;
        document.onmouseup = stopDrag;
        if(findRef.current)    
            displacements();
    }
    const playgrounds = [];
    let displacements = () =>{
        const thumbs = findRef.current.getElementsByClassName('thumb');
        
        Array.from(thumbs).map((item, index) => {
            let playground = {
                renderer : PIXI.autoDetectRenderer({width: thumbs[index].offsetWidth, height: thumbs[index].offsetHeight, transparent:true}),
                count: 0
            }
            playground.renderer.autoResize = true;
            item.appendChild(playground.renderer.view);
	        let tp = PIXI.Texture.from(list[index].thumb);
	        let preview = new PIXI.Sprite(tp);
            
            
            preview.anchor.set(0.4);
            preview.width = playground.renderer.width-20;
            preview.height = playground.renderer.height-20;
            preview.x = playground.renderer.width / 2 -20;
            preview.y = playground.renderer.height / 2 -20; 
            playground.preview = preview;
	        let displacementSprite = PIXI.Sprite.from('./images/ripple.jpg');
	        displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

	       	let displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);

	        displacementSprite.scale.y = 0;
	        displacementSprite.scale.x = 0;
            let stage = new PIXI.Container();
	        stage.addChild(displacementSprite);

            stage.addChild(preview);
            playground.displacementSprite = displacementSprite;
            displacementFilter.autoFit = false
            playground.displacementFilter = displacementFilter;
            playground.stage = stage;
            
            playgrounds.push(playground);
            animate();
        })
    }
    let raf;

    let animate = () =>{
        raf = requestAnimationFrame(animate);
        playgrounds.map(item => {
            // item.displacementSprite.scale.x += Math.sin(item.displacementSprite.scale.x);
            // item.displacementSprite.scale.y += Math.sin(item.displacementSprite.scale.y);
            item.stage.filters = [item.displacementFilter];

            item.renderer.render(item.stage);
            
        });
        

    }
    
    return (
        <div id="findMore" ref={findRef}>
           <div className="dragg-area"> {
                list.map((item, index)=>{
                    return <a href={item.url} key={index}>
                        <div className={item.type}>
                            <div className="thumb">
                                <span>{item.language}</span>
                            </div>
                            <div className="info">
                                <p className="author">{item.author}</p>
                                <p className="title">{item.title}</p>
                            </div>
                        </div>
                    </a>
                })
            }
            </div>
        </div>
    );
};
export default FindOutMore;