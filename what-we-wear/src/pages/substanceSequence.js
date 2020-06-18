import React, {Component} from 'react';
import THREE from '../3d/three';
import ScrollMagic from 'scrollmagic';
import {TimelineMax, TweenLite} from 'gsap';
import texts from '../dictionary/en.json';
import {animateText,  generateTextForAnimation} from '../helpers/textAnimations';
import ScrollDown from '../objects/ScrollDown';
class SubstanceSequence extends Component{
    constructor(props){
        super(props);
        this.state= {
            videoRef : null,
            sequenceRef: null,
            shouldAnimate: false,
            shouldAnimateDesc: false, 
            shouldAnimateDesc2: false,
            shouldAnimateDesc3: false,  
            shouldAnimateSeason: false,
            counter: 1
        }
        this.canvasRef = React.createRef();
        this.buttonRef = React.createRef();
        this.headlineRef = React.createRef();
        this.descRef = React.createRef();
        this.desc2Ref = React.createRef();
        this.desc3Ref = React.createRef();
        this.tl = new TimelineMax();
    }
    onVideoUpload = node => {
        this.setState({
            videoRef : node
        }, 
         ()=>{
           this.onScroll();
        }
        )
    }
    onSequenceLoad = node => {
        this.setState({
            sequenceRef: node
        }, 
        ()=> {this.init();
            this.createVideoTexture();
            this.update();
        }
        )
    }
    animateTexts = function(){
        this.tl.to('canvas', .5, {
            opacity: .4
        })
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
        })
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
    onScroll = ()=>{
            let scene = new ScrollMagic.Scene({
              duration: "60%",
              triggerElement: this.state.sequenceRef
            })
            .on('leave', e=>{
                if(e.scrollDirection === "FORWARD"){
                    TweenLite.to(this.plane.position, .5, {
                        z: -200
                    })
                    this.props.nextScene();
                    
                }else{
                    this.props.prevScene();
                }
                scene.remove();
                
            })
            .addTo(this.props.controller);
    }

    init = () => {
     
        const canvas = this.canvasRef.current;
        this.color = new THREE.Color();
        //scene
        this.scene = new THREE.Scene();
        //renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setSize( window.innerWidth, window.innerHeight )
        this.state.sequenceRef.replaceChild(this.renderer.domElement, this.state.sequenceRef.getElementsByTagName('canvas')[0]);
        //camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 10000);
          this.camera.position.z = 1000; 
          this.camera.position.x = 0;
          this.camera.position.y = 100;
          this.camera.updateProjectionMatrix();


  
           
            window.addEventListener( 'resize', this.onWindowResize, false );
            

    }

    createVideoTexture = ()=> {
        const video = this.state.videoRef;
        if(!video) return;
        video.currentTime = 1;
        video.mute = true;
        this.video = video;
        this.video.play();
        this.video.addEventListener('ended', () => {
            TweenLite.to(this.buttonRef, 1, {
                opacity: 1
            })
            this.animateTexts();
            video.loop = true;
            video.play();
        })
        const videoTexture = new THREE.VideoTexture( video );
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBFormat;
    
        let planeGeo = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
        let planeMaterial = new THREE.ShaderMaterial({
            uniforms: {
                texture : {
                    type: 't',
                    value: videoTexture
                },
                color: {
                    type: 'c',
                    value: new THREE.Color(0xffff00)
                }
            },
            vertexShader: 'varying vec2 vUv;void main(){ vUv = uv;vec4 mvPosition = modelViewMatrix * vec4 (position, 1.0);gl_Position = projectionMatrix * mvPosition;}',
            fragmentShader: 'uniform sampler2D texture;uniform vec3 color;varying vec2 vUv;void main(){vec3 tColor = texture2D( texture, vUv).rgb;float a = (length(tColor - color) ) * 0.9;gl_FragColor = vec4(tColor, a);}',
            transparent: true
        })
        this.plane = new THREE.Mesh(planeGeo, planeMaterial);
        this.plane.position.x = 0;
        this.plane.position.y = 0;
        this.scene.add(this.plane);
    }
    update=()=>{
        requestAnimationFrame(this.update);
   
        this.renderer.render(this.scene, this.camera);
        
       
    }
    onWindowResize=()=> {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }
    render=()=>{
        return <div>
                <div id="substanceSection" ref={this.onSequenceLoad}> 
                    <canvas ref={ref=>{this.canvasRef = ref}}></canvas>
                    <video src="../images/bawelna23.mp4" id="video" ref={this.onVideoUpload}></video>
                    <div id="substanceHeadline" ref={ref=>{this.headlineRef = ref}}>
                        {this.state.shouldAnimate && (generateTextForAnimation(texts.substanceSequence.headline.split('')))}
                    </div>
                    <div id="substanceDesc" ref={ref=>{this.descRef = ref}}>
                        {this.state.shouldAnimateDesc && (generateTextForAnimation(texts.substanceSequence.description.split('')))}
                    </div>
                    <div id="substanceDesc2" ref={ref=>{this.desc2Ref = ref}}>
                        {this.state.shouldAnimateDesc2 && (generateTextForAnimation(texts.substanceSequence.description2.split('')))}
                    </div>
                    <div id="substanceDesc3" ref={ref=>{this.desc3Ref = ref}}>
                        {this.state.shouldAnimateDesc3 && (generateTextForAnimation(texts.substanceSequence.description3.split('')))}
                    </div>
                    <div ref={ref=>this.buttonRef = ref} className="show-up">
                <ScrollDown  />
            </div>
                </div>
            </div>
    }
}
export default SubstanceSequence;