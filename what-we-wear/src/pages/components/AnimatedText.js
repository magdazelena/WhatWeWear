import React from 'react';
import { animateText } from '../../helpers/textAnimations';
import TextElement from './textElement';
const AnimatedText = React.forwardRef((props, ref) => (
    <div id={props.id} ref={ref} className='text'>
        {props.animatedText.map(item => (
            item.shouldAnimate && <TextElement text={item.text} />)
        )}

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