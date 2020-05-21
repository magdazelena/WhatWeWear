import React, {Component} from 'react';
import THREE from '../3d/three';
import SimplexNoise from 'simplex-noise';
import AxisHelper from '../3d/axis';
import particlesFragmentShader from '../3d/shaders/particlesFragmentShader';
import particlesVertexShader from '../3d/shaders/particlesVertexShader';
class ExplosionsSequence extends Component{
    constructor(props){
        super(props);
        this.state= {
            videoRef : null
        }
        this.canvasRef = React.createRef();
        this.clock = new THREE.Clock();
        this.simplex = new SimplexNoise();
    }
    onVideoUpload = node => {
        this.setState({
            videoRef : node
        }, 
        //()=>this.createVideoTexture()
        )
    }
    componentDidMount = () => {
        this.init();
    }
    init = () => {
        const rand = (min,max) => min + Math.random()*(max-min);
        const canvas = this.canvasRef.current;
        this.color = new THREE.Color();
        //scene
        this.scene = new THREE.Scene();
        //renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.setSize( window.innerWidth, window.innerHeight )
        document.body.appendChild(this.renderer.domElement);
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
                let size = rand(10, 80);
                this.color.setHSL( i / this.particles, 1.0, 0.5 );
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
                    a: 0.6,
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
           
            window.addEventListener( 'resize', this.onWindowResize, false );
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
        video.currentTime = 1;
        video.width = window.innerWidth;
        video.height = window.innerHeight;
        video.mute = true;
        video.play();
        video.loop = true;
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
                float a = (length(tColor - color) - 0.2) * 0.9;\
                gl_FragColor = vec4(tColor, a);}',
            transparent: true
        })
        this.plane = new THREE.Mesh(planeGeo, planeMaterial);
        this.plane.position.x = 0;
        this.plane.position.y = 0;
        this.scene.add(this.plane);
        //this.scene.background = videoTexture;
    }
    update=()=>{
        requestAnimationFrame(this.update);
        const rand = (min,max) => min + Math.random()*(max-min);
          let noiseTime = this.clock.getElapsedTime() * 0.0008;
          let noiseVelocity = rand(280,80);
         const noiseScale = 0.001;
         const delta = this.clock.getDelta();
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
            )* 0.5 + 0.5;
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
            part.position.x -= Math.sin(noise1 * Math.PI * 2) - delta * noiseVelocity;
            part.position.y -= Math.sin(noise2 * Math.PI * 2) - delta * noiseVelocity;
            part.position.z -= Math.sin(noise3 * Math.PI * 2) - delta * noiseVelocity;
            if(part.position.x < -window.innerWidth/2-20)
                part.position.x = window.innerWidth;
            if(part.position.y < -window.innerHeight/2-20)
                part.position.y = window.innerHeight;
            if(part.position.x > window.innerWidth/2+20)
                part.position.x = 0;
            if(part.position.y > window.innerHeight/2+20)
                part.position.y = 0;

            if(part.life > 0 ) {
				part.life -= part.decay * delta;
			}
            if(part.life <= 0 || part.firstRun) {
				part.life = 2;
				part.position.x = rand(-this.size / 2, this.size / 2);
				part.position.y = rand(-this.size / 2, this.size / 2);
				part.position.z = rand(-this.size / 2, this.size / 2);

				
                let hue = (this.clock.elapsedTime / 25 + rand(190,200)) % 360 + 110;
                let lightness = Math.round(rand(90, 100));
                this.color.set(`hsl(${hue}, 95%, 100%)`);


				part.r = parseInt(this.color.r);
				part.g = parseInt(this.color.g);
				part.b = parseInt(this.color.b);

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
        return <div>
            <canvas ref={ref=>{this.canvasRef = ref}}></canvas>
            <video src="../images/color_web1_.mp4" id="video" ref={this.onVideoUpload}></video>
        </div>
    }
}

export default ExplosionsSequence;