import THREE from '../three';
var bluePhong = new THREE.MeshPhongMaterial({
    color: 0x569692,
    skinning: true,
    morphTargets: true,
    specular: 0x723d46,
    reflectivity: 1
});

export default bluePhong;