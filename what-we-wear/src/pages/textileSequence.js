import React, {Component} from 'react';
import THREE from '../3d/three';
class TextileSequence extends Component{
    constructor(props){
        super(props);
        this.state = {
            sectionRef: false
        }
        this.canvasRef = React.createRef();
        this.clock = new THREE.Clock();
        this.loader = new THREE.FBXLoader();
        this.mesh = null;
        this.dummy = new THREE.Object3D();
        this.amount = 30;
    }
    onSectionLoad = node => {
        this.setState({
            sectionRef: node
        }, ()=> {
            this.init();
            this.update();
        }
        );
    }
    init=() =>{
        const canvas = this.canvasRef.current;
        //scene
        this.scene = new THREE.Scene();
        //renderer
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        this.renderer.shadowMap.enabled = true;
     this.state.sectionRef.replaceChild(this.renderer.domElement, this.state.sectionRef.getElementsByTagName('canvas')[0]);
        //camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
          );
          var axesHelper = new THREE.AxesHelper( 5 );
          this.scene.add( axesHelper );
          this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.count = Math.pow(this.amount, 2);
            //controls.update() must be called after any manual changes to the camera's transform
            this.camera.position.set( 0 , 0, 10 );
            this.controls.update();
          //lights
          let hemiLight = new THREE.HemisphereLight(0xffffff,  0.99);
            hemiLight.position.set(100, 50, 100);
            // Add hemisphere light to scene
            this.scene.add(hemiLight);
            const modelPath = '../3d/models/th.fbx';
            var creationFuntion=(function(obj){
                let model = obj;
            
                this.createInstancedMesh(model.children[0].geometry);
                
            }).bind(this);
            this.loader.load(
                modelPath,
                obj => {creationFuntion(obj);
                
                }
                ,undefined,
                function(error) {
                    console.error(error);
                }
            );
    }
    createInstancedMesh = (geometry) => {
        var mat1 = new THREE.MeshPhongMaterial( 
            { 
                color: 0xE29300, 
                specular: 0xE29380     
         } );
        this.mesh = new THREE.InstancedMesh(geometry, mat1, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.mesh.position.set(7,5,0)
        this.scene.add(this.mesh);
    }
    update=()=>{
        if (this.resizeRendererToDisplaySize(this.renderer)) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
          }

            
        let delta = this.clock.getDelta();

        this.controls.update();
        if ( this.mesh ) {


            var i = 0;
            var offset = ( this.amount - 1 ) / 20;

            for ( var x = 0; x < this.amount; x ++ ) {

                for ( var y = 0; y < this.amount; y ++ ) {

                    
                    
                    if(i % 2 === 0){
                        this.dummy.rotation.z = Math.PI/2;
                        this.dummy.position.set(2+ Math.sin(y/2+ delta ) , offset-y/2, 0);
                    }else{
                        this.dummy.rotation.z = 0;
                        this.dummy.position.set(offset - x/1.5, -15, 0);
                    }
                       
                        this.dummy.updateMatrix();

                        this.mesh.setMatrixAt( i ++, this.dummy.matrix );

                    

                }

            }

            this.mesh.instanceMatrix.needsUpdate = true;

        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.update);
       
    }
    resizeRendererToDisplaySize=(renderer)=> {
        const canvas = renderer.domElement;
        let width = window.innerWidth;
        let height = window.innerHeight;
        let canvasPixelWidth = canvas.width / window.devicePixelRatio;
        let canvasPixelHeight = canvas.height / window.devicePixelRatio;
      
        const needResize =
          canvasPixelWidth !== width || canvasPixelHeight !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
      }
    render = () => {
        return <div id="textileSequence" ref={this.onSectionLoad}>
            <canvas ref={ref=>this.canvasRef = ref}></canvas>
        </div>;
    }
}
export default TextileSequence;