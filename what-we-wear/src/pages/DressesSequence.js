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
//3d tools
import camera from '../3d/utils/camera';
import renderer from '../3d/utils/renderer';
//texts
import texts from '../dictionary/en.json';
//helpers
import { animateText, generateTextForAnimation } from '../helpers/textAnimations';
import ScrollDown from '../objects/ScrollDown';
import overwriteProps from '../helpers/overwriteProps';
class DressesSequence extends Component {
  constructor() {
    super();
    this.canvasRef = React.createRef();
    this.twentyRef = React.createRef();
    this.dressesDescRef = React.createRef();
    this.dressesHeadRef = React.createRef();
    this.buttonRef = React.createRef();
    this.scene = null;
    this.renderer = renderer;
    this.camera = camera;
    this.models = [];
    this.mixers = [];
    this.possibleAnims = null;                      // Animations found in our file
    this.actions = [];
    this.loader = null;                            // Idle, the default state our character returns to
    this.clock = new THREE.Clock();          // Used for anims, which run to a clock instead of frame rate 
    this.t = 0;
    this.state = {
      shouldAnimate: false,
      shouldAnimateDesc: false,
      sectionRef: null
    }
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
        this.props.nextScene();
        scene.remove();
      })
      .addTo(this.props.controller);
  }
  animateScene = () => {

    let timeline = gsap.timeline();
    this.mixers[0].addEventListener('finished', e => {
      timeline.to(this.dressesHeadRef, {
        duration: 0.2,
        onComplete: () => {
          this.setState({
            shouldAnimate: true
          }, () => {
            [...this.dressesHeadRef.getElementsByTagName('span')].forEach((span, i) => {
              animateText(span, i).play();
            });
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
      timeline.to(this.dressesDescRef, {
        duration: 0.2,
        onComplete: () => {
          this.setState({
            shouldAnimateDesc: true
          }, () => {
            [...this.dressesDescRef.getElementsByTagName('span')].forEach((span, i) => {
              animateText(span, i).play();
            });
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

    //scene
    this.scene = new THREE.Scene();
    //this.scene.background = new THREE.Color(backgroundColor);
    this.scene.fog = new THREE.Fog(0x000000, 80, 100);
    //replace canvas with renderer
    this.state.sectionRef.appendChild(this.renderer.domElement, this.state.sectionRef.getElementsByTagName('canvas')[0]);

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
      obj => creationFuntion(obj)
      , undefined,
      function (error) {
        console.error(error);
      }
    );
    //create the models
    var creationFuntion = (function (obj) {
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
  }
  update = () => {
    if (this.resizeRendererToDisplaySize(this.renderer)) {
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
  resizeRendererToDisplaySize = (renderer) => {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
      canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  render() {
    return <div id="dressesSequence" ref={this.onSectionLoad}>
      <canvas ref={ref => this.canvasRef = ref} width={window.innerWidth} height={window.innerHeight}></canvas>
      <div id="dressesHeadline" ref={ref => this.dressesHeadRef = ref}>
        {this.state.shouldAnimate && (generateTextForAnimation(texts.dressesSequence.headline.split('')))}
      </div>
      <div id="twenty" ref={ref => this.twentyRef = ref}>20%</div>
      <div id="dressesDesc" ref={ref => this.dressesDescRef = ref}>
        {this.state.shouldAnimateDesc && (generateTextForAnimation(texts.dressesSequence.description.split('')))

        }
      </div>
      <div ref={ref => this.buttonRef = ref} className="show-up" >
        <ScrollDown />
      </div>

    </div>
  }
}

export default DressesSequence;