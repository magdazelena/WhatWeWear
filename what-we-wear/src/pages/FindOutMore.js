import React from 'react';
import * as PIXI from 'pixi.js';
import {TweenMax, TimelineMax} from 'gsap';
import {Elastic} from 'gsap/all';
import list from '../helpers/resources.json';
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
            
            TweenMax.to(item.displacementSprite.scale,{x:1.8*Math.random(), y:1.8, ease: ease}).duration(1);
        })
        return false;

    }
    let distance = 0;
    let ease = Elastic.easeOut.config(1, 0.3);
    var oldX = 0;
    let dragDiv = (e) => {
        if (!drag) {return};
        if (!e) { var e= window.event};
        targ.style.left=coordX+e.clientX-offsetX+'px';
        distance = coordX+e.clientX-offsetX;
        let direction = oldX <e.pageX ? -20: 20;
        playgrounds.map(item => {
            TweenMax.to(item.renderer.view, .5, {skewX: direction});
            TweenMax.to(item.displacementSprite, 3, {rotation: 90+10*direction/distance*Math.random()});
            TweenMax.to(item.displacementSprite.scale,2,{x:Math.random()+direction/distance*Math.random(), y:1+direction/distance*Math.random(), ease: ease});
        })
        oldX = e.pageX;
        return false;
    }
    
    let stopDrag =() =>{
        playgrounds.map(item => {
            TweenMax.to(item.renderer.view, 1, {skewX: 0, ease: ease});
            TweenMax.to(item.displacementSprite.scale, 2, {x:5, y:5})
        });
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
            
            
            preview.anchor.set(0.5);
            preview.width = playground.renderer.width;
            preview.height = playground.renderer.height;
            preview.x = playground.renderer.width / 2 ;
            preview.y = playground.renderer.height / 2; 
            playground.preview = preview;
	        let displacementSprite = PIXI.Sprite.from('./images/wrinkles.jpg');
	        displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

	       	let displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);

	        displacementSprite.scale.y = 0;
            displacementSprite.scale.x = 0;
            displacementSprite.rotation = 90;
            let stage = new PIXI.Container();
	        stage.addChild(displacementSprite);

            stage.addChild(preview);
            playground.displacementSprite = displacementSprite;
            displacementFilter.autoFit = false;
            displacementFilter.padding = 50;
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
            //item.displacementSprite.rotation += 0.02;
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