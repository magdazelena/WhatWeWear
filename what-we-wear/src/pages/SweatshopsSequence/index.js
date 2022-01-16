import React, { useEffect, useRef, useState } from 'react';
import THREE from '3d/three';
import { MeshSurfaceSampler } from '3d/meshSurfaceSampler';
import magentaDirectionalLight from '3d/utils/lights/directionalLight--magenta';
import yellowHemiLight from '3d/utils/lights/hemisphereLight--yellow';
import yellowPhong from '3d/materials/yellowPhong';
import resizeRendererToDisplaySize from '3d/utils/resizeRendererToDisplaySize';
import texts from 'dictionary/en.json';
import gsap from 'gsap';
import ZoomInButton from 'objects/ZoomInButton';
import ZoomOutButton from 'objects/ZoomOutButton';
import NextButton from 'objects/NextButton';
import camera from '3d/utils/camera';
import { scaleCurve } from 'helpers/tools';
import AnimatedText, { animateComponentText, deanimateComponentText } from 'pages/components/AnimatedText';

const SweatshopsSequence = (props) => {
  const { renderer, onUnmount, nextScene } = props
  const sectionRef = useRef()
  const count = 10000
  const [sixtyCounter, setSixtyCounter] = useState(1)
  const [centsCounter, setCentsCounter] = useState(60)
  const [outAnimation, setOutAnimation] = useState(false)
  const [inAnimation, setInAnimation] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [shouldAnimateDesc, setShouldAnimateDesc] = useState(false)
  const tenRef = useRef()
  const sixtyRef = useRef()
  const buttonRef = useRef()
  let _isMounted = false
  let references = {
    inRef: useRef(),
    outRef: useRef(),
    headlineRef: useRef(),
    descRef: useRef(),
  }
  const scene = new THREE.Scene();
  let zoom = 100;
  const tl = gsap.timeline();
  let _position, _normal, _scale, dummy, ages, scales, loader, sampler, machine, surface, modelMesh, controls

  useEffect(() => {
    _position = new THREE.Vector3();
    _normal = new THREE.Vector3();
    _scale = new THREE.Vector3();
    dummy = new THREE.Object3D();
    ages = new Float32Array(count);
    scales = new Float32Array(count);
    loader = new THREE.FBXLoader();

    sampler = null;
    machine = null;
    surface = null;
    modelMesh = null;
    _isMounted = true
    return () => {
      references = {};
      onUnmount();
      renderer.clear()
      _isMounted = false
    }
  }, [])

  useEffect(() => {
    if (sectionRef) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      init();
      update();
      gsap.to(references.outRef.current, {
        duration: .1,
        opacity: 1
      })
      tl.to(references.headlineRef.current, {
        duration: 0.5,
        onComplete: () => {
          setShouldAnimate(true)
        },
      });
      tl.to(references.descRef.current, {
        duration: 0.5,
        onComplete: () => {
          setShouldAnimateDesc(true)
        },
      });
    }
  }, [sectionRef])

  const init = () => {
    //camera
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 1000;
    controls.minDistance = 2;
    camera.position.set(0, 20, 100);
    controls.update();
    //lights
    // Add hemisphere light to scene
    scene.add(yellowHemiLight);
    // Add directional Light to scene
    scene.add(magentaDirectionalLight);
    const modelPath = '3d/models/dress_float.fbx';
    const machinePath = '3d/models/machine.fbx';
    var creationFuntion = (function (obj) {
      let model = obj;
      model.traverse(o => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          o.material = yellowPhong;
          o.material.side = THREE.DoubleSide;
          o.material.shadowSide = THREE.DoubleSide;
        }
      });

      //      model.position.set(10,-20,0);
      surface = model;

      scene.add(surface);
      createInstancing();
    })
    var machinecreationFuntion = (function (obj) {
      machine = obj;

    })
    loader.load(
      machinePath,
      obj => {
        machinecreationFuntion(obj);

      }
      , undefined,
      function (error) {
        console.error(error);
      }
    );
    loader.load(
      modelPath,
      obj => creationFuntion(obj)
      , undefined,
      function (error) {
        console.error(error);
      }
    );
  }
  const createInstancing = () => {
    const modelGeometry = new THREE.InstancedBufferGeometry();
    machine.children[4].frustumCulled = false;
    THREE.BufferGeometry.prototype.copy.call(modelGeometry, machine.children[4].geometry);
    var defaultTransform = new THREE.Matrix4()
      .makeRotationX(Math.PI)
      .multiply(new THREE.Matrix4().makeScale(1, 1, 1))
      .makeTranslation(-51, -1000, -50);
    modelGeometry.applyMatrix4(defaultTransform);
    const modelMaterial = new THREE.MeshLambertMaterial()
    // Assign random colors to the blossoms.
    var _color = new THREE.Color();
    var color = new Float32Array(count * 3);
    var blossomPalette = [0x62C1EA, 0x0a71e6, 0xf54983, 0xB5154A];

    for (var i = 0; i < count; i++) {

      _color.setHex(blossomPalette[Math.floor(Math.random() * blossomPalette.length)]);
      _color.toArray(color, i * 3);

    }
    modelGeometry.setAttribute('color', new THREE.InstancedBufferAttribute(color, 3));
    modelMaterial.vertexColors = true;

    modelMesh = new THREE.InstancedMesh(modelGeometry, modelMaterial, count);
    modelMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    modelMesh.instanceMatrix.needsUpdate = true;
    resample();


  }
  const resample = () => {
    sampler = new MeshSurfaceSampler(surface.children[0]).build();

    for (let i = 0; i < count; i++) {

      ages[i] = Math.random();
      scales[i] = scaleCurve(ages[i]);
      resampleParticle(i);

    }
    modelMesh.instanceMatrix.needsUpdate = true;
    scene.add(modelMesh);
  }
  const resampleParticle = i => {
    sampler.sample(_position, _normal);
    _normal.add(_position);
    dummy.position.copy(_position);

    dummy.scale.set(scales[i], scales[i], scales[i]);
    dummy.lookAt(_normal);
    dummy.updateMatrix();
    modelMesh.setMatrixAt(i, dummy.matrix);

  }
  const updateParticle = i => {
    ages[i] += 0.00005;
    if (ages[i] >= 1) {

      ages[i] = 0.001;
      scales[i] = scaleCurve(ages[i]);

      resampleParticle(i);
      return;
    }
    let prevScale = scales[i];
    scales[i] = scaleCurve(ages[i]);
    _scale.set(scales[i] / prevScale, scales[i] / prevScale, scales[i] / prevScale);

    modelMesh.getMatrixAt(i, dummy.matrix);
    dummy.matrix.scale(_scale);
    modelMesh.setMatrixAt(i, dummy.matrix);
  }
  let outUnanimated = true;
  let outAnimated = false;
  let inUnanimated = true;
  const animateZoomOut = function () {
    if (outUnanimated) {
      tl.to(references.headlineRef.current, {
        duration: 0.1,
        onComplete: () => {
          deanimateComponentText(references.headlineRef.current)
        }
      });
      tl.to(references.descRef.current, {
        duration: 0.1,
        onComplete: () => {
          deanimateComponentText(references.descRef.current)
        }
      });
      tl.to(references.headlineRef.current, {
        duration: 0.5,
        onComplete: () => {
          setOutAnimation(true)
          setInAnimation(false)
          setShouldAnimateDesc(false)
          setShouldAnimate(false)
        }
      });

    }
    outUnanimated = false;
    outAnimated = true;
  }
  const animateOut = function () {
    if (outAnimated) {
      gsap.to(references.outRef.current, {
        duration: 0.1,
        opacity: 0
      })
      gsap.to(references.inRef.current, {
        duration: 0.1,
        opacity: 1
      })
      tl.to(references.headlineRef.current, {
        duration: 0.1,
        onComplete: () => {
          deanimateComponentText(references.headlineRef.current)
        }
      });
      tl.to(references.descRef.current, {
        duration: 0.1,
        onComplete: () => {
          deanimateComponentText(references.descRef.current)
        }
      });
    }
    outAnimated = false;
  }
  const animateZoomIn = function () {
    if (inUnanimated) {
      let counter = { value: sixtyCounter };
      let ccounter = { value: centsCounter };
      var updateCounter = (value) => {
        setSixtyCounter(value)
      }
      var updatecCounter = (value) => {
        setCentsCounter(value)
      }
      tl.to(references.headlineRef.current, {
        duration: 0.5,
        onComplete: () => {
          setOutAnimation(false)
          setInAnimation(true)
          setShouldAnimateDesc(false)
          setShouldAnimate(false)
        }
      });
      tl.to('.dollars-cents', {
        duration: 2,
        fontSize: '8em',
        opacity: 1
      })
      tl.to(counter, {
        duration: 1,
        delay: 1,
        value: 60,
        roundProps: 'value',
        onUpdate: function () {
          updateCounter(counter.value)
        }
      }, "-=1")
      tl.to(ccounter, {
        duration: 1,
        value: 10,
        roundProps: 'value',
        onUpdate: function () {
          updatecCounter(ccounter.value)
        }
      })
      tl.to(buttonRef.current, {
        duration: 0.2,
        opacity: 1,
      })
    }
    inUnanimated = false;
  }
  const update = () => {
    if (!_isMounted) return
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    controls.update();
    zoom = controls.target.distanceTo(controls.object.position)
    if (modelMesh) {
      if (zoom > 200 && zoom < 1000) {
        if (!outAnimation && references.headlineRef) {
          animateZoomOut();
        }
      }
      for (let i = 0; i < count; i++) {
        updateParticle(i);
      }
      modelMesh.instanceMatrix.needsUpdate = true;
    }

    if (Math.round(zoom) >= controls.maxDistance - 400 && Math.round(zoom) < controls.maxDistance) {
      if (references.headlineRef && references.descRef)
        animateOut();
    }
    if (Math.round(zoom) > controls.minDistance && Math.round(zoom) <= 100) {
      if (!inAnimation && references.headlineRef) {
        animateZoomIn();
      }

    }
    renderer.render(scene, camera);
    requestAnimationFrame(update);

  }


  return <div id="sweatshopsContainer" ref={sectionRef}>
    <div ref={references.inRef} className="show-up">
      <ZoomInButton />
    </div>
    <div ref={references.outRef} className="show-up">
      <ZoomOutButton />
    </div>

    <AnimatedText
      id="sweatshopsHeadline"
      ref={references.headlineRef}
      animatedText={[
        {
          shouldAnimate: shouldAnimate,
          text: texts.sweatshopsSequence.headline
        },
        {
          shouldAnimate: outAnimation,
          text: texts.sweatshopsSequence.zoomOutheadline
        },
        {
          shouldAnimate: inAnimation,
          text: texts.sweatshopsSequence.zoomInheadline
        },
      ]
      }
    />
    <div id="sixty" className="dollars-cents text">
      {inAnimation && (<span><span ref={sixtyRef}>{sixtyCounter}</span>$</span>)}
    </div>
    <div id="ten" className="dollars-cents text">
      {inAnimation && (<span><span ref={tenRef}>{centsCounter}</span>c</span>)}
    </div>

    <AnimatedText
      id="sweatshopsDesc"
      ref={references.descRef}
      animatedText={[
        {
          shouldAnimate: shouldAnimateDesc,
          text: texts.sweatshopsSequence.description
        },
        {
          shouldAnimate: outAnimation,
          text: texts.sweatshopsSequence.zoomOutdescription
        },
        {
          shouldAnimate: inAnimation,
          text: texts.sweatshopsSequence.zoomIndescription
        },
      ]
      }
    />
    <div ref={buttonRef} className="show-up">
      <NextButton onClick={nextScene} />
    </div>
  </div>
}


export default SweatshopsSequence;

