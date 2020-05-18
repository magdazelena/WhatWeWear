import React from 'react';
import * as PIXI from 'pixi.js';
import {TweenMax, TimelineMax} from 'gsap';
import {Elastic} from 'gsap/all';
import list from '../helpers/resources.json';
import dictionary from '../dictionary/en.json';
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
            if(item.category == targ.id)
            TweenMax.to(item.displacementSprite.scale,{x:1.8*Math.random(), y:1.8, ease: ease}).duration(1);
        })
        return false;

    }
    let ease = Elastic.easeOut.config(1, 0.3);
    let distance = 0;
    var oldX = 0;
    let dragDiv = (e) => {
        if (!drag) {return};
        if (!e) { var e= window.event};
        distance = coordX+e.clientX-offsetX;
        targ.style.left=distance+'px';
        let direction = oldX <e.pageX ? -20: 20; //compare old X with new x to get direction
        mouseoverAnimation(targ, direction, distance);
        oldX = e.pageX; //reassign current X as "old" x
        return false;
    }
    let mouseoverAnimation = (targ, direction, distance) => {
        playgrounds.map(item => {
            if(item.category == targ.id){
                TweenMax.to(item.renderer.view, .5, 
                    {skewX: direction}); //skew in direction of the movement
                TweenMax.to(item.displacementSprite, 3, 
                    {rotation: 90+10*direction/distance*Math.random()}); //rotate texture slightly in direction of the movement
                TweenMax.to(item.displacementSprite.scale,2,
                    {x:Math.random()+direction/distance*Math.random(), 
                    y:1+direction/distance*Math.random(), //both values need to oscilate between 0 and 2 with some randomness
                     ease: ease});
            }
            
        })
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
        if(findRef.current){
            displacements();
          
        }    
            
    }
    const playgrounds = [];
    let displacements = () =>{
        const thumbs = findRef.current.getElementsByClassName('thumb');
            
        Array.from(thumbs).map((item, index) => {
            let playground = {}; //create an object for all the PIXI properties
            playground.renderer = PIXI.autoDetectRenderer({width: thumbs[index].offsetWidth, height: thumbs[index].offsetHeight, transparent:true}); //set up the renderer
            playground.renderer.autoResize = true;
            item.appendChild(playground.renderer.view); //append the renderer to a thumbnail - this will add the canvas element
            let tp = PIXI.Texture.from(item.dataset.path);  //get thumbnail texture path from list json object based on index of iteration
            
	        let preview = new PIXI.Sprite(tp); //create the main sprite
            preview.anchor.set(0.5);
            preview.width = playground.renderer.width;
            preview.height = playground.renderer.height;
            preview.x = playground.renderer.width / 2 ;
            preview.y = playground.renderer.height /2; 
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
            playground.category = item.dataset.category;
            playgrounds.push(playground);
            animate();
        })
    }


    let animate = () =>{
        requestAnimationFrame(animate);
        playgrounds.map(item => {
            item.stage.filters = [item.displacementFilter];
            item.renderer.render(item.stage);
        });
    }
    
    return (
        <div id="findMore" ref={findRef}>
            {dictionary.resources.map((title, index) => {
                return <div key={index}>
                    <h2>{title.title}</h2>
                    <div className="dragg-area" id={title.slug}> {
                        list.map((item, index)=>{
                            if(item.category == title.slug)
                                return <a href={item.url} key={index}>
                                    <div className={item.type}>
                                        <div className="thumb" data-path={item.thumb} data-category={item.category}>
                                            <span>{item.language}</span>
                                        </div>
                                        <div className="info">
                                            <p className="author">{item.author}</p>
                                            <p className="title">{item.title}</p>
                                        </div>
                                    </div>
                                </a>
                            return false;
                        })
                    }
                    </div>
                </div>
            })}
      
        </div>
    );
};
export default FindOutMore;