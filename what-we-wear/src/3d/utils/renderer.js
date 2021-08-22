import THREE from '../three';

const canvas = document.createElement('canvas');
var renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
//renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;

export default renderer;