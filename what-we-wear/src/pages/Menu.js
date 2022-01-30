import React, { useState, useRef } from 'react';
import { TimelineMax } from 'gsap';
import { menu } from "../dictionary/en.json";
import AnimatedText from './components/AnimatedText';

export default function Menu(props) {
    const [menuActive, setMenuActive] = useState('inactive');
    const [itemsVisible, setItemsVisible] = useState(false);
    const menuRef = useRef(null);
    let tl = new TimelineMax();
    let animateMenu = function (down) {
        if (!menuRef) return;
        if (down) {
            tl.to(menuRef.current, { duration: 0.5, scale: 1, transformOrigin: '50% 0%', borderRadius: '100%' });
            tl.to(menuRef.current, {
                duration: 0.25,
                borderRadius: '0%', onComplete: () => {
                    setItemsVisible(true)
                }
            }, '-=0.15');
        } else {
            setItemsVisible(false);
            tl.to(menuRef.current, { duration: 0.25, transformOrigin: '50% 0%', borderRadius: '100%' });
            tl.to(menuRef.current, { duration: 0.5, scale: 0, borderRadius: '0%' }, "-=0.15");
        }
    }
    let moveToScene = function (id) {
        props.setScene(id);
        setMenuActive("inactive");
        animateMenu(false)
    }
    return <div id="menu">
        <div id="menu-button" onClick={() => {
            setMenuActive(menuActive === "inactive" ? "active" : "inactive")
            animateMenu(menuActive === "inactive")
        }}>
            <div id="menu-icon" className={menuActive}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <p>{menuActive === "inactive" ? "menu" : "back"}</p>
        </div>
        <div id="menu-content" ref={menuRef} className={menuActive}>
            {itemsVisible && (<ul id="main-menu">
                <li onClick={() => moveToScene(1)}><AnimatedText shouldAnimate={itemsVisible} text={menu.scene1} /></li>
                <li onClick={() => moveToScene(2)}><AnimatedText shouldAnimate={itemsVisible} text={menu.scene2} /></li>
                <li onClick={() => moveToScene(3)}><AnimatedText shouldAnimate={itemsVisible} text={menu.scene3} /></li>
                <li onClick={() => moveToScene(4)}><AnimatedText shouldAnimate={itemsVisible} text={menu.scene4} /></li>
                <li onClick={() => moveToScene(5)}><AnimatedText shouldAnimate={itemsVisible} text={menu.scene5} /></li>
                <li onClick={() => moveToScene(6)}><AnimatedText shouldAnimate={itemsVisible} text={menu.scene6} /></li>
                <li onClick={() => moveToScene(7)}><AnimatedText shouldAnimate={itemsVisible} text={menu.findMore} /></li>
            </ul>
            )}
            {itemsVisible && (<ul id="side-menu">
                <li onClick={() => moveToScene(1)}><AnimatedText shouldAnimate={itemsVisible} text={menu.about} /></li>
                <li onClick={() => moveToScene(1)}><AnimatedText shouldAnimate={itemsVisible} text={menu.resources} /></li>
            </ul>
            )}
        </div>
    </div>
}