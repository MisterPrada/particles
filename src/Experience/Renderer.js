import * as THREE from 'three'
import Experience from './Experience.js'
import compilePatch from "./Patches/compilePatch.js";

export default class Renderer {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.debug = this.experience.debug
        this.resources = this.experience.resources
        this.html = this.experience.html

        this.setInstance()
        this.setDebug()
    }

    setInstance() {
        this.clearColor = '#010101'

        //console.log(THREE.WebGLRenderer.compile)

        //THREE.WebGLRenderer.prototype.compile = compilePatch.bind( THREE.WebGLRenderer.prototype.compile )

        this.instance = new THREE.WebGLRenderer( {
            canvas: this.canvas,
            powerPreference: "high-performance",
            antialias: false,
            alpha: false,
            stencil: false,
            depth: true,
            useLegacyLights: false,
            physicallyCorrectLights: true,
        } )


        //console.log( this.instance )
        //this.instance.compile = compilePatch.bind( this.instance.compile )

        this.instance.outputColorSpace = THREE.SRGBColorSpace
        this.instance.setSize( this.sizes.width, this.sizes.height )
        this.instance.setPixelRatio( Math.min( this.sizes.pixelRatio, 2 ) )

        this.instance.setClearColor( this.clearColor, 1 )
        this.instance.setSize( this.sizes.width, this.sizes.height )
    }

    setDebug() {
        if ( this.debug.active ) {
            if ( this.debug.panel ) {
                this.debugFolder = this.debug.panel.addFolder("Renderer");

                this.debugFolder.add( this.instance, "toneMapping", {
                    "No": THREE.NoToneMapping,
                    "Linear": THREE.LinearToneMapping,
                    "Reinhard": THREE.ReinhardToneMapping,
                    "Cineon": THREE.CineonToneMapping,
                    "ACESFilmic": THREE.ACESFilmicToneMapping,
                    "AgXToneMapping": THREE.AgXToneMapping,
                    "NeutralToneMapping": THREE.NeutralToneMapping
                } ).name( "Tone Mapping" );

                this.debugFolder.add( this.instance, "toneMappingExposure" )
                    .min( 0 ).max( 2 ).step( 0.01 ).name( "Tone Mapping Exposure" );

            }

        }
    }

    update() {
        if ( this.debug.active ) {
            this.debugRender()
        } else {
            this.productionRender()
        }
    }

    productionRender() {
        this.instance.render( this.scene, this.camera.instance )
    }

    debugRender() {
        this.instance.autoClear = false
        this.instance.clearColor( this.clearColor )
        this.instance.render( this.scene, this.camera.instance )
        this.instance.clearDepth()
    }

    resize() {
        // Instance
        this.instance.setSize( this.sizes.width, this.sizes.height )
        this.instance.setPixelRatio( this.sizes.pixelRatio )
    }

    destroy() {

    }
}
