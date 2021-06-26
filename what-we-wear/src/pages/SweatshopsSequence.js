import React, { Component } from 'react';
import THREE from '../3d/three';
import { MeshSurfaceSampler } from '../3d/meshSurfaceSampler';
import magentaDirectionalLight from '../3d/utils/lights/directionalLight--magenta';
import yellowHemiLight from '../3d/utils/lights/hemisphereLight--yellow';
import yellowPhong from '../3d/materials/yellowPhong';
import resizeRendererToDisplaySize from '../3d/utils/resizeRendererToDisplaySize';
import texts from '../dictionary/en.json';
import gsap from 'gsap';
import ZoomInButton from '../objects/ZoomInButton';
import ZoomOutButton from '../objects/ZoomOutButton';
import camera from '../3d/utils/camera';
import { scaleCurve } from '../helpers/tools';
import AnimatedText, { animateComponentText, deanimateComponentText } from './components/AnimatedText';
class SweatshopsSequence extends Component {
	constructor(props) {
		super();
		this.state = {
			sectionRef: null,
			count: 10000,
			sixtyCounter: 1,
			centsCounter: 60,
			outAnimation: false,
			inAnimation: false,
			shouldAnimate: false,
			shouldAnimateDesc: false
		}
		this.references = {
			inRef: React.createRef(),
			outRef: React.createRef(),
			headlineRef: React.createRef(),
			descRef: React.createRef(),
		}
		this.scene = new THREE.Scene();
		this.zoom = 100;
		this.isOver = false;
		this.renderer = props.renderer;
		this.camera = camera;
		this.tl = gsap.timeline();
	}
	componentDidMount = () => {

		this.clock = new THREE.Clock();
		this._position = new THREE.Vector3();
		this._normal = new THREE.Vector3();
		this._scale = new THREE.Vector3();
		this.dummy = new THREE.Object3D();
		this.ages = new Float32Array(this.state.count);
		this.scales = new Float32Array(this.state.count);
		this.loader = new THREE.FBXLoader();

		this.sampler = null;
		this.machine = null;
		this.surface = null;
		this.modelMesh = null;
		this._isMounted = true;
		document.body.classList.add('fixed');
	}
	componentWillUnmount = () => {
		this.references = {};
		this._isMounted = false;
		this.props.onUnmount();
		document.body.classList.remove('fixed');
	}
	onSectionLoad = node => {
		this.setState({
			sectionRef: node
		},
			() => {
				window.scrollTo({ top: 0, behavior: 'smooth' })
				this.init();
				this.update();
				gsap.to(this.references.outRef.current, {
					duration: .1,
					opacity: 1
				})
				this.tl.to(this.references.headlineRef.current, {
					duration: 0.5,
					onComplete: () => {
						this.setState({
							shouldAnimate: true
						}, () => {
							animateComponentText(this.references.headlineRef.current);
						})
					},
				});
				this.tl.to(this.references.descRef.current, {
					duration: 0.5,
					onComplete: () => {
						this.setState({
							shouldAnimateDesc: true
						}, () => {
							animateComponentText(this.references.descRef.current)
						})
					},
				});
			})

	}

	init = () => {
		//camera
		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.controls.maxDistance = 1000;
		this.controls.minDistance = 2;
		this.camera.position.set(0, 20, 100);
		this.controls.update();
		//lights
		// Add hemisphere light to scene
		this.scene.add(yellowHemiLight);
		// Add directional Light to scene
		this.scene.add(magentaDirectionalLight);
		const modelPath = '../3d/models/dress_float.fbx';
		const machinePath = '../3d/models/machine.fbx';
		var creationFuntion = (function (obj) {
			let model = obj;
			model.traverse(o => {
				if (o.isMesh) {
					o.castShadow = true;
					o.receiveShadow = true;
					o.material = yellowPhong;
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
			, undefined,
			function (error) {
				console.error(error);
			}
		);
		var machinecreationFuntion = (function (obj) {
			this.machine = obj;

		}).bind(this);
		this.loader.load(
			machinePath,
			obj => {
				machinecreationFuntion(obj);

			}
			, undefined,
			function (error) {
				console.error(error);
			}
		);

	}
	createInstancing = () => {
		this.modelGeometry = new THREE.InstancedBufferGeometry();
		this.machine.children[4].frustumCulled = false;
		THREE.BufferGeometry.prototype.copy.call(this.modelGeometry, this.machine.children[4].geometry);
		var defaultTransform = new THREE.Matrix4()
			.makeRotationX(Math.PI)
			.multiply(new THREE.Matrix4().makeScale(1, 1, 1))
			.makeTranslation(-51, -1000, -50);
		this.modelGeometry.applyMatrix4(defaultTransform);
		this.modelMaterial = new THREE.MeshLambertMaterial()
		// Assign random colors to the blossoms.
		var _color = new THREE.Color();
		var color = new Float32Array(this.state.count * 3);
		var blossomPalette = [0x62C1EA, 0x0a71e6, 0xf54983, 0xB5154A];

		for (var i = 0; i < this.state.count; i++) {

			_color.setHex(blossomPalette[Math.floor(Math.random() * blossomPalette.length)]);
			_color.toArray(color, i * 3);

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

		for (let i = 0; i < this.state.count; i++) {

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

		this.dummy.scale.set(this.scales[i], this.scales[i], this.scales[i]);
		this.dummy.lookAt(this._normal);
		this.dummy.updateMatrix();
		this.modelMesh.setMatrixAt(i, this.dummy.matrix);

	}
	updateParticle = i => {
		this.ages[i] += 0.00005;
		if (this.ages[i] >= 1) {

			this.ages[i] = 0.001;
			this.scales[i] = scaleCurve(this.ages[i]);

			this.resampleParticle(i);
			return;
		}
		let prevScale = this.scales[i];
		this.scales[i] = scaleCurve(this.ages[i]);
		this._scale.set(this.scales[i] / prevScale, this.scales[i] / prevScale, this.scales[i] / prevScale);

		this.modelMesh.getMatrixAt(i, this.dummy.matrix);
		this.dummy.matrix.scale(this._scale);
		this.modelMesh.setMatrixAt(i, this.dummy.matrix);
	}
	outUnanimated = true;
	outAnimated = false;
	inUnanimated = true;
	animateZoomOut = function () {
		if (this.outUnanimated) {
			this.tl.to(this.references.headlineRef.current, {
				duration: 0.1,
				onComplete: () => {
					deanimateComponentText(this.references.headlineRef.current)
				}
			});
			this.tl.to(this.references.descRef.current, {
				duration: 0.1,
				onComplete: () => {
					deanimateComponentText(this.references.descRef.current)
				}
			});
			this.tl.to(this.references.headlineRef.current, {
				duration: 0.5,
				onComplete: () => {
					this.setState({
						outAnimation: true,
						inAnimation: false,
						shouldAnimate: false,
						shouldAnimateDesc: false
					}, () => {
						animateComponentText(this.references.headlineRef.current);
						animateComponentText(this.references.descRef.current);
					})
				}
			});

		}
		this.outUnanimated = false;
		this.outAnimated = true;
	}
	animateOut = function () {
		if (this.outAnimated) {
			gsap.to(this.references.outRef.current, {
				duration: 0.1,
				opacity: 0
			})
			gsap.to(this.references.inRef.current, {
				duration: 0.1,
				opacity: 1
			})
			this.tl.to(this.references.headlineRef.current, {
				duration: 0.1,
				onComplete: () => {
					deanimateComponentText(this.references.headlineRef.current)
				}
			});
			this.tl.to(this.references.descRef.current, {
				duration: 0.1,
				onComplete: () => {
					deanimateComponentText(this.references.descRef.current)
				}
			});
		}
		this.outAnimated = false;
	}
	animateZoomIn = function () {
		if (this.inUnanimated) {
			let counter = { value: this.state.sixtyCounter };
			let ccounter = { value: this.state.centsCounter };
			var updateCounter = (value) => {
				this.setState({
					sixtyCounter: value
				})
			}
			var updatecCounter = (value) => {
				this.setState({
					centsCounter: value
				})
			}
			this.tl.to(this.references.headlineRef.current, {
				duration: 0.5,
				onComplete: () => {
					this.setState({
						outAnimation: false,
						inAnimation: true,
						shouldAnimateDesc: false,
						shouldAnimate: false
					}, () => {
						animateComponentText(this.references.headlineRef.current);
						animateComponentText(this.references.descRef.current);
					})
				}
			});
			this.tl.to('.dollars-cents', {
				duration: 2,
				fontSize: '8em',
				opacity: 1
			})
			this.tl.to(counter, {
				duration: 1,
				delay: 1,
				value: 60,
				roundProps: 'value',
				onUpdate: function () {
					updateCounter(counter.value)
				}
			}, "-=1")
			this.tl.to(ccounter, {
				duration: 1,
				value: 10,
				roundProps: 'value',
				onUpdate: function () {
					updatecCounter(ccounter.value)
				}
			})

		}
		this.inUnanimated = false;
	}
	update = () => {
		if (!this._isMounted) return;
		if (resizeRendererToDisplaySize(this.renderer)) {
			const canvas = this.renderer.domElement;
			this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
			this.camera.updateProjectionMatrix();
		}

		this.controls.update();
		this.zoom = this.controls.target.distanceTo(this.controls.object.position)
		if (this.modelMesh) {
			if (this.zoom > 200 && this.zoom < 1000) {
				if (!this.state.outAnimation && this.references.headlineRef) {
					this.animateZoomOut();
				}
			}
			for (let i = 0; i < this.state.count; i++) {
				this.updateParticle(i);
			}
			this.modelMesh.instanceMatrix.needsUpdate = true;
		}

		if (Math.round(this.zoom) >= this.controls.maxDistance - 400 && Math.round(this.zoom) < this.controls.maxDistance) {
			if (this.references.headlineRef && this.references.descRef)
				this.animateOut();
		}
		if (Math.round(this.zoom) > this.controls.minDistance && Math.round(this.zoom) <= 100) {
			if (!this.state.inAnimation && this.references.headlineRef) {
				this.animateZoomIn();
			}

		}
		if (Math.round(this.zoom) === this.controls.minDistance) {
			if (!this.isOver) {
				this.props.nextScene();
			}
			this.isOver = true;
		}
		if (Math.round(this.zoom) === this.controls.maxDistance) {
			if (!this.isOver) {
				this.props.prevScene();
			}
			this.isOver = true;
		}
		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(this.update);

	}

	render() {
		return <div id="sweatshopsContainer" ref={this.onSectionLoad}>
			<div ref={ref => this.references.inRef = ref} className="show-up">
				<ZoomInButton />
			</div>
			<div ref={ref => this.references.outRef = ref} className="show-up">
				<ZoomOutButton />
			</div>

			<AnimatedText
				id="sweatshopsHeadline"
				ref={this.references.headlineRef}
				animatedText={[
					{
						shouldAnimate: this.state.shouldAnimate,
						text: texts.sweatshopsSequence.headline
					},
					{
						shouldAnimate: this.state.outAnimation,
						text: texts.sweatshopsSequence.zoomOutheadline
					},
					{
						shouldAnimate: this.state.inAnimation,
						text: texts.sweatshopsSequence.zoomInheadline
					},
				]
				}
			/>
			<div id="sixty" className="dollars-cents">
				{this.state.inAnimation && (<span><span ref={ref => this.sixtyRef = ref}>{this.state.sixtyCounter}</span>$</span>)}
			</div>
			<div id="ten" className="dollars-cents">
				{this.state.inAnimation && (<span><span ref={ref => this.tenRef = ref}>{this.state.centsCounter}</span>c</span>)}
			</div>

			<AnimatedText
				id="sweatshopsDesc"
				ref={this.references.descRef}
				animatedText={[
					{
						shouldAnimate: this.state.shouldAnimateDesc,
						text: texts.sweatshopsSequence.description
					},
					{
						shouldAnimate: this.state.outAnimation,
						text: texts.sweatshopsSequence.zoomOutdescription
					},
					{
						shouldAnimate: this.state.inAnimation,
						text: texts.sweatshopsSequence.zoomIndescription
					},
				]
				}
			/>

		</div>
	}
}

export default SweatshopsSequence;

