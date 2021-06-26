import React, { Component } from 'react';
import THREE from '3d/three';
import { TimelineMax, TweenLite } from 'gsap';
import texts from 'dictionary/en.json';
import { animateText, generateTextForAnimation } from 'helpers/textAnimations';
import ZoomInButton from 'objects/ZoomInButton';
import ZoomOutButton from 'objects/ZoomOutButton';
//3d tools
import resizeRendererToDisplaySize from '3d/utils/resizeRendererToDisplaySize';
import camera from '3d/utils/camera';
import yellowHemiLight from '3d/utils/lights/hemisphereLight--yellow';
import yellowPhong from '3d/materials/yellowPhong';
class TextileSequence extends Component {
	constructor(props) {
		super();
		this.state = {
			sectionRef: false,
			shouldAnimate: false,
			shouldAnimateDesc: false,
			inAnimation: false
		}
		this.inRef = React.createRef();
		this.outRef = React.createRef();
		this.headlineRef = React.createRef();
		this.descRef = React.createRef();
		this.scene = new THREE.Scene();
		this.renderer = props.renderer;
		this.clock = new THREE.Clock();
		this.loader = new THREE.FBXLoader();
		this.mesh = null;
		this.dummy = new THREE.Object3D();
		this.amount = 15;
		this.isOver = false;
		this.tl = new TimelineMax();
		this.camera = camera;
	}
	onSectionLoad = node => {
		this.setState({
			sectionRef: node
		}, () => {
			this.init();
			this.update();
			TweenLite.to(this.outRef, 1, {
				opacity: 1
			})
			TweenLite.to(this.inRef, 1, {
				opacity: 0
			})
			this.tl.to(this.headlineRef, {
				duration: 0.2,
				onComplete: () => {
					this.setState({
						shouldAnimate: true

					}, () => {
						[...this.headlineRef.getElementsByTagName('span')].forEach((span, i) => {
							animateText(span, i).play();
						});
					})
				}
			})
			this.tl.to(this.descRef, {
				duration: 0.2,
				onComplete: () => {
					this.setState({
						shouldAnimateDesc: true

					}, () => {
						[...this.descRef.getElementsByTagName('span')].forEach((span, i) => {
							animateText(span, i).play();
						});
					})
				}
			})
		}
		);
	}
	init = () => {
		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

		this.count = Math.pow(this.amount, 2);
		//controls.update() must be called after any manual changes to the camera's transform
		this.camera.position.set(0, 0, 10);
		this.controls.maxDistance = 60;
		this.controls.maxZoom = 200;
		this.controls.minDistance = 2;
		this.controls.update();
		//lights
		// Add hemisphere light to scene
		this.scene.add(yellowHemiLight);
		const modelPath = '3d/models/th.fbx';
		var creationFuntion = (function (obj) {
			let model = obj;

			this.createInstancedMesh(model.children[0].geometry);

		}).bind(this);
		this.loader.load(
			modelPath,
			obj => {
				creationFuntion(obj);

			}
			, undefined,
			function (error) {
				console.error(error);
			}
		);
	}
	createInstancedMesh = (geometry) => {
		this.mesh = new THREE.InstancedMesh(geometry, yellowPhong, this.count);
		this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		this.mesh.position.set(7, 5, 0);
		this.scene.add(this.mesh);
	}
	outUnanimated = true;
	animateOut = function () {
		if (this.outUnanimated) {
			TweenLite.to(this.outRef, 1, {
				opacity: 0
			})
			TweenLite.to(this.inRef, 1, {
				opacity: 1
			});
			this.tl.to(this.headlineRef, .1, {
				onComplete: () => {
					[...this.headlineRef.getElementsByTagName('span')].forEach((span, i) => {
						animateText(span, i).reverse(0);
					});
				}
			});
			this.tl.to(this.descRef, .1, {
				onComplete: () => {
					[...this.descRef.getElementsByTagName('span')].forEach((span, i) => {
						animateText(span, i).reverse(0);
					});
				}
			});
			this.tl.to(this.headlineRef, 1, {
				onComplete: () => {
					this.setState({
						inAnimation: true,
						shouldAnimate: false,
						shouldAnimateDesc: false
					}, () => {
						[...this.headlineRef.getElementsByTagName('span')].forEach((span, i) => {
							animateText(span, i).play();
						});
						[...this.descRef.getElementsByTagName('span')].forEach((span, i) => {
							animateText(span, i).play();
						});
					})
				}
			});
		}
		this.outUnanimated = false;
	}
	update = () => {
		if (resizeRendererToDisplaySize(this.renderer)) {
			const canvas = this.renderer.domElement;
			this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
			this.camera.updateProjectionMatrix();
		}


		let delta = performance.now();
		this.controls.update();
		this.zoom = this.controls.target.distanceTo(this.controls.object.position)
		if (this.mesh) {
			var i = 0;
			var offset = (this.amount - 2) / 10;
			for (var x = 0; x < this.amount; x++) {
				for (var y = 0; y < this.amount; y++) {
					if (i % 2 === 0) {
						this.dummy.rotation.z = Math.PI / 2;
						this.dummy.position.set(2 + Math.sin(delta * 0.00005 + Math.random() / 100), Math.sin(offset * delta * 0.0005) - y, 0);
					} else {
						this.dummy.rotation.z = 0;
						this.dummy.position.set(offset * Math.sin(delta * 0.0005 + Math.random() / 100) - x, -20, 0);
					}
					this.dummy.updateMatrix();
					this.mesh.setMatrixAt(i++, this.dummy.matrix);
				}
			}
			this.mesh.material.color = new THREE.Color('hsl(' + 10 * this.zoom / 20 + ',70%, ' + Math.round(30 + this.zoom / 3) + '%)');
			this.mesh.instanceMatrix.needsUpdate = true;
			this.mesh.material.needsUpdate = true;
		}

		if (Math.round(this.zoom) >= this.controls.maxDistance - 40 && Math.round(this.zoom) < this.controls.maxDistance) {
			this.animateOut();

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
	resizeRendererToDisplaySize = (renderer) => {
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
		return <div id="textileSequence" ref={this.onSectionLoad}>
			<div id="textileHeadline" ref={ref => { this.headlineRef = ref }}>
				{this.state.shouldAnimate && (generateTextForAnimation(texts.textileSequence.headline.split('')))}
				{this.state.inAnimation && (generateTextForAnimation(texts.textileSequence.zoomInheadline.split('')))}
			</div>
			<div id="textileDesc" ref={ref => { this.descRef = ref }}>
				{this.state.shouldAnimateDesc && (generateTextForAnimation(texts.textileSequence.description.split('')))}
				{this.state.inAnimation && (generateTextForAnimation(texts.textileSequence.zoomIndescription.split('')))}
			</div>

			<div ref={ref => this.inRef = ref} className="show-up">
				<ZoomInButton />
			</div>
			<div ref={ref => this.outRef = ref} className="show-up">
				<ZoomOutButton />
			</div>
		</div>;
	}
}
export default TextileSequence;