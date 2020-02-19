//via stackoverflow: https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily?page=1&tab=votes#tab-top
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};
function hasQuiet() {

    var cold = false,
    hike = function() {};
  
    try {
    var aid = Object.defineProperty({}, 'passive', {
    get: function() {cold = true}
    });
    window.addEventListener('test', hike, aid);
    window.removeEventListener('test', hike, aid);
    } catch (e) {}
  
    return cold;
  }

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

export function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, hasQuiet() ? {passive: false} : false);
  document.addEventListener('wheel', preventDefault, hasQuiet() ? {passive: false} : false); // Disable scrolling in Chrome
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

export function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, hasQuiet() ? {passive: false} : false);
    document.removeEventListener('wheel', preventDefault, hasQuiet() ? {passive: false} : false); // Enable scrolling in Chrome
    window.onmousewheel = document.onmousewheel = null; 
    window.onwheel = null; 
    window.ontouchmove = null;  
    document.onkeydown = null;  
}