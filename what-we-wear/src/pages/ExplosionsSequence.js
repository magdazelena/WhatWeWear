import React, {Component} from 'react';
import THREE from '../3d/three';
import SimplexNoise from 'simplex-noise';
import particlesFragmentShader from '../3d/shaders/particlesFragmentShader';
import particlesVertexShader from '../3d/shaders/particlesVertexShader';
class ExplosionsSequence extends Component{
    canvasRef = React.createRef();
    clock = new THREE.Clock();
    simplex = new SimplexNoise();
    componentDidMount = () => {
        this.init();
        this.update();
    }
    init = () => {
        const rand = (min,max) => min + Math.random()*(max-min);
        const canvas = this.canvasRef.current;
        this.color = new THREE.Color();
        //scene
        this.scene = new THREE.Scene();
        this.texture = this.generateTexture();
        //renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        document.body.appendChild(this.renderer.domElement);
        //camera
        this.camera = new THREE.PerspectiveCamera(
            100,
            window.innerWidth / window.innerHeight,
            0.01,
            10000
          );
          this.camera.position.z = 0 
          this.camera.position.x = 0;
          this.camera.position.y = 0;

          this.particleGroup = new THREE.Object3D();
		this.particleGroup.scale.set(10, 10, 10);
          //lights
        //   let hemiLight = new THREE.HemisphereLight(0xffffff,  0.91);
        //     hemiLight.position.set(0, 50, 0);
        //     // Add hemisphere light to scene
        //     this.scene.add(hemiLight);
  
  
            // geometry
            this.geometry = new THREE.BufferGeometry();
            this.particles = 10;
            const radius = 200;
            this.positions = new Float32Array(this.particles * 3);
			this.colors = new Float32Array(this.particles * 4);
			this.sizes = new Float32Array(this.particles);
            this.size = 100;
            this.parts = [];

            for ( var i = 0; i < this.particles; i ++ ) {
                let size = rand(10, 80);
                this.parts.push({
                    offset: 0,
                    position: new THREE.Vector3(
                        rand(-this.size / 2, this.size / 2),
                        rand(-this.size / 2, this.size / 2),
                        rand(-this.size / 2, this.size / 2)
                    ),
                    baseSize: size,
                    size: size,
                    r: parseInt(size),
                    g: parseInt(size),
                    b: parseInt(size),
                    a: 0.6,
                    life: 2,
                    decay: rand(0.05, 0.15),
                    firstRun: true
                });

            }
            //vec3 attributes
            this.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.positions, 3 ) );
            this.geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( this.colors, 4 ) );
            this.geometry.setAttribute( 'size', new THREE.Float32BufferAttribute( this.sizes, 1 ));


            this.material = new THREE.ShaderMaterial( {
                uniforms: {
                    texture: {
                        value: this.texture
                    }
                },
                vertexShader: particlesVertexShader,
                fragmentShader: particlesFragmentShader,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true,
                vertexColors: true
             });
            this.particleSystem = new THREE.Points(this.geometry, this.material);
            this.particleGroup.add(this.particleSystem);
            this.scene.add(this.particleGroup);
            this.updateParticleAttributes(true, true, true);

    }
    generateTexture=() =>{
		let c = document.createElement('canvas');
		let ctx = c.getContext('2d');
		let size = 256;
		c.width = size;
		c.height = size;

		let gradient = ctx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.4);
		gradient.addColorStop(0, 'hsla(100, 80%, 60%, 1)');
		gradient.addColorStop(1, 'hsla(100, 80%, 60%, 0.6 )');

		ctx.beginPath();
		ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
		ctx.fillStyle = gradient;
		ctx.fill();

        let texture = new THREE.Texture(c);
		texture.needsUpdate = true;

		return texture;
	}
    updateParticleAttributes=(color, position, size) =>{
		let i = this.particles;
		while(i--) {
			let part = this.parts[i];
			if(color) {
				this.colors[i * 4 + 0] = part.r;
				this.colors[i * 4 + 1] = part.g;
				this.colors[i * 4 + 2] = part.b;
				this.colors[i * 4 + 3] = part.a;
			}
			if(position) {
				this.positions[i * 3 + 0] = part.position.x;
				this.positions[i * 3 + 1] = part.position.y;
				this.positions[i * 3 + 2] = part.position.z;
			}
			if(size) {
				this.sizes[i] = part.size;
            }
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
	}
    update=()=>{
        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
          }
          let noiseTime = this.clock.getElapsedTime() * 0.0008;
          let noiseVelocity = this.simplex.noise2D(0,1);
        const noiseScale = 0.01;
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
            part.position.x += Math.sin(noise1 * Math.PI * 2) * this.clock.getDelta() * noiseVelocity;
            part.position.y += Math.sin(noise2 * Math.PI * 2) * this.clock.getDelta() * noiseVelocity;
            part.position.z += Math.sin(noise3 * Math.PI * 2) * this.clock.getDelta() * noiseVelocity;
            this.parts[i] = part;
        }
       // this.updateParticleAttributes(true, true, true);
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
    render=()=>{
        return <div>
            <canvas ref={ref=>{this.canvasRef = ref}}></canvas>
        </div>
    }
}

export default ExplosionsSequence;