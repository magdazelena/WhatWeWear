import React from 'react';
import * as PIXI from 'pixi.js';
import { TweenMax } from 'gsap';
import { Elastic } from 'gsap/all';
import list from '../helpers/resources.json';
import dictionary from '../dictionary/en.json';
import DragButton from '../objects/DragButton';
function FindOutMore(props) {
    let findRef = React.useRef(null);
    let canvasRef = React.useRef(null);
    let buttonRef = React.useRef(null);
    let renderer = null;
    // let buttonRef = React.useRef(null);
    let targ, coordX, offsetX, drag;
    let startDrag = (e) => {
        // determine event object
        if (!e) {
            e = window.event;
        }
        if (e.preventDefault) e.preventDefault();
        targ = e.target ? e.target : e.srcElement;
        if (targ.className !== 'dragg-area') { return };
        offsetX = e.clientX;
        if (!targ.style.left) { targ.style.left = '0px' };
        // properties
        coordX = parseInt(targ.style.left);
        drag = true;

        // move div element
        document.onmousemove = dragDiv;
        // playgrounds.map(item => {
        //     if (item.category === targ.id)
        //         TweenMax.to(item.displacementSprite.scale, { x: 1.8 * Math.random(), y: 1.8, ease: ease }).duration(1);
        //     return false;
        // })
        return false;

    }
    let ease = Elastic.easeOut.config(1, 0.3);
    let distance = 0;
    var oldX = 0;
    let dragDiv = (e) => {
        if (!drag) { return };
        if (!e) { e = window.event };
        distance = coordX + e.clientX - offsetX;
        targ.style.left = distance + 'px';
        let direction = oldX < e.pageX ? -20 : 20; //compare old X with new x to get direction
        //mouseoverAnimation(targ, direction, distance);
        oldX = e.pageX; //reassign current X as "old" x
        return false;
    }
    let mouseoverAnimation = (targ, direction, distance) => {
        playgrounds.map(item => {
            if (item.category === targ.id) {
                // TweenMax.to(item.parent, .5, 
                //     {skewX: direction}); //skew in direction of the movement
                TweenMax.to(item.displacementSprite, 3,
                    { rotation: 90 + 10 * direction / distance * Math.random() }); //rotate texture slightly in direction of the movement
                TweenMax.to(item.displacementSprite.scale, 2,
                    {
                        x: Math.random() + direction / distance * Math.random(),
                        y: 1 + direction / distance * Math.random(), //both values need to oscilate between 0 and 2 with some randomness
                        ease: ease
                    });
            }
            return false;
        })
    }
    let stopDrag = () => {
        // playgrounds.map(item => {
        //     //  TweenMax.to(item.preview, 1, {skewX: 0, ease: ease});
        //     TweenMax.to(item.displacementSprite.scale, 2, { x: 5, y: 5 })
        //     return false;
        // });
        drag = false;
    }

    window.onload = () => {
        document.onmousedown = startDrag;
        document.onmouseup = stopDrag;
        // if (findRef.current) {
        //     displacements();
        // }

    }
    const playgrounds = [];;
    let globalStage = new PIXI.Container();
    let displacements = function () {
        const thumbs = findRef.current.getElementsByClassName('thumb');
        renderer = PIXI.autoDetectRenderer({ width: window.innerWidth, height: window.innerHeight, transparent: true, view: canvasRef.current })
        Array.from(thumbs).map((item, index) => {
            let playground = {}; //create an object for all the PIXI properties
            playground.renderer = renderer; //set up the renderer
            playground.renderer.autoResize = true;
            let tp = PIXI.Texture.from(item.dataset.path);  //get thumbnail texture path from list json object based on index of iteration

            let preview = new PIXI.Sprite(tp); //create the main sprite
            preview.alpha = .2;
            preview.anchor.set(0.5);
            preview.width = thumbs[index].offsetWidth;
            preview.height = thumbs[index].offsetHeight;
            preview.x = thumbs[index].getBoundingClientRect().left + thumbs[index].offsetWidth / 2;
            preview.y = thumbs[index].getBoundingClientRect().top - findRef.current.getBoundingClientRect().top + thumbs[0].offsetHeight / 2;
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
            globalStage.addChild(stage);
            playground.parent = thumbs[index];
            playgrounds.push(playground);
            animate();
            resize();
            return false;
        })
    }


    let animate = () => {
        requestAnimationFrame(animate);
        playgrounds.map(item => {
            item.stage.filters = [item.displacementFilter];
            item.preview.x = item.parent.getBoundingClientRect().left + item.parent.offsetWidth / 2;
            return false;
        });
        if (renderer)
            renderer.render(globalStage);
        if (findRef.current) {
            if (findRef.current.getBoundingClientRect().top > window.innerHeight + 500) {
                buttonRef.current.style.display = "none";
            } else {
                buttonRef.current.style.display = "block";
            }
        }
    }
    function resize() {
        // if (window.innerWidth / window.innerHeight >= ratio) {
        //     var w = window.innerHeight * ratio;
        //     var h = window.innerHeight;
        // } else {
        //     var w = window.innerWidth;
        //     var h = window.innerWidth / ratio;
        // }
        if (renderer) {
            renderer.view.style.width = window.innerWidth + 'px';
            renderer.view.style.height = window.innerHeight + 'px';
        }
    }
    window.onresize = resize;
    return (
        <div id="findMore" ref={findRef}>
            <canvas ref={canvasRef} className="dummy-canvas" style={{ zIndex: -1 }}></canvas>
            {dictionary.resources.map((title, index) => {
                return <div key={index} style={{ zIndex: 2222 }}>
                    <h1>{title.title}</h1>
                    <div className="dragg-area" id={title.slug} style={{ zIndex: 2222 }}> {
                        list.map((item, index) => {
                            if (item.category === title.slug)
                                return <a href={item.url} key={index}>
                                    <div className={item.type}>
                                        <div className="thumb" data-path={item.thumb} data-category={item.category} >

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
            <div ref={buttonRef}>
                <DragButton buttonId="drag-info" />
            </div>
        </div>
    );
};
export default FindOutMore;