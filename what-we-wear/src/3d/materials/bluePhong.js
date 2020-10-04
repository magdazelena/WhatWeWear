import THREE from '../three';
var bluePhong = new THREE.MeshPhongMaterial({
    color: 0x62C1EA,
    skinning: true,
    morphTargets: true,
    specular: 0x009300,
    reflectivity: 1
});

export default bluePhong;