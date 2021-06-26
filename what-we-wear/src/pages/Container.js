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
import NextButton from 'objects/NextButton';

function Container({ location, controller, renderer }) {

  const routes = ["/", "/too-old", "/too-cheap", "/too-weak", "/too-toxic", "/to-trash", "/find-out-more"];
  const currentScreen = routes.indexOf(location.pathname);
  const [currentIndex, setCurrentIndex] = useState(currentScreen);
  const { state } = location;
  const previousScreen = state ? state.previousScreen : 0;
  const animationClassNames = currentScreen > previousScreen ? 'fade-out' : 'fade-in';
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

  const emptyRenderer = () => {
    renderer.clear();
  }
  const sequenceProps = {
    controller,
    onUnmount: emptyRenderer,
    renderer,
    nextScene,
    prevScene
  }
  return (<TransitionGroup
    className="transition-group"
    childFactory={child => React.cloneElement(child, {
      classNames: animationClassNames,
    })}>
    <CSSTransition key={location.key}
      appear={true}
      timeout={{ enter: 600, exit: 600, appear: 600 }}
      classNames={`${animationClassNames} fade`}>
      <section className={`route-section section-nr-${currentScreen}`}>
        <Switch location={location}>
          <Route exact path={routes[0]} component={() => <DressesSequence {...sequenceProps} />} />
          <Route path={routes[1]} component={() => <ExplosionsSequence {...sequenceProps} />} />
          <Route path={routes[2]} component={() => <SweatshopsSequence {...sequenceProps} />} />
          <Route path={routes[3]} component={() => <TextileSequence {...sequenceProps} />} />
          <Route path={routes[4]} component={() => <SubstanceSequence {...sequenceProps} />} />
          <Route path={routes[5]} component={() => <TrashSequence {...sequenceProps} />} />
          <Route path={routes[6]} component={() => <FindOutMore {...sequenceProps} />} />
        </Switch>
      </section>
    </CSSTransition>
  </TransitionGroup>
  )
}

export default withRouter(Container);