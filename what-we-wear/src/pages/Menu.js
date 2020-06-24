import React, {useState, useRef} from 'react';
import {TimelineMax} from 'gsap';
import {animateText,  generateTextForAnimation} from '../helpers/textAnimations';
import {ReactComponent as Button} from '../images/button.svg';
import {menu} from "../dictionary/en.json";
export default function Menu(props){
    const [menuActive, setMenuActive] = useState('inactive');
    const [itemsVisible, setItemsVisible] = useState(false);
    const menuRef = useRef(null);
    let tl = new TimelineMax();
    let animateMenu = function(down){
        if(!menuRef) return;
        if(down){
            tl.to(menuRef.current, 0.5, {scale: 1, transformOrigin: '50% 0%', borderRadius: '100%'});
            tl.to(menuRef.current, 0.25, {borderRadius: '0%', onComplete: ()=>{
                setItemsVisible(true);
                [...menuRef.current.getElementsByTagName('li')].forEach(item=>{
                    [...item.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).play();
                    });
                })
            }}, '-=0.15'); 
        }else{
            setItemsVisible(false);
            tl.to(menuRef.current, 0.25, {transformOrigin: '50% 0%',borderRadius: '100%'});
            tl.to(menuRef.current, 0.5, {scale: 0,  borderRadius: '0%'}, "-=0.15");    
        }
    }
    let moveToScene = function(id){
        props.setScene(id);
        setMenuActive("inactive");
        animateMenu(false)
    }
    return <div id="menu">
        <div id="menu-button" onClick={()=>{setMenuActive(menuActive==="inactive"? "active":"inactive")
                                            animateMenu(menuActive==="inactive")
                                            }}>
            <Button />
            <p>{menuActive==="inactive"?"menu":"back"}</p>
        </div>
        <div id="menu-content" ref={menuRef} className={menuActive}>
            {itemsVisible && ( <ul id="main-menu">
                                <li onClick={()=>moveToScene(1)}>{generateTextForAnimation(menu.scene1.split(''))}</li>
                                <li onClick={()=>moveToScene(2)}>{generateTextForAnimation(menu.scene2.split(''))}</li>
                                <li onClick={()=>moveToScene(3)}>{generateTextForAnimation(menu.scene3.split(''))}</li>
                                <li onClick={()=>moveToScene(4)}>{generateTextForAnimation(menu.scene4.split(''))}</li>
                                <li onClick={()=>moveToScene(5)}>{generateTextForAnimation(menu.scene5.split(''))}</li>
                                <li onClick={()=>moveToScene(6)}>{generateTextForAnimation(menu.scene6.split(''))}</li>
                                <li onClick={()=>{
                                    window.scrollTo({top: window.innerHeight});
                                    setMenuActive('inactive');
                                    animateMenu(false)
                                    }}>{generateTextForAnimation(menu.findMore.split(''))}</li>
                            </ul>
            )}
            {itemsVisible && (<ul id="side-menu">
                <li onClick={()=>moveToScene(1)}>{generateTextForAnimation(menu.about.split(''))}</li>
                <li onClick={()=>moveToScene(1)}>{generateTextForAnimation(menu.resources.split(''))}</li>
            </ul>
            )}
        </div>
    </div>
}