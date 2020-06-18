import React, {Component} from 'react';
import THREE from '../3d/three';
import {TimelineMax} from 'gsap';
import texts from '../dictionary/en.json';
import {animateText,  generateTextForAnimation} from '../helpers/textAnimations';
import trashFragmentShader from '../3d/shaders/trashFragmentShader';
import trashVertexShader from '../3d/shaders/trashVertexShader';

class TrashSequence extends Component{
    constructor(props){
        super(props);
        this.state = {
            sectionRef: false,
            shouldAnimate: false,
            shouldAnimateDesc: false, 
            shouldAnimateDesc2: false,
            shouldAnimateDesc3: false
        }
        this.canvasRef = React.createRef();
        this.descRef = React.createRef();
        this.desc2Ref = React.createRef();
        this.desc3Ref = React.createRef();
        this.headlineRef = React.createRef();
        this.clock = new THREE.Clock();
        this.tl = new TimelineMax();
    }
    onSequenceLoad = node => {
        this.setState({
            sectionRef: node
        }, () => {
            window.scrollTo({top:0, behavior: 'smooth'})
            this.init();
            this.animateTexts();
            this.update();
        })
    }
    animateTexts = function(){
        this.tl.to(this.headlineRef, .3, {
            onComplete: ()=> {
                this.setState({
                    shouldAnimate: true
                }, ()=>{
                    [...this.headlineRef.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).play();
                    });
                })
            }
        })
        this.tl.to(this.descRef, 1, {
            onComplete: ()=> {
                this.setState({
                    shouldAnimateDesc: true
                }, ()=>{
                    [...this.descRef.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).play();
                    });
                })
            }
        })
        this.tl.to(this.scene.children[1].material.uniforms["sineTime"], 3, {
            delay: 3,
           value :  -.5
        })
        this.tl.to(this.scene.children[1].material.uniforms["blue"], 1, {
           value: -10
        }, '-=3')
        this.tl.to(this.desc2Ref, 1, {
            onComplete: ()=> {
                this.setState({
                    shouldAnimateDesc2: true
                }, ()=>{
                    [...this.desc2Ref.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).play();
                    });
                })
            }
        }, "-=3")
        this.tl.to(this.desc3Ref, 1, {
            onComplete: ()=> {
                this.setState({
                    shouldAnimateDesc3: true
                }, ()=>{
                    [...this.desc3Ref.getElementsByTagName('span')].forEach((span, i)=>{
                        animateText(span, i).play();
                    });
                })
            }
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
            30,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
          );

            this.camera.position.set( 0 , 0, 6 );
          //lights 
          let hemiLight = new THREE.HemisphereLight(0xE29300,  0.99);
            hemiLight.position.set(100, 50, 100);
            // Add hemisphere light to scene
            this.scene.add(hemiLight);

        //particles as per example
        let vector = new THREE.Vector4();
        const instances = 1500;
        let positions = [];
        let offsets = [];
        let colors = [];
        let orientationsStart = [];
        let orientationsEnd = [];

        positions.push( 0.025, - 0.025, 0 );
        positions.push( - 0.025, 0.025, 0 );
        positions.push( 0, 0, 0.025 );


        for(let i = 0; i< instances; i++){
            offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            colors.push(Math.random()/2, Math.random()/3, Math.random(), Math.random());
            vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
            vector.normalize();
            
            orientationsStart.push(vector.x, vector.y, vector.z, vector.w);
            vector.set( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
            vector.normalize();
            
            orientationsEnd.push(vector.x, vector.y, vector.z, vector.w);

        }
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.instanceCount = instances;
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute( 'offset', new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 ) );
		geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( new Float32Array( colors ), 4 ) );
		geometry.setAttribute( 'orientationStart', new THREE.InstancedBufferAttribute( new Float32Array( orientationsStart ), 4 ) );
		geometry.setAttribute( 'orientationEnd', new THREE.InstancedBufferAttribute( new Float32Array( orientationsEnd ), 4 ) );

        const material = new THREE.RawShaderMaterial({
            uniforms: {
                "time": {value : 1.0},
                "sineTime": {value: 1.0},
                "blue": {value: 1.0}
            },
            vertexShader: trashVertexShader,
            fragmentShader: trashFragmentShader,
            side: THREE.DoubleSide,
            transparent: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
    }
    update=()=>{
        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
          }

            
        let delta = performance.now();
        let obj = this.scene.children[1];
        obj.rotation.y = delta * 0.0005;
        obj.material.uniforms["time"].value = delta * 0.005;
       // obj.material.uniforms["sineTime"].value = Math.sin( obj.material.uniforms[ "time" ].value * 0.05 );
        
        

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
        return <div id="trashSequence" ref={this.onSequenceLoad}>
            <canvas ref={ref=>this.canvasRef = ref}></canvas>
            <div id="trashHeadline" ref={ref=>{this.headlineRef = ref}}>
                {this.state.shouldAnimate && (generateTextForAnimation(texts.trashSequence.headline.split('')))}
            </div>
            <div id="trashDesc" ref={ref=>{this.descRef = ref}}>
                {this.state.shouldAnimateDesc && (generateTextForAnimation(texts.trashSequence.description.split('')))}
            </div>
            <div id="trashDesc2" ref={ref=>{this.desc2Ref = ref}}>
                {this.state.shouldAnimateDesc2 && (generateTextForAnimation(texts.trashSequence.description2.split('')))}
            </div>
            <div id="trashDesc3" ref={ref=>{this.desc3Ref = ref}}>
                {this.state.shouldAnimateDesc3 && (generateTextForAnimation(texts.trashSequence.description3.split('')))}
            </div>
        </div>
    }
}
export default TrashSequence;