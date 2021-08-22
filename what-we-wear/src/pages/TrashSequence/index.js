import React, { useRef, useState, useEffect } from 'react';
import THREE from '3d/three';
import { TimelineMax } from 'gsap';
import texts from 'dictionary/en.json';
import { animateText, generateTextForAnimation } from 'helpers/textAnimations';
import trashFragmentShader from '3d/shaders/trashFragmentShader';
import trashVertexShader from '3d/shaders/trashVertexShader';
import resizeRendererToDisplaySize from '3d/utils/resizeRendererToDisplaySize';
import camera from '3d/utils/camera';

const TrashSequence = (props) => {
    const { renderer, nexScene, onUnmount } = props
    let refs = {
        buttonRef: useRef(),
        headlineRef: useRef(),
        descRef: useRef(),
        desc2Ref: useRef(),
        desc3Ref: useRef(),
        videoRef: useRef(),
        sequenceRef: useRef()
    }
    const [shouldAnimate, setShouldAnimate] = useState(false)
    const [shouldAnimateDesc, setShouldAnimateDesc] = useState(false)
    const [shouldAnimateDesc2, setShouldAnimateDesc2] = useState(false)
    const [shouldAnimateDesc3, setShouldAnimateDesc3] = useState(false)
    const tl = new TimelineMax()
    let scene
    useEffect(() => {
        init()
        animateTexts()
        update()
        return () => {
            refs = {}
            onUnmount()
        }
    }, [])
    useEffect(() => {
        if (shouldAnimate) [...refs.headlineRef.current.getElementsByTagName('span')].forEach((span, i) => {
            animateText(span, i).play();
        })
    }, [shouldAnimate])

    useEffect(() => {
        if (shouldAnimateDesc) [...refs.descRef.current.getElementsByTagName('span')].forEach((span, i) => {
            animateText(span, i).play();
        })
    }, [shouldAnimateDesc])
    useEffect(() => {
        if (shouldAnimateDesc2) [...refs.desc2Ref.current.getElementsByTagName('span')].forEach((span, i) => {
            animateText(span, i).play();
        })
    }, [shouldAnimateDesc2])
    useEffect(() => {
        if (shouldAnimateDesc3) [...refs.desc3Ref.current.getElementsByTagName('span')].forEach((span, i) => {
            animateText(span, i).play();
        })
    }, [shouldAnimateDesc3])

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
        tl.to(refs.desc2Ref.current, {
            duration: 1,
            onComplete: () => {
                setShouldAnimateDesc2(true)
            }
        }, "-=3")
        tl.to(refs.desc3Ref.current, {
            duration: 1,
            onComplete: () => {
                setShouldAnimateDesc3(true)
            }
        }, "-=3")
    }
    const init = () => {
        //scene
        scene = new THREE.Scene();


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
    }
    const update = () => {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }


        let delta = performance.now();
        let obj = scene.children[1];
        obj.rotation.y = delta * 0.0005;
        obj.material.uniforms["time"].value = delta * 0.005;
        // obj.material.uniforms["sineTime"].value = Math.sin( obj.material.uniforms[ "time" ].value * 0.05 );



        renderer.render(scene, camera);
        requestAnimationFrame(update);

    }


    return <div id="trashSequence" ref={refs.sequenceRef}>
        <div id="trashHeadline" ref={refs.headlineRef}>
            {shouldAnimate && (generateTextForAnimation(texts.trashSequence.headline.split('')))}
        </div>
        <div id="trashDesc" ref={refs.descRef}>
            {shouldAnimateDesc && (generateTextForAnimation(texts.trashSequence.description.split('')))}
        </div>
        <div id="trashDesc2" ref={refs.desc2Ref}>
            {shouldAnimateDesc2 && (generateTextForAnimation(texts.trashSequence.description2.split('')))}
        </div>
        <div id="trashDesc3" ref={refs.desc3Ref}>
            {shouldAnimateDesc3 && (generateTextForAnimation(texts.trashSequence.description3.split('')))}
        </div>
    </div>

}
export default TrashSequence;