import React from 'react';
import { animateText, generateTextForAnimation } from '../../helpers/textAnimations';
const AnimatedText = React.forwardRef((props, ref) => (
    <div id={props.id} ref={ref}>
        {props.animatedText.map(item => (
            item.shouldAnimate && (generateTextForAnimation(item.text.split('')))
        ))}
    </div>
));
export const animateComponentText = function (obj) {
    if (obj.getElementsByTagName('span').length > 0) {
        return [...obj.getElementsByTagName('span')].forEach((span, i) => {
            animateText(span, i).play();
        });
    }
    return false;
}
export const deanimateComponentText = function (obj) {
    if (obj.getElementsByTagName('span').length > 0) {
        return [...obj.getElementsByTagName('span')].forEach((span, i) => {
            animateText(span, i).reverse(0);
        });
    }
    return false;
}
export default AnimatedText;