import THREE from '../three';
var yellowPhong = new THREE.MeshPhongMaterial({
    color: 0xffe1a8,
    skinning: true,
    morphTargets: true,
    specular: 0xffe1a8,
    reflectivity: 0.8,
    shininess: 20,
});
export default yellowPhong;