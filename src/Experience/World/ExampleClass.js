import * as THREE from 'three'
import Model from './Abstracts/Model.js'
import Experience from '../Experience.js'
import Debug from '../Utils/Debug.js'
import State from "../State.js";
import Materials from "../Materials/Materials.js";

export default class ExampleClass extends Model {
    experience = Experience.getInstance()
    debug = Debug.getInstance()
    state = State.getInstance()
    materials = Materials.getInstance()
    scene = experience.scene
    time = experience.time
    camera = experience.camera.instance
    renderer = experience.renderer.instance
    resources = experience.resources
    container = new THREE.Group();

    constructor() {
        super()

        this.setModel()
        this.setDebug()
    }

    setModel() {
        const stencilRef = 1

        // // create plane
        // this.planeGeometry = new THREE.PlaneGeometry( 2, 2 );
        // this.planeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
        // this.planeMaterial.depthWrite = false;
        // this.planeMaterial.stencilWrite = true;
        // this.planeMaterial.stencilRef = stencilRef;
        // this.planeMaterial.stencilFunc = THREE.AlwaysStencilFunc;
        // this.planeMaterial.stencilZPass = THREE.ReplaceStencilOp;
        //
        // this.plane = new THREE.Mesh( this.planeGeometry, this.planeMaterial );
        // this.plane.position.z += 1
        // this.plane.position.x += 1
        //
        // this.container.add( this.plane );

        // texture
        this.displacementTexture = this.resources.items.displacementTexture

        // add example cube
        this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
        this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.material.map = this.displacementTexture
        // this.material.stencilRef = stencilRef;
        // this.material.stencilFunc = THREE.EqualStencilFunc;
        // this.material.stencilWrite = true;


        this.cube = new THREE.Mesh( this.geometry, this.material );


        // add example cube
        this.geometry2 = new THREE.TorusKnotGeometry( 2.5, 1, 150, 40 );
        this.material2 = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        this.material2.map = this.displacementTexture

        this.cube2 = new THREE.Mesh( this.geometry2, this.material2 );
        this.cube2.scale.set(0.2, 0.2, 0.2)


        this.cube2.position.x = 2

        this.cube.layers.enable( this.state.layersConst.BLOOM_SCENE );


        this.container.add( this.cube );
        this.container.add( this.cube2 );
        this.scene.add( this.container );



    }

    resize() {

    }

    setDebug() {
        if ( !this.debug.active ) return

        this.debug.createDebugTexture( this.resources.items.displacementTexture )
    }

    update( deltaTime ) {
        //this.cube2.rotation.y += deltaTime * 20
        //this.cube.rotation.y += deltaTime * 30
    }

}
