import React, {Component} from 'react';
import THREE from '../3d/three';
import ScrollMagic from 'scrollmagic';
class SubstanceSequence extends Component{
    constructor(props){
        super(props);
        this.state= {
            videoRef : null,
            sequenceRef: null,
            shouldAnimate: false,
            shouldAnimateDesc: false, 
            shouldAnimateSeason: false,
            counter: 1
        }
        this.canvasRef = React.createRef();
        this.headlineRef = React.createRef();
        this.numberRef = React.createRef();
        this.pRef = React.createRef();
        this.descriptionRef = React.createRef();
    }
    onVideoUpload = node => {
        this.setState({
            videoRef : node
        }, 
         ()=>{
           
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

    // onScroll = ()=>{
    //         let scene = new ScrollMagic.Scene({
    //           duration: "80%",
    //           offset: 50,
    //           triggerElement: this.state.sequenceRef
    //         })
    //         .addIndicators()
    //         .on('enter', ()=>{
    //             if(this.video)
    //                 this.video.play();
    //         })
    //         .addTo(this.props.controller);
    // }

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
        video.loop = true;
        this.video = video;
        this.video.play();
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
            vertexShader: 'varying vec2 vUv;\
            void main(){\
                vUv = uv;\
                vec4 mvPosition = modelViewMatrix * vec4 (position, 1.0);\
                gl_Position = projectionMatrix * mvPosition;}',
            fragmentShader: 'uniform sampler2D texture;\
            uniform vec3 color;\
            varying vec2 vUv;\
            void main(){\
                vec3 tColor = texture2D( texture, vUv).rgb;\
                float a = (length(tColor - color) ) * 0.9;\
                gl_FragColor = vec4(tColor, a);}',
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
        return <div >
                <div ref={this.onSequenceLoad}> 
                    <canvas ref={ref=>{this.canvasRef = ref}}></canvas>
                    <video src="../images/bawelna.mp4" id="video" ref={this.onVideoUpload}></video>
                </div>
            </div>
    }
}
export default SubstanceSequence;