import THREE from '../three';
let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
let floorMaterial = new THREE.MeshPhongMaterial({
    color: 0x000000
});
floorMaterial.opacity = 0;
let floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
floor.receiveShadow = true;
floor.position.y = -11;

export default floor;