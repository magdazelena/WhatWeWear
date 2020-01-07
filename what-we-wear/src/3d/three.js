import * as THREE from 'three';

window.THREE = THREE;

require('three/examples/js/controls/OrbitControls');
require('three/examples/js/loaders/GLTFLoader');

export default {...THREE, OrbitControls: window.THREE.OrbitControls, GLTFLoader: window.THREE.GLTFLoader};