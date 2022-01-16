import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import THREE from '3d/three';
//3d materials
import yellowPhong from '3d/materials/yellowPhong';
import bluePhong from '3d/materials/bluePhong';
import floor from '3d/utils/floor';
import magentaDirectionalLight from '3d/utils/lights/directionalLight--magenta';
import yellowHemiLight from '3d/utils/lights/hemisphereLight--yellow';
import camera from '3d/utils/camera';
//3d tools
import resizeRendererToDisplaySize from '3d/utils/resizeRendererToDisplaySize';
//texts
import texts from 'dictionary/en.json';
//helpers
import AnimatedText from '../components/AnimatedText';
import NextButton from 'objects/NextButton';
import overwriteProps from 'helpers/overwriteProps';
const DressesSequence = (props) => {
  const { renderer, onUnmount, nextScene } = props
  const sectionRef = useRef(null)
  const twentyRef = useRef(null)
  const dressesDescRef = useRef(null)
  const dressesHeadRef = useRef(null)
  const buttonRef = useRef()

  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [shouldAnimateDesc, setShouldAnimateDesc] = useState(false)

  const models = [];
  const mixers = [];
  const actions = [];
  let scene, clock, loader
  let _isMounted = false
  useEffect(() => {
    scene = new THREE.Scene()
    clock = new THREE.Clock()
    _isMounted = true
    return () => {
      scene = null;
      clock = null;
      _isMounted = false;
      onUnmount()
    }
  }, [])

  useEffect(() => {
    if (sectionRef) runScene()
  }, [sectionRef])

  //run scene
  const runScene = () => {
    init();
    update();
  }
  //scene handlers:
  const animateScene = () => {
    let timeline = gsap.timeline();
    mixers[0].addEventListener('finished', e => {
      timeline.to(dressesHeadRef.current, {
        duration: 0.2,
        onComplete: () => {
          setShouldAnimate(true)
        },
      });
      timeline.to(buttonRef.current, {
        duration: 1,
        opacity: 1
      });
    })
  }
  useEffect(() => {
    if (!shouldAnimateDesc) return
    gsap.to(twentyRef.current, {
      duration: .3,
      opacity: 1,
      onStart: () => {
        models.forEach((model, index) => {
          if (index !== 2) {
            model.traverse(o => {
              if (o.isMesh) {
                o.material = bluePhong
              }
            });
          };
        });
      }
    });
  }, [shouldAnimateDesc])
  //initialize the models
  const init = () => {
    scene.fog = new THREE.Fog(0x000000, 80, 100);

    //camera
    camera.position.x = 0;
    camera.position.y = -3;
    camera.position.z = 30;
    //lights
    // Add hemisphere light to scene
    scene.add(yellowHemiLight);
    // Add directional Light to scene
    scene.add(magentaDirectionalLight);
    // Floor
    scene.add(floor);
    //upload the model
    const modelPath = '3d/models/dress_slide.fbx';
    loader = new THREE.FBXLoader();
    loader.load(
      modelPath,
      obj => creationFuntion(obj)
      , undefined,
      function (error) {
        console.error(error);
      }
    );
  }
  //create the models
  const creationFuntion = (function (obj) {
    let model = obj;
    model.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.material = yellowPhong;
      }
    });
    // Set the models initial scale
    model.scale.set(.5, .5, .5);
    model.position.y = -10;
    model.position.x = -10;
    models.push(model);
    for (let i = 0; i < 4; i++) {
      let newModel = model.clone();
      newModel.position.x = model.position.x - 4 * (i + 1);
      models.push(newModel);
    }
    models.forEach(model => {
      scene.add(model);
      mixers.push(new THREE.AnimationMixer(model));
    })

    let fileAnimations = obj.animations;
    let anim = fileAnimations[0];
    anim.optimize();

    let modified = {
      loop: THREE.LoopOnce,
      clampWhenFinished: true,
      timeScale: 4
    }
    mixers.forEach(mixer => {
      actions.push(
        overwriteProps(
          mixer.clipAction(anim),
          modified
        )
      )
    })
    actions.forEach(action => {
      action.play();
    });
    animateScene();
  }).bind(this);
  //animation update
  const update = () => {
    if (!_isMounted) return;
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    if (magentaDirectionalLight) {
      magentaDirectionalLight.position.x = -5 * Math.cos(Date.now() / 1400);
      magentaDirectionalLight.position.z = -30 * Math.sin(Date.now() / 1400);
    }

    let delta = clock.getDelta();
    if (mixers.length !== 0) {
      for (let i = 0, l = mixers.length; i < l; i++) {
        mixers[i].update(delta);
      }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }

  return <div id="dressesSequence" ref={sectionRef}>
    <AnimatedText
      id="dressesHeadline"
      ref={dressesHeadRef}
      shouldAnimate={shouldAnimate}
      text={texts.dressesSequence.headline}
      onAnimationEnd={() => setShouldAnimateDesc(true)}
    />
    {shouldAnimateDesc && (<div id="twenty" ref={twentyRef}>20%</div>)}
    <AnimatedText
      id="dressesDesc"
      ref={dressesDescRef}
      shouldAnimate={shouldAnimateDesc}
      text={texts.dressesSequence.description}
    />
    <div ref={buttonRef} className="show-up" >
      <NextButton onClick={nextScene} />
    </div>

  </div>

}

export default DressesSequence;