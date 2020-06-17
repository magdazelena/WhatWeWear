import React, {Component} from 'react';
import THREE from '../3d/three';
import {MeshSurfaceSampler} from '../3d/meshSurfaceSampler';
import texts from '../dictionary/en.json';
import {animateText,  generateTextForAnimation} from '../helpers/textAnimations';
import {TimelineMax, TweenLite} from 'gsap';
import ZoomInButton from '../objects/ZoomInButton';
import ZoomOutButton from '../objects/ZoomOutButton';
class SweatshopsSequence extends Component{
    constructor(props){
        super(props);
        this.state = {
            sectionRef : null,
            count: 10000,
            sixtyCounter: 1,
            centsCounter: 60,
            outAnimation: false,
            inAnimation: false,
            shouldAnimate: false,
            shouldAnimateDesc: false
        }
        this.canvasRef = React.createRef();
        this.inRef = React.createRef();
        this.outRef = React.createRef();
        this.headlineRef = React.createRef();
        this.descRef = React.createRef();
        this.clock = new THREE.Clock();
        this._position = new THREE.Vector3();
        this._normal = new THREE.Vector3();
        this._scale = new THREE.Vector3();
        this.dummy = new THREE.Object3D();
        this.sampler = null;
        this.loader = new THREE.FBXLoader(); 
        this.machine = null;
        this.surface = null;
        this.ages = new Float32Array(this.state.count);
        this.scales = new Float32Array(this.state.count);
        this.modelMesh = null;
        this.zoom = 100;
        this.isOver = false;
        this.tl = new TimelineMax();
    }
    onSectionLoad = node => {
        this.setState({
            sectionRef : node
        },
        ()=>{
            window.scrollTo({top: 0, behavior: 'smooth'})
            this.init();
            this.update();
            TweenLite.to(this.outRef, 1, {
                opacity: 1
            })
            this.tl.to(this.headlineRef, .5, {
                onComplete: ()=>{
                    this.setState({
                      shouldAnimate: true
                    }, ()=>{
                      [...this.headlineRef.getElementsByTagName('span')].forEach((span, i)=>{
                          animateText(span, i).play();
                      });
                    })
                },
            });
            this.tl.to(this.descRef, .5, {
                onComplete: ()=>{
                    this.setState({
                      shouldAnimateDesc: true
                    }, ()=>{
                      [...this.descRef.getElementsByTagName('span')].forEach((span, i)=>{
                          animateText(span, i).play();
                      });
                    })
                },
            });
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

          this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
          this.controls.maxDistance = 1000;
          this.controls.minDistance = 2;
            this.camera.position.set( 0, 20, 100 );
            this.controls.update();
          //lights
          let hemiLight = new THREE.HemisphereLight(0xffffff,  0.99);
            hemiLight.position.set(100, 50, 100);
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
            const machinePath = '../3d/models/machine.fbx';
            var creationFuntion=(function(obj){
                let model = obj;
                var mat1 = new THREE.MeshPhongMaterial( 
                    { 
                        color: 0xE29300, 
                        specular: 0xE29380     
                 } );
                model.traverse(o => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                        o.material = mat1;
                        o.material.side = THREE.DoubleSide;
                        o.material.shadowSide = THREE.DoubleSide;
                    }
                });
                
          //      model.position.set(10,-20,0);
                this.surface = model;

                this.scene.add(this.surface);
                this.createInstancing();
            }).bind(this);
            this.loader.load(
                modelPath,
                obj => creationFuntion(obj)
                ,undefined,
                function(error) {
                    console.error(error);
                }
            );
            var machinecreationFuntion=(function(obj){
                this.machine = obj;
                
            }).bind(this);
            this.loader.load(
                machinePath,
                obj => {machinecreationFuntion(obj);
                    
                }
                ,undefined,
                function(error) {
                    console.error(error);
                }
            );
       
    }
    createInstancing = () => {
                this.modelGeometry = new THREE.InstancedBufferGeometry();
                this.machine.children[4].frustumCulled = false;
                THREE.BufferGeometry.prototype.copy.call(  this.modelGeometry , this.machine.children[4].geometry );
                var defaultTransform = new THREE.Matrix4()
                .makeRotationX( Math.PI )
                .multiply( new THREE.Matrix4().makeScale( 1, 1, 1 ) )
                .makeTranslation(-51,-1000,-50);
                this.modelGeometry.applyMatrix4(defaultTransform);
                this.modelMaterial = new THREE.MeshLambertMaterial()
                // Assign random colors to the blossoms.
                var _color = new THREE.Color();
                var color = new Float32Array( this.state.count * 3 );
                var blossomPalette = [ 0xDBBCBD, 0xA89797, 0xC44C4E, 0xEA3336, 0xC15557 ];

                for ( var i = 0; i < this.state.count; i ++ ) {
                    
                    _color.setHex( blossomPalette[ Math.floor( Math.random() * blossomPalette.length ) ] );
                    _color.toArray( color, i * 3 );

                }
               this.modelGeometry.setAttribute('color', new THREE.InstancedBufferAttribute(color, 3));
               this.modelMaterial.vertexColors = true;

                this.modelMesh = new THREE.InstancedMesh(this.modelGeometry, this.modelMaterial, this.state.count);
                this.modelMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
                this.modelMesh.instanceMatrix.needsUpdate = true;
                this.resample();
                
       
    }
    resample = () => {
        this.sampler = new MeshSurfaceSampler(this.surface.children[0]).build();
        
        for( let i =0; i< this.state.count; i++){
            
            this.ages[i] = Math.random();
            this.scales[i] = scaleCurve(this.ages[i]);
            this.resampleParticle(i);
            
        }
        this.modelMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(this.modelMesh);
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
        this.ages[i] += 0.00005;
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
    outUnanimated = true;
    outAnimated = false;
    inUnanimated = true;
    animateZoomOut = function(){
        if(this.outUnanimated){
            this.tl.to(this.headlineRef, .1, {
                onComplete: ()=> {
                    [...this.headlineRef.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).reverse(0);
                    });
                }
            });
            this.tl.to(this.descRef, .1, {
                onComplete: ()=> {
                    [...this.descRef.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).reverse(0);
                    });
                }
            });
            this.tl.to(this.headlineRef, .5, { 
                onComplete: () => {
                    this.setState({
                        outAnimation: true,
                        inAnimation: false,
                        shouldAnimate: false,
                        shouldAnimateDesc: false
                    }, ()=> {
                        [...this.headlineRef.getElementsByTagName('span')].forEach((span, i)=>{
                            animateText(span, i).play();
                        });
                        [...this.descRef.getElementsByTagName('span')].forEach((span, i)=>{
                            animateText(span, i).play();
                        });
                    })
                }
            });

        }
        this.outUnanimated = false;
        this.outAnimated = true;
    }
    animateOut = function (){
        if(this.outAnimated){
            TweenLite.to(this.outRef, 1, {
                opacity: 0
            })
            TweenLite.to(this.inRef, 1, {
                opacity: 1
            })
            this.tl.to(this.headlineRef, .1, {
                onComplete: ()=> {
                    [...this.headlineRef.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).reverse(0);
                    });
                }
            });
            this.tl.to(this.descRef, .1, {
                onComplete: ()=> {
                    [...this.descRef.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).reverse(0);
                    });
                }
            });
        }
        this.outAnimated = false;
    }
    animateZoomIn = function(){
        if(this.inUnanimated){
            let counter = {value: this.state.sixtyCounter};
            let ccounter = {value: this.state.centsCounter};
            var updateCounter=(value)=>{
                this.setState({
                    sixtyCounter: value
                })
            }
            var updatecCounter=(value)=>{
                this.setState({
                    centsCounter: value
                })
            }
            this.tl.to(this.headlineRef, .5, { 
                onComplete: () => {
                    this.setState({
                        outAnimation: false,
                        inAnimation: true,
                        shouldAnimateDesc: false,
                        shouldAnimate: false
                    }, ()=> {
                        [...this.headlineRef.getElementsByTagName('span')].forEach((span, i)=>{
                            animateText(span, i).play();
                        });
                        [...this.descRef.getElementsByTagName('span')].forEach((span, i)=>{
                            animateText(span, i).play();
                        });
                    })
                }
            });
            this.tl.to('.dollars-cents', 2, {
                fontSize: '8em',
                opacity: 1
            })
            this.tl.to(counter, 1, {
                delay: 1,
                value: 60,
                roundProps: 'value',
                onUpdate: function(){
                    updateCounter(counter.value)
                }
            }, "-=1")
            this.tl.to(ccounter, 1, {
                value: 10,
                roundProps: 'value',
                onUpdate: function(){
                    updatecCounter(ccounter.value)
                }
            })
            
        }
        this.inUnanimated=false;
    }
    update=()=>{
        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
          }

        this.controls.update();
        this.zoom = this.controls.target.distanceTo( this.controls.object.position )
        if(this.modelMesh){
            if(this.zoom > 200 && this.zoom < 1000){
                if(!this.state.outAnimation && this.headlineRef){                   
                    this.animateZoomOut();
                }
            }
            for(let i =0; i< this.state.count; i++){
                this.updateParticle(i);
            }
            this.modelMesh.instanceMatrix.needsUpdate = true;
        }

        if(Math.round(this.zoom) >= this.controls.maxDistance-400 && Math.round(this.zoom) < this.controls.maxDistance){
            if(this.headlineRef)
             this.animateOut();
        }
        if(Math.round(this.zoom) > this.controls.minDistance && Math.round(this.zoom) <= 100){
            if(!this.state.inAnimation && this.headlineRef){
                this.animateZoomIn();
            }
            
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
    render(){
        return <div id="sweatshopsContainer" ref={this.onSectionLoad}>
            <canvas ref={ref=>this.canvasRef = ref}></canvas>
            <div ref={ref=>this.inRef = ref} className="show-up">
                <ZoomInButton />
            </div>
            <div ref={ref=>this.outRef = ref} className="show-up">
                 <ZoomOutButton />
            </div>
            <div id="sweatshopsHeadline" ref={ref=>{this.headlineRef = ref}}>
                {this.state.shouldAnimate && (generateTextForAnimation(texts.sweatshopsSequence.headline.split('')))}
                {this.state.outAnimation && (generateTextForAnimation(texts.sweatshopsSequence.zoomOutheadline.split('')))}
                {this.state.inAnimation && (generateTextForAnimation(texts.sweatshopsSequence.zoomInheadline.split('')))}
             </div>
             <div id="sixty" class="dollars-cents">
                 {this.state.inAnimation && (<span><span ref={ref=>this.sixtyRef=ref}>{this.state.sixtyCounter}</span>$</span>)}
             </div>
             <div id="ten" class="dollars-cents">
                 {this.state.inAnimation && (<span><span ref={ref=>this.tenRef=ref}>{this.state.centsCounter}</span>c</span>)}
             </div>
             <div id="sweatshopsDesc" ref={ref=>{this.descRef = ref}}>
                {this.state.shouldAnimateDesc && (generateTextForAnimation(texts.sweatshopsSequence.description.split('')))}
                {this.state.outAnimation && (generateTextForAnimation(texts.sweatshopsSequence.zoomOutdescription.split('')))}
                {this.state.inAnimation && (generateTextForAnimation(texts.sweatshopsSequence.zoomIndescription.split('')))}
             </div>
            
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