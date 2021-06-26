import React, { Component } from 'react';
import gsap from 'gsap';
import ScrollMagic from 'scrollmagic';
import THREE from '../3d/three';
//3d materials
import yellowPhong from '../3d/materials/yellowPhong';
import bluePhong from '../3d/materials/bluePhong';
import floor from '../3d/utils/floor';
import magentaDirectionalLight from '../3d/utils/lights/directionalLight--magenta';
import yellowHemiLight from '../3d/utils/lights/hemisphereLight--yellow';
import camera from '../3d/utils/camera';
//3d tools
import resizeRendererToDisplaySize from '../3d/utils/resizeRendererToDisplaySize';
//texts
import texts from '../dictionary/en.json';
//helpers
import AnimatedText, { animateComponentText } from './components/AnimatedText';
import ScrollDown from '../objects/ScrollDown';
import overwriteProps from '../helpers/overwriteProps';
class DressesSequence extends Component {
  constructor(props) {
    super();
    this.renderer = props.renderer;
    this.camera = camera;
    this.models = [];
    this.mixers = [];
    this.actions = [];
    this.loader = null;
    this.t = 0;
    this.state = {
      shouldAnimate: false,
      shouldAnimateDesc: false,
      sectionRef: null
    };

  }
  componentDidMount = () => {
    this.twentyRef = React.createRef();
    this.dressesDescRef = React.createRef();
    this.dressesHeadRef = React.createRef();
    this.buttonRef = React.createRef();
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this._isMounted = true;
  }
  componentWillUnmount = () => {
    this.twentyRef = null;
    this.dressesDescRef = null;
    this.dressesHeadRef = null;
    this.buttonRef = null;
    this.scene = null;
    this.clock = null;
    this._isMounted = false;
    this.props.onUnmount();
  }
  //run scene on load section
  onSectionLoad = node => {
    this.setState({
      sectionRef: node
    }, () => this.runScene())
  }
  //run scene
  runScene = () => {
    this.init();
    this.update();
    this.onScroll();
  }

  //scene handlers:

  //scroll actions
  onScroll = () => {
    let scene = new ScrollMagic.Scene({
      duration: "60%",
      offset: 100,
      triggerElement: this.state.sectionRef
    })
      .on('leave', () => {
        scene.remove();
      })
      .addTo(this.props.controller);
  }
  animateScene = () => {
    let timeline = gsap.timeline();
    this.mixers[0].addEventListener('finished', e => {
      timeline.to(this.dressesHeadRef.current, {
        duration: 0.2,
        onComplete: () => {
          this.setState({
            shouldAnimate: true
          }, () => {
            animateComponentText(this.dressesHeadRef.current);
          })
        },
      });
      timeline.to(this.twentyRef, {
        duration: .3,
        opacity: 1,
        onStart: () => {
          this.models.forEach((model, index) => {
            if (index !== 2) {
              model.traverse(o => {
                if (o.isMesh) {
                  o.material = bluePhong
                }
              });
            };
          });
        }
      }, "+=2");
      timeline.to(this.dressesDescRef.current, {
        duration: 0.2,
        onComplete: () => {
          this.setState({
            shouldAnimateDesc: true
          }, () => {
            animateComponentText(this.dressesDescRef.current);
          })
        },
      });
      timeline.to(this.buttonRef, {
        duration: 1,
        opacity: 1
      });
    });
  }
  //initialize the models
  init = () => {
    this.scene.fog = new THREE.Fog(0x000000, 80, 100);

    //camera
    this.camera.position.x = 0;
    this.camera.position.y = -3;
    this.camera.position.z = 30;
    //lights
    // Add hemisphere light to scene
    this.scene.add(yellowHemiLight);
    // Add directional Light to scene
    this.scene.add(magentaDirectionalLight);
    // Floor
    this.scene.add(floor);
    //upload the model
    const modelPath = '../3d/models/dress_slide.fbx';
    this.loader = new THREE.FBXLoader();
    this.loader.load(
      modelPath,
      obj => this.creationFuntion(obj)
      , undefined,
      function (error) {
        console.error(error);
      }
    );
  }
  //create the models
  creationFuntion = (function (obj) {
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
    this.models.push(model);
    for (let i = 0; i < 4; i++) {
      let newModel = model.clone();
      newModel.position.x = model.position.x - 4 * (i + 1);
      this.models.push(newModel);
    }
    this.models.forEach(model => {
      this.scene.add(model);
      this.mixers.push(new THREE.AnimationMixer(model));
    })

    let fileAnimations = obj.animations;
    let anim = fileAnimations[0];
    anim.optimize();

    let modified = {
      loop: THREE.LoopOnce,
      clampWhenFinished: true,
      timeScale: 4
    }
    this.mixers.forEach(mixer => {
      this.actions.push(
        overwriteProps(
          mixer.clipAction(anim),
          modified
        )
      )
    })
    this.actions.forEach(action => {
      action.play();
    });
    this.animateScene();
  }).bind(this);
  //animation update
  update = () => {
    if (!this._isMounted) return;
    if (resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
    if (magentaDirectionalLight) {
      magentaDirectionalLight.position.x = -5 * Math.cos(Date.now() / 1400);
      magentaDirectionalLight.position.z = -30 * Math.sin(Date.now() / 1400);
    }

    let delta = this.clock.getDelta();
    if (this.mixers.length !== 0) {
      for (let i = 0, l = this.mixers.length; i < l; i++) {
        this.mixers[i].update(delta);
      }
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.update);
  }


  render() {
    return <div id="dressesSequence" ref={this.onSectionLoad}>
      <AnimatedText
        id="dressesHeadline"
        ref={this.dressesHeadRef}
        animatedText={
          [{
            shouldAnimate: this.state.shouldAnimate,
            text: texts.dressesSequence.headline
          }]
        }
      />
      <div id="twenty" ref={ref => this.twentyRef = ref}>20%</div>
      <AnimatedText
        id="dressesDesc"
        ref={this.dressesDescRef}
        animatedText={
          [{
            shouldAnimate: this.state.shouldAnimateDesc,
            text: texts.dressesSequence.description
          }]
        }
      />
      <div ref={ref => this.buttonRef = ref} className="show-up" >
        <ScrollDown />
      </div>

    </div>
  }
}

export default DressesSequence;