import React from 'react';
import THREE from '../../3d/three';
import SimplexNoise from 'simplex-noise';
import particlesFragmentShader from '../../3d/shaders/particlesFragmentShader';
import particlesVertexShader from '../../3d/shaders/particlesVertexShader';
import { rand } from '../../helpers/tools';
// geometry
let geometry = new THREE.BufferGeometry();
let particles = 10000;
let positions = new Float32Array(particles * 3);
let colors = new Float32Array(particles * 4);
let sizes = new Float32Array(particles);
let size = 1000;
let parts = [];
let clock = new THREE.Clock();
let simplex = new SimplexNoise();
let color = new THREE.Color();
export const generateParticles = (scene) => {
    //vec3 attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    for (var i = 0; i < particles; i++) {
        let size = rand(2, 30);
        color.setHex(0xffffff);
        part = {
            offset: 0,
            position: new THREE.Vector3(
                rand(- size / 2, size / 2),
                rand(- size / 2, size / 2),
                rand(- size / 2, size / 2)
            ),
            baseSize: size,
            size: size,
            r: color.r,
            g: color.g,
            b: color.b,
            a: 0.6,
            life: 2,
            decay: rand(0.05, 0.15),
            firstRun: true
        };
        parts.push(part);
    }


    let material = new THREE.ShaderMaterial({
        uniforms: {
            pointTexture: { value: new THREE.TextureLoader().load("../3d/particle.png") }

        },
        vertexShader: particlesVertexShader,
        fragmentShader: particlesFragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
    });
    let particleSystem = new THREE.Points(geometry, material);

    scene.add(particleSystem);
    updateParticleAttributes(true, true, true);
    updateParticles();
}
export const updateParticleAttributes = (color, position, size) => {
    let i = 0;
    while (i < particles) {
        let part = parts[i];
        if (color) {
            const colorAttribute = geometry.attributes.color;
            colorAttribute.array[i * 3 + 0] = part.r;
            colorAttribute.array[i * 3 + 1] = part.g;
            colorAttribute.array[i * 3 + 2] = part.b;
            colorAttribute.array[i * 4 + 3] = part.a;
        }
        if (position) {
            const positionAttribute = geometry.attributes.position;
            positionAttribute.array[i * 3 + 0] = part.position.x;
            positionAttribute.array[i * 3 + 1] = part.position.y;
            positionAttribute.array[i * 3 + 2] = part.position.z;
        }
        if (size) {
            const sizeAttribute = geometry.attributes.size;
            sizeAttribute.array[i] = part.size;
        }
        i++;
    }

    if (color) {
        geometry.attributes.color.needsUpdate = true;
    }
    if (position) {
        geometry.attributes.position.needsUpdate = true;
    }
    if (size) {
        geometry.attributes.size.needsUpdate = true;
    }
    geometry.computeBoundingSphere();
}
export const updateParticles = () => {
    const delta = clock.getDelta();
    let noiseTime = clock.getElapsedTime() * 0.0008;
    let noiseVelocity = simplex.noise2D(rand(200, 300), delta);
    const noiseScale = 0.001;

    for (var i = 0; i < particles; i++) {
        let part = parts[i];
        let xScaled = part.position.x * noiseScale;
        let yScaled = part.position.y * noiseScale;
        let zScaled = part.position.z * noiseScale;
        let noise1 = simplex.noise4D(
            xScaled,
            yScaled,
            zScaled,
            50 + noiseTime
        ) * 0.5;
        let noise2 = simplex.noise4D(
            xScaled + 100,
            yScaled + 100,
            zScaled + 100,
            50 + noiseTime
        ) * 0.5 + 0.5;
        let noise3 = simplex.noise4D(
            xScaled + 200,
            yScaled + 200,
            zScaled + 200,
            50 + noiseTime
        ) * 0.5 + 0.5;
        part.position.x -= Math.sin(noise1 * Math.PI * 2) + noiseVelocity * delta;
        part.position.y -= Math.sin(noise2 * Math.PI * 2) * noiseVelocity * delta;
        part.position.z += Math.sin(noise3 * Math.PI * 1.3) + noiseVelocity * delta;


        if (part.position.x - 100 < -window.innerWidth / 2)
            part.position.x = window.innerWidth + 20;
        if (part.position.y - 100 < -window.innerHeight / 2)
            part.position.y = window.innerHeight + 20;
        if (part.position.x + 100 > window.innerWidth / 2)
            part.position.x = 20;
        if (part.position.y + 100 > window.innerHeight / 2)
            part.position.y = 20;

        if (part.life > 0) {
            part.life -= part.decay * delta;
            part.a -= part.decay * delta;
        }
        if (part.life <= 0 || part.firstRun) {
            part.life = 2;
            part.position.x = rand(-size / 2, size / 2);
            part.position.y = rand(-size / 2, size / 2);
            part.position.z = rand(-size / 2, size / 2);
            part.firstRun = false;
        }
        parts[i] = part;

    }
    updateParticleAttributes(true, true, true);
}
export default generateParticles;