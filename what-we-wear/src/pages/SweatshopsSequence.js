import React, {Component} from 'react';
import THREE from '../3d/three';
import {MeshSurfaceSampler} from '../3d/meshSurfaceSampler';
import ScrollMagic from 'scrollmagic';
import texts from '../dictionary/en.json';
import {animateText,  generateTextForAnimation} from '../helpers/textAnimations';
import {TimelineMax} from 'gsap';

class SweatshopsSequence extends Component{
    constructor(props){
        super(props);
        this.state = {
            sectionRef : null,
            count: 1000
        }
        this.canvasRef = React.createRef();
        this.clock = new THREE.Clock();
        this._position = new THREE.Vector3();
        this._normal = new THREE.Vector3();
        this._scale = new THREE.Vector3();
        this.loader = new THREE.FBXLoader(); 
    }
    onSectionLoad = node => {
        this.setState({
            sectionRef : node
        },
        ()=>{
            this.ages = new Float32Array(this.state.count);
            this.scales = new Float32Array(this.state.count);
            this.init();
            this.createInstancing();
            this.update();
        })
    }
    init = () => {
        const canvas = this.canvasRef.current;
        //scene
        this.scene = new THREE.Scene();
        //renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.shadowMap.enabled = true;
        this.state.sectionRef.replaceChild(this.renderer.domElement, this.state.sectionRef.getElementsByTagName('canvas')[0]);
        //camera
        this.camera = new THREE.PerspectiveCamera(
            10,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
          );
          var axesHelper = new THREE.AxesHelper( 5 );
this.scene.add( axesHelper );
          this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

            //controls.update() must be called after any manual changes to the camera's transform
            this.camera.position.set( 0, 20, 100 );
            this.controls.update();
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
            const modelPath = '../3d/models/dress_float.fbx';
           
            var creationFuntion=(function(obj){
                let model = obj;
                var mat1 = new THREE.MeshPhongMaterial( 
                    { 
                        color: 0xE29300, 
                        skinning: true , 
                        morphTargets :true,
                        specular: 0xE29380     
                 } );
                 let basic = new THREE.MeshBasicMaterial({color: 'red'})
                model.traverse(o => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                    }
                });
                // Set the models initial scale
                //model.scale.set(.2, .2,  .2);
                model.position.set(0,-12,0);
                this.surface = model;
                  this.scene.add(this.surface);
                  this.mixer = new THREE.AnimationMixer(this.surface);
 
                let fileAnimations = obj.animations;
                let anim = fileAnimations[0];
                //anim.optimize();  
                this.action = this.mixer.clipAction(anim);
               this.action.play();
               
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
    createInstancing = () => {
        const machinePath = '../3d/models/maszyna.fbx';
        var creationFuntion=(function(obj){
            obj.name = "maszyna";
            let model = obj;
            console.log(model);
            this.modelGeometry = new THREE.InstancedBufferGeometry();
            THREE.BufferGeometry.prototype.copy.call( this.modelGeometry, obj.geometry );
            var defaultTransform = new THREE.Matrix4()
            .makeRotationX( Math.PI )
            .multiply( new THREE.Matrix4().makeScale( 7, 7, 7 ) );
            this.modelGeometry.applyMatrix4(defaultTransform);
            this.modelMaterial = model.material;
            // Assign random colors to the blossoms.
				var _color = new THREE.Color();
				var color = new Float32Array( this.state.count * 3 );
				var blossomPalette = [ 0xF20587, 0xF2D479, 0xF2C879, 0xF2B077, 0xF24405 ];

				for ( var i = 0; i < this.state.count; i ++ ) {

					_color.setHex( blossomPalette[ Math.floor( Math.random() * blossomPalette.length ) ] );
					_color.toArray( color, i * 3 );

                }
                this.modelGeometry.setAttribute('color', new THREE.InstancedBufferAttribute(color, 3));
                this.modelMaterial.vertexColors = true;

                this.modelMesh = new THREE.InstancedMesh(this.modelGeometry, this.modelMaterial, this.state.count);
                this.modelMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        }).bind(this);
        this.loader.load(
            machinePath,
            obj => creationFuntion(obj)
            ,undefined,
            function(error) {
                console.error(error);
            }
        );
    }
    resample = () => {
        const vertexCount = this.surface.geometry.getAttribute('position').count;
        this.sampler = new MeshSurfaceSampler(this.surface)
                        .setWeightAttribute(null)
                        .build();
        for( let i =0; i< this.state.count; i++){
            this.ages[i] = Math.random();
            this.scales[i] = scaleCurve(this.ages[i]);
            this.resampleParticle(i);
        }
        this.modelMesh.instanceMatrix.needsUpdate = true;
    }
    resampleParticle = i => {
        this.sampler.sample(this._position, this._normal);
        this._normal.add(this._position);
        this.dummy.position.copy(this._position);
        this.dummy.scale.set( this.scales[ i ], this.scales[ i ], this.scales[ i ] );
        this.dummy.lookAt( this._normal );
        this.dummy.updateMatrix();

        this.modelMesh.setMatrixAt(i, this.dummy.matrix);

    }
    updateParticle = i => {
        this.ages[i] += 0.005;
        if(this.ages[i] >= 1){
            this.ages[i] = 0.001;
            this.scales[i] = scaleCurve( this.ages[i]);
            this.resampleParticle(i);
            return;
        }
        let prevScale = this.scales[i];
        this.scales[i] = scaleCurve(this.ages[i]);
        this._scale.set(this.scales[i]/prevScale,this.scales[i]/prevScale,this.scales[i]/prevScale);

        this.modelMesh.getMatrixAt(i, this.dummy.matrix);
        this.dummy.matrix.scale(this._scale);
        this.modelMesh.setMatrixAt(i, this.dummy.matrix);
    }
    update=()=>{
        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
          }
        //   if(this.dirLight){
        //      this.dirLight.position.x = -5 * Math.cos(Date.now() / 1400);
        //     this.dirLight.position.z = -30 * Math.sin(Date.now() / 1400);
        //   }
            
        let delta = this.clock.getDelta();
        if(this.mixer){
         this.mixer.update(delta);
        }
        this.controls.update();
        if(this.modelMesh){
            for(let i =0; i< this.state.count; i++){
                this.updateParticle(i);
            }
            this.modelMesh.instanceMatrix.needsUpdate = true;
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
    render(){
        return <div id="sweatshopsContainer" ref={this.onSectionLoad}>
            <canvas ref={ref=>this.canvasRef = ref}></canvas>
        </div>
    }
}

export default SweatshopsSequence;

//from three.js->examples->instancing
// Source: https://gist.github.com/gre/1650294
const easeOutCubic = function ( t ) {

    return ( -- t ) * t * t + 1;

};
// Scaling curve causes particles to grow quickly, ease gradually into full scale, then
// disappear quickly. More of the particle's lifetime is spent around full scale.
const scaleCurve = function ( t ) {

    return Math.abs( easeOutCubic( ( t > 0.5 ? 1 - t : t ) * 2 ) );

};