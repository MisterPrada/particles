import * as THREE from 'three'
import Experience from '../Experience.js'
import Sizes from "./Sizes.js"
import State from "../State.js";

export default class FBO {

    static _instance = null

    static getInstance() {
        return FBO._instance || new FBO()
    }

    experience = Experience.getInstance()
    renderer = this.experience.renderer
    state = State.getInstance()
    floatType = this.state.floatType

    constructor() {

        if ( FBO._instance ) {
            return FBO._instance
        }

        FBO._instance = this

        this.experience = Experience.getInstance()
        this.sizes = Sizes.getInstance()
        this.renderer = this.experience.renderer
        this.debug = this.experience.debug
    }

    createRenderTarget( width, height, nearestFilter = false, floatType = false, samples = 0 ) {
        return new THREE.WebGLRenderTarget( width, height, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            magFilter: nearestFilter ? THREE.NearestFilter : THREE.LinearFilter,
            minFilter: nearestFilter ? THREE.NearestFilter : THREE.LinearFilter,
            type: floatType ? this.floatType : THREE.UnsignedByteType,
            anisotropy: 0,
            colorSpace: THREE.SRGBColorSpace,
            depthBuffer: true,
            stencilBuffer: false,
            samples: this.sizes.pixelRatio <= 2 ? samples : 0
        } )
    }


    setInstance() {

    }

    setDebug() {

    }
}
