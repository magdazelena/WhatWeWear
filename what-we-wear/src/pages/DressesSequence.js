import React, {Component} from 'react';
import {TweenMax, Expo, TimelineMax} from 'gsap/all';
import ScrollMagic from 'scrollmagic';
import texts from '../dictionary/en.json';
import THREE from '../3d/three';
require("../helpers/scrollmagicdebug.js");
class DressesSequence extends Component {
    componentDidMount(){
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        var geometry = new THREE.BoxGeometry( 3, 3, 3 );
        var geometry1 = new THREE.BoxGeometry(8,8,8);
        var material = new THREE.MeshPhysicalMaterial(
            {
            metalness: 0.7,
            clearcoat: 0.9,
            clearcoatRoughness: 0.3,
            reflectivity: 0.8,
            color: 0Xffffff
            });
        var material1 = new THREE.MeshLambertMaterial({
        color: 0xff4594,
        reflectivity: 0.6,
        transparent: true,
        opacity: 0.6
        })
        var cube = new THREE.Mesh( geometry, material );
        var cube1 = new THREE.Mesh(geometry1, material1);
        var dress1 = null;
        var loader = new THREE.GLTFLoader();

            loader.load( '3d/models/sukienkaMap.gltf', function ( gltf ) {
                gltf.scene.scale.x = gltf.scene.scale.y = gltf.scene.scale.z = 0.5;
                gltf.scene.position.x = -2;
                gltf.scene.position.z = 4;
                gltf.scene.position.y = -6; 
                gltf.scene.traverse( object => {
                    if(object.isMesh){
                        object.material = material;
                        object.material.emissive =new THREE.Color(0x0000ff);
                        object.material.emissiveIntensity = .3;
                        object.castShadow = true;
                        object.receiveShadow = true;
                    }
                })
                dress1 = gltf.scene;
                scene.add( gltf.scene );
            }, undefined, function ( error ) {

                console.error( error );

            } );
       // scene.add( cube );
    //    scene.add( cube1);
        var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        scene.add( light );
        var light2 = new THREE.AmbientLight( 0xff0000 ); // soft white light
        scene.add( light2 );
        var spotLight = new THREE.SpotLight( 0xff0000 );
        spotLight.position.set( 10, 10, 10 );

        spotLight.castShadow = true;

        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;

        spotLight.shadow.camera.near = 50;
        spotLight.shadow.camera.far = 40;
        spotLight.shadow.camera.fov = 30;

        scene.add( spotLight );
        camera.position.z = 8;
        function animate() {
            requestAnimationFrame( animate );
        cube.rotation.x += 0.004;
        cube.rotation.y += 0.004;
        cube1.position.x -= 0.002;
        cube1.rotation.x -=0.002;
        if(dress1 !== null){
                dress1.position.x >= 1 ? dress1.position.x -= 4:dress1.position.x += 0.01
            
        }
            
       // camera.rotation.z += 0.001;
	    renderer.render( scene, camera );
        }
        animate(); 
        console.log(scene)
        
    }
    render () {
       return <div>

        </div>
    }
}

export default DressesSequence;