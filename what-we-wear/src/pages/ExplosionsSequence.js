import React, {Component} from 'react';
import THREE from '../3d/three';
import SimplexNoise from 'simplex-noise';
import ScrollMagic from 'scrollmagic';
import particlesFragmentShader from '../3d/shaders/particlesFragmentShader';
import particlesVertexShader from '../3d/shaders/particlesVertexShader';
import texts from '../dictionary/en.json';
import {animateText,  generateTextForAnimation} from '../helpers/textAnimations';
import {TimelineMax} from 'gsap';
class ExplosionsSequence extends Component{
    constructor(props){
        super(props);
        this.state= {
            videoRef : null,
            sequenceRef: null,
            shouldAnimate: false,
            shouldAnimateDesc: false, 
            counter: 1
        }
        this.canvasRef = React.createRef();
        this.headlineRef = React.createRef();
        this.numberRef = React.createRef();
        this.descriptionRef = React.createRef();
        this.clock = new THREE.Clock();
        this.simplex = new SimplexNoise();
    }
    onVideoUpload = node => {
        this.setState({
            videoRef : node
        }, 
         ()=>{
           
           
           this.onScroll();
           this.animateInfo();
        }
        )
    }
    onSequenceLoad = node => {
        this.setState({
            sequenceRef: node
        }, 
        ()=> {this.init();
            this.generateParticles();
            this.createVideoTexture();
        }
        )
    }
    animateInfo = () => {
        let counter = {value:this.state.counter};
        let timeline = new TimelineMax();
        timeline.to(this.headlineRef, 0.2, {
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
        timeline.to(this.numberRef, 3, {
            opacity: 1, 
            color: 'red'
        }, '+=2')
        timeline.to(counter, 3, {
          value: 52,
          roundProps: 'value',
          onUpdate: () => updateCounter(counter.value)
        }, "-=3") ;
        timeline.to(this.descriptionRef, 0.2, {
          onComplete: ()=>{
              this.setState({
                shouldAnimateDesc: true
              }, ()=>{
                [...this.descriptionRef.getElementsByTagName('span')].forEach((span, i)=>{
                  animateText(span, i).play();
              });
              })
          },
        }, "-=2");
        let updateCounter = value=>{
            this.setState({
                counter: value
            })
        }
        
    }
    onScroll = ()=>{
        let controller = new ScrollMagic.Controller();
            let scene = new ScrollMagic.Scene({
              duration: "50%"
            })
            .addIndicators()
            .on('enter', ()=>{
                if(this.video)
                    this.video.play();
                
            })
            .addTo(controller);
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


       

        this.camera.lookAt(new THREE.Vector3());
          //lights
          let hemiLight = new THREE.HemisphereLight(0xffffff,  0.91);
            hemiLight.position.set(0, 50, 0);
            // Add hemisphere light to scene
            this.scene.add(hemiLight);
  
  
           
            window.addEventListener( 'resize', this.onWindowResize, false );
            

    }
    generateParticles = () => {
        
            // geometry
            this.geometry = new THREE.BufferGeometry();
            this.particles = 10000;
            const radius = 200;
            this.positions = new Float32Array(this.particles * 3);
			this.colors = new Float32Array(this.particles * 4);
            this.sizes = new Float32Array(this.particles);
            this.size = 1000;
            this.parts = [];
            //vec3 attributes
            this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.positions, 3 ) );
            this.geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( this.colors, 4 ) );
            this.geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( this.sizes, 1 ));
       
            for ( var i = 0; i < this.particles; i ++ ) {
                let size = rand(2, 30);
                this.color.setHex(0xffffff);
                let part = {
                    offset: 0,
                    position: new THREE.Vector3(
                        rand(-this.size / 2, this.size / 2),
                        rand(-this.size / 2, this.size / 2),
                        rand(-this.size / 2, this.size / 2)
                    ),
                    baseSize: size,
                    size: size,
                    r: this.color.r,
                    g: this.color.g,
                    b: this.color.b,
                    a: 0.3,
                    life: 2,
                    decay: rand(0.05, 0.15),
                    firstRun: true
                };
                this.parts.push(part);
            }
     
            
            this.material = new THREE.ShaderMaterial( {
                uniforms: {
                    pointTexture: { value: new THREE.TextureLoader().load( "../3d/particle.png" ) }
                    
                },
                vertexShader: particlesVertexShader,
                fragmentShader: particlesFragmentShader,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true,
                vertexColors: true
             });
            this.particleSystem = new THREE.Points(this.geometry, this.material);

            this.scene.add(this.particleSystem);
            this.updateParticleAttributes(true, true, true);
            this.update();
    }
    updateParticleAttributes=(color, position, size) =>{
		let i = 0;
		while(i<this.particles) {
			let part = this.parts[i];
			if(color) {
                const colorAttribute = this.geometry.attributes.color;
                      colorAttribute.array[i * 3 + 0] = part.r;
                      colorAttribute.array[i * 3 + 1] = part.g;
                      colorAttribute.array[i * 3 + 2] = part.b;
                      colorAttribute.array[i * 4 + 3] = part.a;
                  }
                  if(position) {
                const positionAttribute = this.geometry.attributes.position;
                      positionAttribute.array[i * 3 + 0] = part.position.x;
                      positionAttribute.array[i * 3 + 1] = part.position.y;
                      positionAttribute.array[i * 3 + 2] = part.position.z;
                  }
                  if(size) {
                const sizeAttribute = this.geometry.attributes.size;
                      sizeAttribute.array[i] = part.size;
             }
            i++;
		}

		if(color) {
			this.geometry.attributes.color.needsUpdate = true;
		}
		if(position) {
			this.geometry.attributes.position.needsUpdate = true;
		}
		if(size) {
			this.geometry.attributes.size.needsUpdate = true;
        }
        this.geometry.computeBoundingSphere();
    }
    createVideoTexture = ()=> {
        const video = this.state.videoRef;
        if(!video) return;
        video.currentTime = 1;
        video.mute = true;
        video.loop = true;
        this.video = video;
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
                    value: new THREE.Color(0x000000)
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
                float a = (length(tColor - color) - 0.1) * 0.9;\
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
        const delta = this.clock.getDelta();
        let noiseTime = this.clock.getElapsedTime() * 0.0008;
        let noiseVelocity = this.simplex.noise2D(rand(200,300), delta);
         const noiseScale = 0.001;
        
        for ( var i = 0; i < this.particles; i ++ ) {
            let part = this.parts[i];
            let xScaled = part.position.x * noiseScale;
			let yScaled = part.position.y * noiseScale;
			let zScaled = part.position.z * noiseScale;
            let noise1 = this.simplex.noise4D(
                xScaled ,
				yScaled,
				zScaled,
				50 + noiseTime
            )* 0.5;
            let noise2 = this.simplex.noise4D(
                xScaled +100,
				yScaled+100,
				zScaled+100,
				50 + noiseTime
            )* 0.5 + 0.5;
            let noise3 = this.simplex.noise4D(
                xScaled +200,
				yScaled+200,
				zScaled+200,
				50 + noiseTime
            )* 0.5 + 0.5;
            part.position.x -= Math.sin(noise1 *Math.PI *2) + noiseVelocity * delta ;
            part.position.y -= Math.sin(noise2 *Math.PI *2) * noiseVelocity * delta ;
            part.position.z += Math.sin(noise3 *Math.PI*1.3)  +noiseVelocity * delta ;
           

            if(part.position.x -100 < -window.innerWidth/2)
                part.position.x = window.innerWidth+20;
            if(part.position.y -100 < -window.innerHeight/2)
                part.position.y  = window.innerHeight+20;
            if(part.position.x +100 > window.innerWidth/2)
                part.position.x = 20;
            if(part.position.y +100 > window.innerHeight/2)
                part.position.y = 20;

            if(part.life > 0 ) {
                part.life -= part.decay * delta;
                part.a -= part.decay * delta;
			}
            if(part.life <= 0 || part.firstRun) {
				part.life = 2;
				part.position.x = rand(-this.size/2, this.size/2);
				part.position.y = rand(-this.size/2, this.size/2);
				part.position.z = rand(-this.size/2, this.size/2);
                part.firstRun = false;
            }
            this.parts[i] = part;

        }
        this.updateParticleAttributes(true, true, true);
        this.renderer.render(this.scene, this.camera);
        
       
    }
    onWindowResize=()=> {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }
    render=()=>{
        return <div id="explosionsSequence" ref={this.onSequenceLoad}> 
            <canvas ref={ref=>{this.canvasRef = ref}}></canvas>
            <video src="../images/Untitled.mp4" id="video" ref={this.onVideoUpload}></video>
            <div id="explosionsHeadline" ref={ref=>{this.headlineRef = ref}}>
                {this.state.shouldAnimate && (generateTextForAnimation(texts.explosionsSequence.headline.split('')))}
            </div>
            <div id="explosionsNumber" ref={ref=>{this.numberRef = ref}}>{this.state.counter}</div>
            <div id="explosionsDescription" ref={ref=>{this.descriptionRef = ref}}>
                {this.state.shouldAnimateDesc && (generateTextForAnimation(texts.explosionsSequence.description.split('')))}
            </div>
        </div>
    }
}
const rand = (min,max) => min + Math.random()*(max-min);
export default ExplosionsSequence;