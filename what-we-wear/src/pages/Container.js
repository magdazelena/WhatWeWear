import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Route, Switch, useHistory, withRouter } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import _ from 'lodash';
import DressesSequence from './DressesSequence';
import ExplosionsSequence from './ExplosionsSequence';
import SweatshopsSequence from './SweatshopsSequence';
import TextileSequence from './TextileSequence';
import FindOutMore from './FindOutMore';
import TrashSequence from './TrashSequence';
import SubstanceSequence from './SubstanceSequence';


function Container({ location, controller, renderer }) {

  const routes = ["/", "/too-old", "/too-cheap", "/too-weak", "/too-toxic", "/to-trash", "/find-out-more"];
  const currentScreen = routes.indexOf(location.pathname);
  const [currentIndex, setCurrentIndex] = useState(currentScreen);
  const { state } = location;
  const previousScreen = state ? state.previousScreen : 0;
  const animationClassNames = currentScreen > previousScreen ? 'slide-down' : 'slide-up';
  const history = useHistory();

  const nextScene = () => {
    setCurrentIndex(prevIndex => prevIndex + 1);
    history.push({
      pathname: routes[currentIndex + 1],
      state: { previousScreen: currentScreen }
    })
  }
  const prevScene = () => {
    setCurrentIndex(prevIndex => prevIndex - 1);
    history.push({
      pathname: routes[currentIndex - 1],
      state: { previousScreen: currentScreen }
    })
  }
  useLayoutEffect(() => {
    let initPos;
    let isScrollingDown = false;
    const switchScenes = (e) => {
      console.log(e)
      if (e.touches) {
        isScrollingDown = initPos > e.changedTouches[0].clientY;
      } else {
        isScrollingDown = Math.sign(e.deltaY) > 0;
      }
      if (isScrollingDown) {
        if (currentIndex < routes.length - 1 && currentIndex >= 0) nextScene()
      } else {
        if (currentIndex > 0) prevScene()
      }
    };
    const onWheel = _.debounce(switchScenes, 200);
    const getInitTouch = e => {
      initPos = e.touches[0].clientY;
    }
    window.addEventListener('wheel', onWheel);
    window.addEventListener('touchstart', getInitTouch)
    window.addEventListener('touchmove', onWheel);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onWheel);
      window.removeEventListener('touchstart', getInitTouch);
    }
    // eslint-disable-next-line
  }, [currentIndex, currentScreen]);
  const emptyRenderer = () => {
    renderer.clear();
  }
  return (<TransitionGroup
    className="transition-group"
    childFactory={child => React.cloneElement(child, {
      classNames: animationClassNames
    })}>
    <CSSTransition key={location.key}
      appear={true}
      timeout={{ enter: 600, exit: 600, appear: 600 }}
      classNames={`${animationClassNames} slide`}>
      <section className={`route-section section-nr-${currentScreen}`}>
        <Switch location={location}>
          <Route exact path={routes[0]} component={() => <DressesSequence controller={controller} onUnmount={emptyRenderer} renderer={renderer} />} />
          <Route path={routes[1]} component={() => <ExplosionsSequence controller={controller} onUnmount={emptyRenderer} renderer={renderer} />} />
          <Route path={routes[2]} component={() => <SweatshopsSequence controller={controller} onUnmount={emptyRenderer} renderer={renderer} nextScene={nextScene} />} />
          <Route path={routes[3]} component={() => <TextileSequence controller={controller} onUnmount={emptyRenderer} renderer={renderer} />} />
          <Route path={routes[4]} component={() => <SubstanceSequence controller={controller} onUnmount={emptyRenderer} renderer={renderer} />} />
          <Route path={routes[5]} component={() => <TrashSequence controller={controller} onUnmount={emptyRenderer} renderer={renderer} />} />
          <Route path={routes[6]} component={() => <FindOutMore controller={controller} onUnmount={emptyRenderer} renderer={renderer} />} />
        </Switch>
      </section>

    </CSSTransition>
  </TransitionGroup>
  )
}

export default withRouter(Container);