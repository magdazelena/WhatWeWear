import React, { useEffect, useRef, useState } from 'react';
import THREE from '3d/three';
import NextButton from 'objects/NextButton';

import camera from '3d/utils/camera';
import yellowHemiLight from '3d/utils/lights/hemisphereLight--yellow';
import texts from 'dictionary/en.json';
import AnimatedText from '../components/AnimatedText';

//particle system by example of Rugile, Jack: https://github.com/jackrugile/3d-particle-explorations/blob/master/js/demo-8/system.js
const ExplosionsSequence = (props) => {
	const { renderer, onUnmount, nextScene } = props
	const videoRef = useRef()
	const sequenceRef = useRef()
	const headlineRef = useRef()
	const descriptionRef = useRef()
	const [shouldAnimate, setShouldAnimate] = useState(false)
	const [shouldAnimateDesc, setShouldAnimateDesc] = useState(false)
	let _isMounted = false
	let scene, controls

	useEffect(() => {
		_isMounted = true
		scene = new THREE.Scene()
		setShouldAnimate(true)
		return () => {
			onUnmount()
			renderer.clear()
			_isMounted = false
		}
	}, [])


	const init = () => {
		controls = new THREE.OrbitControls(camera, renderer.domElement)
		controls.maxDistance = 1000;
		controls.minDistance = 2;
		camera.position.set(0, 20, 100);
		controls.update();
		camera.near = 1;
		camera.far = 10000;
		camera.position.z = 1000;
		camera.position.x = 0;
		camera.position.y = 100;
		camera.updateProjectionMatrix();
		camera.lookAt(new THREE.Vector3());
		yellowHemiLight.position.set(0, 50, 0);
		//scene.add(yellowHemiLight);
		window.addEventListener('resize', onWindowResize, false);
	}

	const createVideoTexture = () => {
		const video = videoRef.current;
		video.currentTime = 1;
		video.muted = true;
		video.loop = true;
		video.autoPlay = true
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
					value: new THREE.Color(0x00ff00)
				}
			},
			vertexShader: 'varying vec2 vUv;void main(){vUv = uv;vec4 mvPosition = modelViewMatrix * vec4 (position, 1.0);gl_Position = projectionMatrix * mvPosition;}',
			fragmentShader: 'uniform sampler2D texture;uniform vec3 color;varying vec2 vUv;void main(){vec3 tColor = texture2D( texture, vUv).rgb;float a = (length(tColor - color) - 0.3) * 0.4;gl_FragColor = vec4(tColor, a);}',
			transparent: true
		})
		const plane = new THREE.Mesh(planeGeo, planeMaterial);
		plane.position.x = 0;
		plane.position.y = 0;
		scene.add(plane);
	}
	const update = () => {
		if (!_isMounted) return
		requestAnimationFrame(update);
		renderer.render(scene, camera);
	}
	const onWindowResize = () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	useEffect(() => {
		if (videoRef) {
			createVideoTexture()
			update()
			videoRef.current.play()
		}
	}, [videoRef])

	useEffect(() => {
		if (sequenceRef) {
			init();
		}
	}, [sequenceRef])

	return <div id="explosionsContainer">
		<div id="explosionsSequence" ref={sequenceRef}>
			<video src="images/Untitled.mp4" muted="muted" autoPlay={true} id="explosionsVideo" ref={videoRef}></video>
			<AnimatedText
				id="explosionsHeadline"
				ref={headlineRef}
				shouldAnimate={shouldAnimate}
				text={texts.explosionsSequence.headline}
				onAnimationEnd={() => setShouldAnimateDesc(true)}
			/>
			<AnimatedText
				id="explosionsDescription"
				ref={descriptionRef}
				shouldAnimate={shouldAnimateDesc}
				text={texts.explosionsSequence.description}
			/>
			<NextButton onClick={nextScene} />
		</div>
	</div>

}

export default ExplosionsSequence;