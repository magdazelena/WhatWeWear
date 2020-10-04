import THREE from '../three';
var yellowPhong = new THREE.MeshPhongMaterial({
    color: 0xE29300,
    skinning: true,
    morphTargets: true,
    specular: 0xE29380,
    reflectivity: 0.8,
    shininess: 20,
});
export default yellowPhong;