import React from 'react';
import list from '../helpers/resources.json';
function FindOutMore(){
    let targ, coordX, coordY, offsetX, offsetY, drag;
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
        return false;

    }
    let dragDiv = (e) => {
        if (!drag) {return};
        if (!e) { var e= window.event};
        targ.style.left=coordX+e.clientX-offsetX+'px';
        return false;
    }
    let stopDrag =() =>{
        drag=false;
    }
    window.onload = () => {
        document.onmousedown = startDrag;
        document.onmouseup = stopDrag;
    }
        
    
    return (
        <div id="findMore">
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