import React, { Component } from 'react';
import THREE from '3d/three';
import NextButton from 'objects/NextButton';
import ScrollMagic from 'scrollmagic';

import camera from '3d/utils/camera';
import yellowHemiLight from '3d/utils/lights/hemisphereLight--yellow';
import texts from 'dictionary/en.json';
import AnimatedText, { animateComponentText } from '../components/AnimatedText';
import gsap from 'gsap';

//particle system by example of Rugile, Jack: https://github.com/jackrugile/3d-particle-explorations/blob/master/js/demo-8/system.js
class ExplosionsSequence extends Component {
	constructor(props) {
		super();
		this.state = {
			videoRef: null,
			sequenceRef: null,
			shouldAnimate: false,
			shouldAnimateDesc: false,
			shouldAnimateSeason: false,
			counter: 1
		}
		this.renderer = props.renderer;
		this.camera = camera;
		this.references = {
			headlineRef: React.createRef(),
			numberRef: React.createRef(),
			descriptionRef: React.createRef(),
			buttonRef: React.createRef(),
		}
		this.scene = new THREE.Scene();
		document.body.classList.add('fixed');
	}
	componentDidMount = () => {
		this._isMounted = true;
	}
	componentWillUnmount = () => {
		this._isMounted = false;
		this.references = {};
		this.props.onUnmount();
		document.body.classList.remove('fixed');
	}
	onVideoUpload = node => {
		this.setState({
			videoRef: node
		},
			() => {

				this.animateInfo();

			}
		)
	}
	onSequenceLoad = node => {
		this.setState({
			sequenceRef: node
		},
			() => {
				if (this._isMounted) {
					this.init();
					this.createVideoTexture();
					this.onScroll();
				}
			}
		)
	}

	animateInfo = () => {
		let counter = { value: this.state.counter };
		let timeline = gsap.timeline();
		timeline.to(this.references.headlineRef.current, {
			duration: 0.2,
			onComplete: () => {
				this.setState({
					shouldAnimate: true
				}, () => {
					animateComponentText(this.references.headlineRef.current);
				})
			},
		});
		timeline.to(this.references.numberRef, {
			duration: 3,
			opacity: 1
		}, '+=2');
		timeline.to(counter, {
			duration: 3,
			value: 26,
			roundProps: 'value',
			onUpdate: () => updateCounter(counter.value)
		}, "-=3");
		timeline.to(this.references.descriptionRef.current, {
			duration: 0.2,
			onComplete: () => {
				this.setState({
					shouldAnimateDesc: true
				}, () => {
					animateComponentText(this.references.descriptionRef.current)
				})
			},
		}, "-=2");
		timeline.to(this.references.buttonRef, {
			duration: 1,
			opacity: 1
		})
		let updateCounter = value => {
			this.setState({
				counter: value
			})
		}

	}
	onScroll = () => {
		let scene = new ScrollMagic.Scene({
			duration: "70%",
			offset: 500,
			triggerElement: this.state.sequenceRef
		})
			.on('enter', () => {
				this.video.play();
			})
			.on('leave', e => {
				this.video.pause();
				scene.remove();
			})
			.addTo(this.props.controller);
	}

	init = () => {
		console.log(this.renderer);
		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.controls.maxDistance = 1000;
		this.controls.minDistance = 2;
		this.camera.position.set(0, 20, 100);
		this.controls.update();
		this.camera.near = 1;
		this.camera.far = 10000;
		this.camera.position.z = 1000;
		this.camera.position.x = 0;
		this.camera.position.y = 100;
		this.camera.updateProjectionMatrix();
		this.camera.lookAt(new THREE.Vector3());
		yellowHemiLight.position.set(0, 50, 0);
		this.scene.add(yellowHemiLight);
		window.addEventListener('resize', this.onWindowResize, false);
	}

	createVideoTexture = () => {
		const video = this.state.videoRef;
		video.currentTime = 1;
		video.muted = true;
		video.loop = true;
		this.video = video;
		const videoTexture = new THREE.VideoTexture(video);
		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		videoTexture.format = THREE.RGBFormat;
		let planeGeo = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
		let planeMaterial = new THREE.ShaderMaterial({
			uniforms: {
				texture: {
					type: 't',
					value: videoTexture
				},
				color: {
					type: 'c',
					value: new THREE.Color(0x000000)
				}
			},
			vertexShader: 'varying vec2 vUv;void main(){vUv = uv;vec4 mvPosition = modelViewMatrix * vec4 (position, 1.0);gl_Position = projectionMatrix * mvPosition;}',
			fragmentShader: 'uniform sampler2D texture;uniform vec3 color;varying vec2 vUv;void main(){vec3 tColor = texture2D( texture, vUv).rgb;float a = (length(tColor - color) - 0.1) * 0.9;gl_FragColor = vec4(tColor, a);}',
			transparent: true
		})
		this.plane = new THREE.Mesh(planeGeo, planeMaterial);
		this.plane.position.x = 0;
		this.plane.position.y = 0;
		this.scene.add(this.plane);
	}
	update = () => {
		if (!this._isMounted) return;
		requestAnimationFrame(this.update);

		this.renderer.render(this.scene, this.camera);
	}
	onWindowResize = () => {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
	render = () => {
		return <div id="explosionsContainer">
			<div id="explosionsSequence" ref={this.onSequenceLoad}>
				<video src="images/Untitled.mp4" muted="muted" autoPlay={true} id="explosionsVideo" ref={this.onVideoUpload}></video>
				<AnimatedText
					id="explosionsHeadline"
					ref={this.references.headlineRef}
					animatedText={
						[{
							shouldAnimate: this.state.shouldAnimate,
							text: texts.explosionsSequence.headline
						}]
					}
				/>
				<div id="explosionsNumber" ref={ref => { this.references.numberRef = ref }}>{this.state.counter}</div>
				<AnimatedText
					id="explosionsDescription"
					ref={this.references.descriptionRef}
					animatedText={
						[{
							shouldAnimate: this.state.shouldAnimateDesc,
							text: texts.explosionsSequence.description
						}]
					}
				/>
				<div ref={ref => this.references.buttonRef = ref} className="show-up">
					<NextButton onClick={this.props.nextScene} />
				</div>
			</div>
		</div>
	}
}

export default ExplosionsSequence;