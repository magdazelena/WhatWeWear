import React, { useEffect } from 'react';
import { animateText } from '../../helpers/textAnimations';
import TextElement, { getTextTimeout } from './textElement';
const AnimatedText = React.forwardRef((props, ref) => {
    const onEnd = () => props.onAnimationEnd ? props.onAnimationEnd() : null

    useEffect(() => {
        if (!props.text && !props.onAnimationEnd) return
        const timeout = getTextTimeout(props.text) * 2500
        const timer = setTimeout(() => {
            onEnd()
            console.log('end')
        }, timeout);
        return () => clearTimeout(timer);
    }, [props.text])

    const renderMultine = () => (props.animatedText.map(item => (item.shouldAnimate && <TextElement key={item.text} text={item.text} />)))
    const renderSingleLine = () => (props.shouldAnimate && <TextElement text={props.text} />)
    return (<div id={props.id} ref={ref} className='text'>
        {props.animatedText ?
            renderMultine()
            : renderSingleLine()}
    </div>)
})
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