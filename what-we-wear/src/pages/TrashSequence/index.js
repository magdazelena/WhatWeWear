import React, { useRef, useState, useEffect } from 'react';
import THREE from '3d/three';
import { TimelineMax } from 'gsap';
import texts from 'dictionary/en.json';
import trashFragmentShader from '3d/shaders/trashFragmentShader';
import trashVertexShader from '3d/shaders/trashVertexShader';
import NextButton from 'objects/NextButton';
import resizeRendererToDisplaySize from '3d/utils/resizeRendererToDisplaySize';
import camera from '3d/utils/camera';
import AnimatedText from 'pages/components/AnimatedText';

const TrashSequence = (props) => {
    const { renderer, nextScene, onUnmount } = props
    let refs = {
        buttonRef: useRef(),
        headlineRef: useRef(),
        descRef: useRef(),
        videoRef: useRef(),
        sequenceRef: useRef()
    }
    const [shouldAnimate, setShouldAnimate] = useState(false)
    const [shouldAnimateDesc, setShouldAnimateDesc] = useState(false)
    const [_isMounted, setMounted] = useState(false)
    const tl = new TimelineMax()
    const scene = new THREE.Scene();
    useEffect(() => {
        setMounted(true)
        return () => {
            setMounted(false)
            refs = {}
            onUnmount()
            renderer.clear()
        }
    }, [])

    useEffect(() => {
        if (_isMounted) {
            init()
            animateTexts()
        }
    }, [_isMounted])
    const animateTexts = function () {
        tl.to(refs.headlineRef.current, {
            duration: .3,
            onComplete: () => {
                setShouldAnimate(true)
            }
        })
        tl.to(refs.descRef.current, {
            duration: 1,
            onComplete: () => {
                setShouldAnimateDesc(true)
            }
        })
        tl.to(scene.children[1].material.uniforms["sineTime"], {
            duration: 1,
            delay: 3,
            value: -.5
        })
        tl.to(scene.children[1].material.uniforms["blue"], {
            duration: 1,
            value: -10
        }, '-=3')
        tl.to(refs.buttonRef.current, {
            opacity: 1,
            duration: 1,
        })
    }
    const init = () => {
        //scene
        camera.position.set(0, 0, 6);
        //lights 
        let hemiLight = new THREE.HemisphereLight(0xE29300, 0.99);
        hemiLight.position.set(100, 50, 100);
        // Add hemisphere light to scene
        scene.add(hemiLight);

        //particles as per example
        let vector = new THREE.Vector4();
        const instances = 1500;
        let positions = [];
        let offsets = [];
        let colors = [];
        let orientationsStart = [];
        let orientationsEnd = [];

        positions.push(0.025, - 0.025, 0);
        positions.push(- 0.025, 0.025, 0);
        positions.push(0, 0, 0.025);


        for (let i = 0; i < instances; i++) {
            offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            colors.push(Math.random() / 2, Math.random() / 3, Math.random(), Math.random());
            vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            vector.normalize();

            orientationsStart.push(vector.x, vector.y, vector.z, vector.w);
            vector.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
            vector.normalize();

            orientationsEnd.push(vector.x, vector.y, vector.z, vector.w);

        }
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.instanceCount = instances;
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
        geometry.setAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4));
        geometry.setAttribute('orientationStart', new THREE.InstancedBufferAttribute(new Float32Array(orientationsStart), 4));
        geometry.setAttribute('orientationEnd', new THREE.InstancedBufferAttribute(new Float32Array(orientationsEnd), 4));

        const material = new THREE.RawShaderMaterial({
            uniforms: {
                "time": { value: 1.0 },
                "sineTime": { value: 1.0 },
                "blue": { value: 1.0 }
            },
            vertexShader: trashVertexShader,
            fragmentShader: trashFragmentShader,
            side: THREE.DoubleSide,
            transparent: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        renderer.render(scene, camera)
        update()
    }
    const update = () => {
        if (!_isMounted) return
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }


        let delta = performance.now();
        let obj = scene.children[1];
        obj.rotation.y = delta * 0.0005;
        obj.material.uniforms["time"].value = delta * 0.005;
        obj.material.uniforms["sineTime"].value = Math.sin(obj.material.uniforms["time"].value * 0.05);



        renderer.render(scene, camera);
        requestAnimationFrame(update);

    }
    const goToNextScene = () => {
        renderer.clear()

        setMounted(false)
        nextScene()
    }


    return <div id="trashSequence" ref={refs.sequenceRef}>
        <AnimatedText
            ref={refs.headlineRef}
            id="trashHeadline"
            shouldAnimate={shouldAnimate}
            text={texts.trashSequence.headline}
        />
        <AnimatedText
            ref={refs.descRef}
            id="trashDesc3"
            shouldAnimate={shouldAnimateDesc}
            text={texts.trashSequence.description}
        />
        <div ref={refs.buttonRef} className="show-up">
            <NextButton onClick={goToNextScene} />
        </div>
    </div>

}
export default TrashSequence;