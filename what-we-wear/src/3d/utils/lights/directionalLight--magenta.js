import THREE from '../../three';
let d = 8.25;
var magentaDirectionalLight = new THREE.DirectionalLight(0xff00ff, 0.84);
magentaDirectionalLight.position.set(8, 28, 18);
magentaDirectionalLight.castShadow = true;
magentaDirectionalLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
magentaDirectionalLight.shadow.camera.near = 0.1;
magentaDirectionalLight.shadow.camera.far = 1500;
magentaDirectionalLight.shadow.camera.left = d * -1;
magentaDirectionalLight.shadow.camera.right = d;
magentaDirectionalLight.shadow.camera.top = d;
magentaDirectionalLight.shadow.camera.bottom = d * -1;

export default magentaDirectionalLight;