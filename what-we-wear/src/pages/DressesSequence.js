import React, {Component} from 'react';
import {TweenMax, Expo, TimelineMax} from 'gsap/all';
import ScrollMagic from 'scrollmagic';
import texts from '../dictionary/en.json';
import THREE from '../3d/three';
import FBXLoader from '../3d/fbxloader';
require("../helpers/scrollmagicdebug.js");
class DressesSequence extends Component {
    constructor(props){
        super(props);
        this.scene = null; 
        this.renderer = null;
        this.camera = null;
        this.model = null;                              
        this.possibleAnims = null;                      // Animations found in our file
        this.mixer = null;                              // THREE.js animations mixer
        this.idle = null;  
        this.loader = null;                            // Idle, the default state our character returns to
        this.clock = new THREE.Clock();          // Used for anims, which run to a clock instead of frame rate 
    }
    componentDidMount(){
        this.init();
        this.update();
        var material = new THREE.MeshPhysicalMaterial(
            {
            metalness: 0.7,
            clearcoat: 0.9,
            clearcoatRoughness: 0.3,
            reflectivity: 0.8,
            color: 0Xffffff
            });
    }
    init = ()=>{
        const canvas = document.querySelector('#dressesSequence');
        const backgroundColor = 0xf1f1f1;
        //scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(backgroundColor);
        this.scene.fog = new THREE.Fog(backgroundColor, 60, 100);
        //renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);
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
          let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
            hemiLight.position.set(0, 50, 0);
            // Add hemisphere light to scene
            this.scene.add(hemiLight);

            let d = 8.25;
            let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
            dirLight.position.set(-8, 12, 8);
            dirLight.castShadow = true;
            dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
            dirLight.shadow.camera.near = 0.1;
            dirLight.shadow.camera.far = 1500;
            dirLight.shadow.camera.left = d * -1;
            dirLight.shadow.camera.right = d;
            dirLight.shadow.camera.top = d;
            dirLight.shadow.camera.bottom = d * -1;
            // Add directional Light to scene
            this.scene.add(dirLight);
            // Floor
            let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
            let floorMaterial = new THREE.MeshPhongMaterial({
            color: 0xeeeeee,
            shininess: 0,
            });

            let floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
            floor.receiveShadow = true;
            floor.position.y = -11;
            this.scene.add(floor);
            //upload the model
            const modelPath = '../3d/models/dress1_model.fbx';
            this.loader = new FBXLoader(); 
            this.loader.load(
                modelPath,
                function(obj) {
                    console.log(obj);
                    // this.model = obj.scene;
                    // this.scene.add(this.model);
                },undefined,
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
       return <div>
           <canvas id="dressesSequence"></canvas>
        </div>
    }
}

export default DressesSequence;