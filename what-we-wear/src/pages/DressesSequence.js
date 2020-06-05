import React, {Component} from 'react';
import {TweenMax, Expo, TimelineMax} from 'gsap/all';
import ScrollMagic from 'scrollmagic';
import texts from '../dictionary/en.json';
import THREE from '../3d/three';
import {animateText, reanimateText, generateTextForAnimation} from '../helpers/textAnimations';
import FBXLoader from '../3d/fbxloader';
import dressFragmentShader from '../3d/shaders/dressFragmentShader';
import dressVertexShader from '../3d/shaders/dressVertexShader';
import ScrollDown from '../objects/ScrollDown';
require("../helpers/scrollmagicdebug.js");
class DressesSequence extends Component {
    constructor(props){
        super(props);
        this.canvasRef = React.createRef();
        this.twentyRef = React.createRef();
        this.dressesDescRef = React.createRef();
        this.dressesHeadRef = React.createRef();
        this.buttonRef = React.createRef();
        this.scene = null; 
        this.renderer = null;
        this.camera = null;
        this.models = [];
        this.mixers = [];                        
        this.possibleAnims = null;                      // Animations found in our file
        this.actions = []; 
        this.dirLight = null;
        this.loader = null;                            // Idle, the default state our character returns to
        this.clock = new THREE.Clock();          // Used for anims, which run to a clock instead of frame rate 
        this.t = 0;
        this.state ={
          shouldAnimate: false,
          shouldAnimateDesc: false,
          sectionRef: null
        }
    }
    onSectionLoad = node => {
      this.setState({
        sectionRef: node
      }, () => this.runScene())
    }
    runScene = () => {
      this.init();
      this.update();
     this.onScroll();
    }
   onScroll = () => {
    let scene = new ScrollMagic.Scene({
      duration: "60%",
      triggerElement: this.state.sectionRef
    })
    .addIndicators()
    .on('leave', () => {
      if(this.props.id =="1")
      this.props.nextScene();
      scene.remove();
    })
    .addTo(this.props.controller);
    }
    animateScene = ()=>{
      const mat2 = new THREE.MeshPhongMaterial( 
        { 
            color: 0x1d1c3a, 
            skinning: true , 
            morphTargets :true,
            specular: 0x009300,
            reflectivity: 0                  
        });
      let timeline = new TimelineMax();
      this.mixers[0].addEventListener('finished', e=>{
        timeline.to(this.dressesHeadRef, 0.2, {
          onComplete: ()=>{
              this.setState({
                shouldAnimate: true
              }, ()=>{
                [...this.dressesHeadRef.getElementsByTagName('span')].forEach((span, i)=>{
                    animateText(span, i).play();
                });
              })
          },
        });
        timeline.to(this.twentyRef, .3, {
          opacity: 1,
          onStart: ()=>{
            this.models.forEach((model, index)=> {
              
              if(index != 2){
                model.traverse(o=>{
                  if(o.isMesh){
                    o.material = mat2;
                  }
                })
              }
            })
          }
        }, "+=2");
        timeline.to(this.dressesDescRef, 0.2, {
          onComplete: ()=>{
              this.setState({
                shouldAnimateDesc: true
              }, ()=>{
                [...this.dressesDescRef.getElementsByTagName('span')].forEach((span, i)=>{
                  animateText(span, i).play();
              });
              })
          },
        });
        timeline.to(this.buttonRef, 1,{
          opacity: 1
        });
        
      })
      
      
                        
      
    }
    init = ()=>{
        const canvas = this.canvasRef.current;
        const backgroundColor = 0x1d1c3a;
        //scene
        this.scene = new THREE.Scene();
        //this.scene.background = new THREE.Color(backgroundColor);
        this.scene.fog = new THREE.Fog(0x000000, 80, 100);
        //renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        ///this.renderer.setPixelRatio(window.devicePixelRatio);
        this.state.sectionRef.replaceChild(this.renderer.domElement, this.state.sectionRef.getElementsByTagName('canvas')[0]);
        //camera
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
          );
          this.camera.position.z = 30 
          this.camera.position.x = 0;
          this.camera.position.y = -3;
          //lights
          let hemiLight = new THREE.HemisphereLight(0xffffff,  0.91);
            hemiLight.position.set(0, 50, 0);
            // Add hemisphere light to scene
            this.scene.add(hemiLight);

            let d = 8.25;
            this.dirLight = new THREE.DirectionalLight(0xffffff, 0.84);
            this.dirLight.position.set(8, 28, 18);
            this.dirLight.castShadow = true;
            this.dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
            this.dirLight.shadow.camera.near = 0.1;
            this.dirLight.shadow.camera.far = 1500;
            this.dirLight.shadow.camera.left = d * -1;
            this.dirLight.shadow.camera.right = d;
            this.dirLight.shadow.camera.top = d;
            this.dirLight.shadow.camera.bottom = d * -1;
            // Add directional Light to scene
            this.scene.add(this.dirLight);
            // Floor
            let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
            let floorMaterial = new THREE.MeshPhongMaterial({
                color: 0x000000
            });
            floorMaterial.opacity = 0;
            let floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
            floor.receiveShadow = true;
            floor.position.y = -11;
            this.scene.add(floor);
            //upload the model
            const modelPath = '../3d/models/dress_slide.fbx';
            this.loader = new THREE.FBXLoader(); 
            var creationFuntion=(function(obj){
                let model = obj;
                var mat1 = new THREE.MeshPhongMaterial( 
                    { 
                        color: 0xE29300, 
                        skinning: true , 
                        morphTargets :true,
                        specular: 0xE29380,
                        reflectivity: 0.8,
                        shininess: 20,                   
                 } );
                 
                model.traverse(o => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                        o.material = mat1;
                    }
                });
                // Set the models initial scale
                model.scale.set(.5, .5,  .5);
                model.position.y = -10;
                model.position.x = -10;
                this.models.push(model);
                for(let i =0; i<4; i++){
                    let newModel = model.clone();
                    newModel.position.x = model.position.x-4*(i+1);
                    this.models.push(newModel);
                }
                this.models.forEach(model=>{
                  this.scene.add(model);
                  this.mixers.push(new THREE.AnimationMixer(model));
                })
 
                let fileAnimations = obj.animations;
                let anim = fileAnimations[0];
                anim.optimize();  

                let modified = {
                  loop : THREE.LoopOnce,
                  clampWhenFinished : true,
                  timeScale : 4
                }
                this.mixers.forEach(mixer =>{
                  this.actions.push(
                    overwriteProps(
                      mixer.clipAction(anim),
                      modified
                    )
                  )
                })
                this.actions.forEach(action=>{
                  action.play();
                });
                this.animateScene();
            }).bind(this);
            this.loader.load(
                modelPath,
                obj => creationFuntion(obj)
                ,undefined,
                function(error) {
                    console.error(error);
                }
            );
            
    }
    update=()=>{
        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
          }
          if(this.dirLight){
             this.dirLight.position.x = -5 * Math.cos(Date.now() / 1400);
            this.dirLight.position.z = -30 * Math.sin(Date.now() / 1400);
          }
            
        let delta = this.clock.getDelta();
        if(this.mixers.length !== 0){
          for ( let i = 0, l = this.mixers.length; i < l; i ++ ) {
              this.mixers[ i ].update( delta );    
          }
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.update);
       
    }
    resizeRendererToDisplaySize=(renderer)=> {
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
    render () {
       return <div id="dressesSequence" ref={this.onSectionLoad}>
              <canvas  ref={ref=>this.canvasRef = ref} width={window.innerWidth} height={window.innerHeight}></canvas>
              <div id="dressesHeadline" ref={ref=>this.dressesHeadRef = ref}>
                {this.state.shouldAnimate && (generateTextForAnimation(texts.dressesSequence.headline.split('')))}
              </div>
              <div id="twenty" ref={ref=>this.twentyRef = ref}>20%</div>
                <div id="dressesDesc" ref={ref=>this.dressesDescRef=ref}>
                  { this.state.shouldAnimateDesc && (generateTextForAnimation(texts.dressesSequence.description.split('')))
                    
                  }
            </div>
            <div ref={ref=>this.buttonRef = ref} className="show-up">
                <ScrollDown  />
            </div>
            
        </div>
    }
}

export default DressesSequence;

let overwriteProps = (proto, object) => {
  Object.entries(object).map(entry => {
    proto[entry[0]] = entry[1];
  }) 
  return proto;
}