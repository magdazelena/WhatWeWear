import React, { useState, useEffect, useRef } from 'react';
import THREE from '3d/three';
import { TimelineMax, TweenLite } from 'gsap';
import texts from 'dictionary/en.json';
import { animateText, generateTextForAnimation } from 'helpers/textAnimations';
import ZoomInButton from 'objects/ZoomInButton';
import ZoomOutButton from 'objects/ZoomOutButton';
import NextButton from 'objects/NextButton';
//3d tools
import resizeRendererToDisplaySize from '3d/utils/resizeRendererToDisplaySize';
import camera from '3d/utils/camera';
import yellowHemiLight from '3d/utils/lights/hemisphereLight--yellow';
import yellowPhong from '3d/materials/yellowPhong';
const TextileSequence = (props) => {
	const { renderer, onUnmount, nextScene } = props
	let refs = {
		sequenceRef: useRef(),
		headlineRef: useRef(),
		descRef: useRef(),
		buttonRef: useRef(),
		inRef: useRef(),
		outRef: useRef(),
	}

	const [shouldAnimate, setShouldAnimate] = useState(false)
	const [shouldAnimateDesc, setShouldAnimateDesc] = useState(false)
	const [inAnimation, setInAnimation] = useState(false)

	const scene = new THREE.Scene();
	const loader = new THREE.FBXLoader();
	let mesh = null;
	const dummy = new THREE.Object3D();
	const amount = 15;
	const tl = new TimelineMax();
	let controls, zoom, outUnanimated, count
	let _isMounted = false
	useEffect(() => {
		if (shouldAnimate && refs.headlineRef.current) [...refs.headlineRef.current.getElementsByTagName('span')].forEach((span, i) => {
			animateText(span, i).play();
		})
	}, [shouldAnimate, refs.headlineRef])
	useEffect(() => {
		if (shouldAnimateDesc && refs.descRef.current) [...refs.descRef.current.getElementsByTagName('span')].forEach((span, i) => {
			animateText(span, i).play();
		})
	}, [shouldAnimateDesc, refs.descRef])
	useEffect(() => {
		[...refs.headlineRef.current.getElementsByTagName('span')].forEach((span, i) => {
			animateText(span, i).play();
		});
		[...refs.descRef.current.getElementsByTagName('span')].forEach((span, i) => {
			animateText(span, i).play();
		})
	}, [inAnimation, refs.headlineRef, refs.descRef])
	useEffect(() => {
		_isMounted = true
		init();
		update();
		TweenLite.to(refs.outRef.current, 1, {
			opacity: 1
		})
		TweenLite.to(refs.inRef.current, 1, {
			opacity: 0
		})
		tl.to(refs.headlineRef.current, {
			duration: 0.2,
			onComplete: () => {
				setShouldAnimate(true)
			}
		})
		tl.to(refs.descRef.current, {
			duration: 0.2,
			onComplete: () => {
				setShouldAnimateDesc(true)
			}
		})
		return () => {
			onUnmount()
			_isMounted = false

		}
	}, [])
	useEffect(() => {
		console.log(renderer)
	}, [renderer])

	const init = () => {
		controls = new THREE.OrbitControls(camera, renderer.domElement);

		count = Math.pow(amount, 2);
		//controls.update() must be called after any manual changes to the camera's transform
		camera.position.set(0, 0, 10);
		controls.maxDistance = 60;
		controls.maxZoom = 200;
		controls.minDistance = 2;
		controls.update();
		//lights
		// Add hemisphere light to scene
		scene.add(yellowHemiLight);
		const modelPath = '3d/models/th.fbx';
		var creationFuntion = (function (obj) {
			let model = obj;

			createInstancedMesh(model.children[0].geometry);

		})
		loader.load(
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
	const createInstancedMesh = (geometry) => {
		mesh = new THREE.InstancedMesh(geometry, yellowPhong, count);
		mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		mesh.position.set(7, 5, 0);
		scene.add(mesh);
	}
	outUnanimated = true;
	const animateOut = function () {
		if (outUnanimated) {
			TweenLite.to(refs.outRef.current, 1, {
				opacity: 0
			})
			TweenLite.to(refs.inRef.current, 1, {
				opacity: 1
			});
			tl.to(refs.headlineRef.current, {
				duration: .1,
				onComplete: () => {
					if (refs.headlineRef.current) [...refs.headlineRef.current.getElementsByTagName('span')].forEach((span, i) => {
						animateText(span, i).reverse(0);
					});
				}
			});
			tl.to(refs.descRef.current, {
				duration: .1,
				onComplete: () => {
					if (refs.descRef.current) [...refs.descRef.current.getElementsByTagName('span')].forEach((span, i) => {
						animateText(span, i).reverse(0);
					});
				}
			});
			tl.to(refs.headlineRef.current, {
				duration: .1,
				onComplete: () => {
					setInAnimation(true)
					setShouldAnimate(false)
					setShouldAnimate(false)
				}
			});
		}
		outUnanimated = false;
	}
	const showNextButton = () => {
		tl.to(refs.buttonRef.current, {
			opacity: 1,
			duration: .1,
		})
	}
	const update = () => {
		if (!_isMounted) return
		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}


		let delta = performance.now();
		controls.update();
		zoom = controls.target.distanceTo(controls.object.position)
		if (mesh) {
			var i = 0;
			var offset = (amount - 2) / 10;
			for (var x = 0; x < amount; x++) {
				for (var y = 0; y < amount; y++) {
					if (i % 2 === 0) {
						dummy.rotation.z = Math.PI / 2;
						dummy.position.set(2 + Math.sin(delta * 0.00005 + Math.random() / 100), Math.sin(offset * delta * 0.0005) - y, 0);
					} else {
						dummy.rotation.z = 0;
						dummy.position.set(offset * Math.sin(delta * 0.0005 + Math.random() / 100) - x, -20, 0);
					}
					dummy.updateMatrix();
					mesh.setMatrixAt(i++, dummy.matrix);
				}
			}
			mesh.material.color = new THREE.Color('hsl(' + 10 * zoom / 40 + ',70%, ' + Math.round(30 + zoom / 3) + '%)');
			mesh.instanceMatrix.needsUpdate = true;
			mesh.material.needsUpdate = true;
		}

		if (Math.round(zoom) >= controls.maxDistance - 40 && Math.round(zoom) < controls.maxDistance) {
			animateOut();
		}
		if (Math.round(zoom) == controls.minDistance) showNextButton()
		renderer.render(scene, camera);
		requestAnimationFrame(update);

	}

	return <div id="textileSequence" ref={refs.sequenceRef}>
		<div id="textileHeadline" ref={refs.headlineRef}>
			{shouldAnimate && (generateTextForAnimation(texts.textileSequence.headline.split('')))}
			{inAnimation && (generateTextForAnimation(texts.textileSequence.zoomInheadline.split('')))}
		</div>
		<div id="textileDesc" ref={refs.descRef}>
			{shouldAnimateDesc && (generateTextForAnimation(texts.textileSequence.description.split('')))}
			{inAnimation && (generateTextForAnimation(texts.textileSequence.zoomIndescription.split('')))}
		</div>

		<div ref={refs.inRef} className="show-up">
			<ZoomInButton />
		</div>
		<div ref={refs.outRef} className="show-up">
			<ZoomOutButton />
		</div>
		<div ref={refs.buttonRef} className="show-up">
			<NextButton onClick={nextScene} />
		</div>
	</div>;
}

export default TextileSequence;