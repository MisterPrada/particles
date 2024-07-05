import * as THREE from 'three'
import Experience from '../Experience.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ViewHelper } from 'three/examples/jsm/helpers/ViewHelper.js'
import Gizmo from '../Utils/Gizmo.js'

export default class DebugHelpers {
    experience = new Experience()
    debug = experience.debug
    scene = experience.scene
    time = experience.time
    camera = experience.camera.instance
    renderer = experience.renderer.instance
    resources = experience.resources
    cursor = experience.cursor
    timeline = experience.timeline;
    controls = experience.camera?.controls
    container = new THREE.Group();

    constructor() {
        if ( !this.debug.active ) return

        this.setupDebugFeatures()
    }

    setupDebugFeatures() {
        //this.addGlobalAxes()
        this.addViewHelper()
    }

    addGlobalAxes() {
        const axesHelper = new THREE.AxesHelper( 5 );
        this.scene.add( axesHelper );
    }

    addViewHelper() {
        this.gizmo = new Gizmo(this.camera, { size: 100, padding: 8 });
        document.body.appendChild(this.gizmo);
        this.gizmo.onAxisSelected = function(axis) {
            console.log(axis); // { axis: "x", direction: THREE.Vector3(1,0,0) }
        }
    }

    resize() {

    }

    update( deltaTime ) {
        this.gizmo?.update();
    }

}
