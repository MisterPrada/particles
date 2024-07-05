import * as THREE from 'three'
import Experience from './Experience.js'
import Sizes from "./Utils/Sizes.js"

export default class State {
    static _instance = null

    static getInstance() {
        return State._instance || new State()
    }

    experience = Experience.getInstance()
    renderer = this.experience.renderer.instance
    postprocessing = true;
    floatType = this.renderer.capabilities.isWebGL2 ? THREE.FloatType : THREE.HalfFloatType;

    unrealBloom = {
        enabled: false,
        strength: 0.6,
        radius: 1.9,
        threshold: 0.362,
    }

    motionBlur = {
        enabled: false,
        cameraBlur: true,
        animate: true,
        samples: 8,
        expandGeometry: 1,
        interpolateGeometry: 1,
        smearIntensity: 5,
        speed: 20,
        renderTargetScale: 1,
        jitter: 1,
        jitterStrategy: 2,
    };

    bokeh = {
        enabled: true,
        focus: 91.902,
        aperture: 3.5,
        maxblur: 0
    }

    constructor() {
        // Singleton
        if ( State._instance ) {
            return State._instance
        }
        State._instance = this

        this.experience = Experience.getInstance()
        this.renderer = this.experience.renderer.instance
        this.scene = this.experience.scene
        this.camera = this.experience.camera.instance
        this.canvas = this.experience.canvas
        this.sizes = Sizes.getInstance()

        this.setLayers()
    }

    setLayers() {
        this.layersConst = {
            BLOOM_SCENE: 1,
            DEFAULT: 0,
        }
        this.bloomLayer = new THREE.Layers();
        this.bloomLayer.set( this.layersConst.BLOOM_SCENE );
    }

    resize() {

    }
}
