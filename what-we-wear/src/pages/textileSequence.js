import React, {Component} from 'react';
import THREE from '../3d/three';
import {TimelineMax, TweenLite} from 'gsap';
import ZoomInButton from '../objects/ZoomInButton';
import ZoomOutButton from '../objects/ZoomOutButton';
class TextileSequence extends Component{
    constructor(props){
        super(props);
        this.state = {
            sectionRef: false
        }
        this.canvasRef = React.createRef();
        this.inRef = React.createRef();
        this.outRef = React.createRef();
        this.clock = new THREE.Clock();
        this.loader = new THREE.FBXLoader();
        this.mesh = null;
        this.dummy = new THREE.Object3D();
        this.amount = 15;
        this.isOver = false;
    }
    onSectionLoad = node => {
        this.setState({
            sectionRef: node
        }, ()=> {
            this.init();
            this.update();
            TweenLite.to(this.outRef, 1, {
                opacity: 1
            })
        }
        );
    }
    init=() =>{
        const canvas = this.canvasRef.current;
        //scene
        this.scene = new THREE.Scene();
        //renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.shadowMap.enabled = true;
     this.state.sectionRef.replaceChild(this.renderer.domElement, this.state.sectionRef.getElementsByTagName('canvas')[0]);
        //camera
        this.camera = new THREE.PerspectiveCamera(
            30,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
          );

          this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
      
            this.count = Math.pow(this.amount, 2);
            //controls.update() must be called after any manual changes to the camera's transform
            this.camera.position.set( 0 , 0, 10 );
            this.controls.maxDistance = 20;
            this.controls.maxZoom = 200;
            this.controls.minDistance = 2;
            this.controls.update();
          //lights
          let hemiLight = new THREE.HemisphereLight(0xffffff,  0.99);
            hemiLight.position.set(100, 50, 100);
            // Add hemisphere light to scene
            this.scene.add(hemiLight);
            const modelPath = '../3d/models/th.fbx';
            var creationFuntion=(function(obj){
                let model = obj;
            
                this.createInstancedMesh(model.children[0].geometry);
                
            }).bind(this);
            this.loader.load(
                modelPath,
                obj => {creationFuntion(obj);
                
                }
                ,undefined,
                function(error) {
                    console.error(error);
                }
            );
    }
    createInstancedMesh = (geometry) => {
        var mat1 = new THREE.MeshPhongMaterial( 
            { 
                color: 0xE29300, 
                specular: 0xE29380     
         } );
        this.mesh = new THREE.InstancedMesh(geometry, mat1, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.mesh.position.set(7,5,0);
    
        this.scene.add(this.mesh);
    }
    update=()=>{
        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
          }

            
          let delta = performance.now();
        this.controls.update();
         if ( this.mesh ) {
            var i = 0;
            var offset = ( this.amount - 2 ) / 10;
            for ( var x = 0; x < this.amount; x ++ ) {
                for ( var y = 0; y < this.amount; y ++ ) {
                    if(i % 2 === 0){
                        this.dummy.rotation.z = Math.PI/2;
                        this.dummy.position.set(2+ Math.sin(delta * 0.00005 + Math.random()/100)  , Math.sin(offset*delta*0.0005)-y, 0);
                    }else{
                        this.dummy.rotation.z = 0;
                        this.dummy.position.set(offset *Math.sin(delta * 0.0005 + Math.random()/100) - x, -20, 0);
                    }                      
                        this.dummy.updateMatrix();
                        this.mesh.setMatrixAt( i ++, this.dummy.matrix );
                }
            }
            this.mesh.instanceMatrix.needsUpdate = true;
       }
       this.zoom = this.controls.target.distanceTo( this.controls.object.position )
       if(Math.round(this.zoom) === this.controls.maxDistance){
        TweenLite.to(this.outRef, 1, {
            opacity: 0
        })
        TweenLite.to(this.inRef, 1, {
            opacity: 1
        })
    }
       if(Math.round(this.zoom) === this.controls.minDistance ){
          if(!this.isOver){
              this.props.nextScene();
          }
          this.isOver=true;
       }
       if(Math.round(this.zoom) === this.controls.maxDistance ){
        if(!this.isOver){
            this.props.prevScene();
        }
        this.isOver=true;
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
    render = () => {
        return <div id="textileSequence" ref={this.onSectionLoad}>
            <canvas ref={ref=>this.canvasRef = ref}></canvas>
            <div ref={ref=>this.inRef = ref} className="show-up">
                <ZoomInButton />
            </div>
            <div ref={ref=>this.outRef = ref} className="show-up">
                 <ZoomOutButton />
            </div>
        </div>;
    }
}
export default TextileSequence;