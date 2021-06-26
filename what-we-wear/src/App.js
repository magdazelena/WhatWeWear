import React, { useEffect, useRef, useState } from 'react';
import './styles/base.scss';
import ScrollMagic from 'scrollmagic';
import LoadingApp from './pages/LoadingApp';
import Menu from './pages/Menu';

//3d tools
import renderer from './3d/utils/renderer';
import Container from './pages/Container';
const App = () => {
  const [introIsDone, setIntroDone] = useState(true);
  const sectionRef = useRef();
  const controller = new ScrollMagic.Controller();
  const canvasRef = useRef();

  useEffect(() => {
    if (sectionRef.current) {
      setup();
    }
  }, [sectionRef.current]);
  const markIntroDone = () => {
    setIntroDone(true);
  }
  const setup = () => {
    sectionRef.current.replaceChild(renderer.domElement, sectionRef.current.getElementsByTagName('canvas')[0]);
  }



  return (
    <div className="App" ref={sectionRef}>
      { introIsDone && (
        <canvas id="mainCanvas" ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
      )}
      { introIsDone && (<Menu />)}
      {!introIsDone && (<LoadingApp markIntroDone={markIntroDone} controller={controller} loading="true" />)}
      {introIsDone && (<Container controller={controller} renderer={renderer} />)}
    </div>
  );

}

export default App;
