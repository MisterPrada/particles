import * as THREE from 'three'
import Experience from '../Experience.js'
import Debug from '../Utils/Debug.js'
import State from "../State.js";
import Sizes from "./Sizes.js";
import Materials from "../Materials/Materials.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { MotionBlurPass } from '../Passes/motionBlurPass/src/MotionBlurPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import FBO from "./FBO.js";

import BloomVertex from '../Shaders/Bloom/vertex.glsl'
import BloomFragment from '../Shaders/Bloom/fragment.glsl'

import CompositeMaterialFragment from '../Shaders/Bloom/CompositeMaterial/fragment.glsl'

export default class PostProcess {
    experience = Experience.getInstance()
    debug = Debug.getInstance()
    sizes = Sizes.getInstance()
    state = State.getInstance()
    materials = Materials.getInstance()
    fbo = FBO.getInstance()

    rendererClass = this.experience.renderer
    scene = experience.scene
    time = experience.time
    camera = experience.camera.instance
    resources = experience.resources
    timeline = experience.time.timeline;
    container = new THREE.Group();

    constructor( renderer ) {
        this.renderer = renderer
        this.setComposer()
        this.setDebug()
    }

    setComposer() {
        /**
         * Passes
         */
        // Render pass
        this.renderPass = new RenderPass( this.scene, this.camera )

        this.bloomComposer = this._bloomComposer()
        this.mixPass = this._mixPass()
        this.outputPass = new OutputPass()
        //this.motionBlurPass = this._motionBlurPass()
        //this.bokehPass = this._bokehPass()
        this.afterimagePass = this._afterimagePass()

        this.renderTarget = this.fbo.createRenderTarget( this.sizes.width, this.sizes.height, false, false, 0 )
        this.composer = new EffectComposer( this.renderer, this.renderTarget )
        this.composer.setSize( this.sizes.width, this.sizes.height )
        this.composer.setPixelRatio( this.sizes.pixelRatio )

        this.composer.addPass( this.renderPass )
        this.composer.addPass( this.mixPass )
        this.composer.addPass( this.unrealBloomPass )
        //this.composer.addPass( this.motionBlurPass )
        //this.composer.addPass( this.bokehPass )
        //this.composer.addPass( this.afterimagePass );
        this.composer.addPass( this.outputPass )
    }

    _bloomComposer() {

        this.renderTargetBloom = this.fbo.createRenderTarget( this.sizes.width, this.sizes.height, false, false, 0 )

        this.unrealBloomPass = this._bloomPass()

        const bloomComposer = new EffectComposer( this.renderer, this.renderTargetBloom );
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass( this.renderPass );
        bloomComposer.addPass( this.unrealBloomPass )

        return bloomComposer
    }

    _bokehPass() {
        const bokehPass = new BokehPass( this.scene, this.camera, {
            focus: this.state.bokeh.focus,
            aperture: this.state.bokeh.aperture * 0.00001,
            maxblur: this.state.bokeh.maxblur,
        } );



        return bokehPass;
    }

    _bloomPass() {
        const unrealBloomPass = new UnrealBloomPass(
            new THREE.Vector2( this.sizes.width, this.sizes.height ),
            this.state.unrealBloom.strength,
            this.state.unrealBloom.radius,
            this.state.unrealBloom.threshold
        )

        unrealBloomPass.enabled = this.state.unrealBloom.enabled
        unrealBloomPass.renderToScreen = false

        unrealBloomPass.tintColor = {}
        unrealBloomPass.tintColor.value = '#000000'
        unrealBloomPass.tintColor.instance = new THREE.Color( unrealBloomPass.tintColor.value )

        unrealBloomPass.compositeMaterial.uniforms.uTintColor = { value: unrealBloomPass.tintColor.instance }
        unrealBloomPass.compositeMaterial.uniforms.uTintStrength = { value: 0.15 }
        //unrealBloomPass.compositeMaterial.fragmentShader = CompositeMaterialFragment

        return unrealBloomPass
    }

    _mixPass() {
        const mixPass = new ShaderPass(
            new THREE.ShaderMaterial( {
                uniforms: {
                    baseTexture: { value: null },
                    bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
                },
                vertexShader: BloomVertex,
                fragmentShader: BloomFragment,
                defines: {}
            } ), 'baseTexture'
        );
        mixPass.needsSwap = true;

        return mixPass
    }

    _motionBlurPass() {
        const motionBlurPass = new MotionBlurPass( this.scene, this.camera );

        motionBlurPass.enabled = this.state.motionBlur.enabled;
        motionBlurPass.samples = this.state.motionBlur.samples;
        motionBlurPass.expandGeometry = this.state.motionBlur.expandGeometry;
        motionBlurPass.interpolateGeometry = this.state.motionBlur.interpolateGeometry;
        motionBlurPass.renderCameraBlur = this.state.motionBlur.cameraBlur;
        motionBlurPass.smearIntensity = this.state.motionBlur.smearIntensity;
        motionBlurPass.jitter = this.state.motionBlur.jitter;
        motionBlurPass.jitterStrategy = this.state.motionBlur.jitterStrategy;

        return motionBlurPass;
    }

    _afterimagePass() {



        return new AfterimagePass()
    }

    resize() {
        this.composer.setSize( this.sizes.width, this.sizes.height )
        this.composer.setPixelRatio( this.sizes.pixelRatio )

        this.bloomComposer?.setSize( this.sizes.width, this.sizes.height )
        this.bloomComposer?.setPixelRatio( this.sizes.pixelRatio )
    }

    setDebug() {
        if ( !this.debug.active ) return

        if ( this.debug.panel ) {
            const PostProcessFolder = this.debug.panel.addFolder( 'PostProcess' )
            PostProcessFolder.close()
            const bloomFolder = PostProcessFolder.addFolder( 'UnrealBloomPass' )
            bloomFolder.close()

            bloomFolder.add( this.unrealBloomPass, 'enabled' ).name( 'Enabled' )
                .onChange( () => {
                    this.mixPass.enabled = this.unrealBloomPass.enabled
                } )
            bloomFolder.add( this.unrealBloomPass, 'strength' ).min( 0 ).max( 5 ).step( 0.001 ).name( 'Strength' )
            bloomFolder.add( this.unrealBloomPass, 'radius' ).min( -2 ).max( 1 ).step( 0.001 ).name( 'Radius' )
            bloomFolder.add( this.unrealBloomPass, 'threshold' ).min( 0 ).max( 1 ).step( 0.001 ).name( 'Threshold' )
            bloomFolder.addColor( this.unrealBloomPass.tintColor, 'value' ).name( 'Tint Color' ).onChange( () => {
                this.unrealBloomPass.tintColor.instance.set( this.unrealBloomPass.tintColor.value )
            } )
            bloomFolder.add( this.unrealBloomPass.compositeMaterial.uniforms.uTintStrength, 'value' ).name( 'Tint Strength' ).min( 0 ).max( 1 ).step( 0.001 )


            if ( this.afterimagePass ) {
                const afterImageFolder = PostProcessFolder.addFolder( 'After Image' );
                afterImageFolder.add( this.afterimagePass.uniforms[ 'damp' ], 'value', 0, 1 ).step( 0.001 );
            }

            // const bokehFolder = PostProcessFolder.addFolder( 'Bokeh' );

            // const matChanger = ( ) => {
            //
            //     this.bokehPass.uniforms[ 'focus' ].value = this.state.bokeh.focus;
            //     this.bokehPass.uniforms[ 'aperture' ].value = this.state.bokeh.aperture * 0.00001;
            //     this.bokehPass.uniforms[ 'maxblur' ].value = this.state.bokeh.maxblur;
            //
            // };
            //
            // bokehFolder.add( this.state.bokeh, 'enabled' ).name( 'Enabled' )
            //     .onChange( () => {
            //         this.bokehPass.enabled = this.state.bokeh.enabled
            //     } );
            //
            // bokehFolder.add( this.state.bokeh, 'focus', 0, 300 ).step( 0.001 )
            //     .onChange( matChanger );
            //
            // bokehFolder.add( this.state.bokeh, 'aperture', 0, 10 ).step( 0.1 )
            //     .onChange( matChanger );
            //
            // bokehFolder.add( this.state.bokeh, 'maxblur', 0, 0.09 ).step( 0.001 )
            //     .onChange( matChanger );


            // const motionFolder = PostProcessFolder.addFolder( 'Motion Blur' );
            // motionFolder.add( this.state.motionBlur, 'enabled' )
            //     .onChange( () => {
            //         this.motionBlurPass.enabled = this.state.motionBlur.enabled
            //     } );
            // motionFolder.add( this.state.motionBlur, 'cameraBlur' )
            //     .onChange( () => {
            //         this.motionBlurPass.renderCameraBlur = this.state.motionBlur.cameraBlur
            //     } );
            // motionFolder.add( this.state.motionBlur, 'samples', 0, 50 ).step( 1 )
            //     .onChange( () => {
            //         this.motionBlurPass.samples = this.state.motionBlur.samples
            //     } );
            // motionFolder.add( this.state.motionBlur, 'jitter', 0, 5 ).step( 0.01 )
            //     .onChange( () => {
            //         this.motionBlurPass.jitter = this.state.motionBlur.jitter
            //     } );
            // motionFolder.add( this.state.motionBlur, 'jitterStrategy', {
            //     REGULAR_JITTER: MotionBlurPass.REGULAR_JITTER,
            //     RANDOM_JITTER: MotionBlurPass.RANDOM_JITTER,
            //     BLUENOISE_JITTER: MotionBlurPass.BLUENOISE_JITTER,
            // } )
            //     .onChange( () => {
            //         this.motionBlurPass.jitterStrategy = this.state.motionBlur.jitterStrategy
            //     } );
            // motionFolder.add( this.state.motionBlur, 'smearIntensity', 0, 10 )
            //     .onChange( () => {
            //         this.motionBlurPass.smearIntensity = this.state.motionBlur.smearIntensity
            //     } );
            // motionFolder.add( this.state.motionBlur, 'expandGeometry', 0, 1 )
            //     .onChange( () => {
            //         this.motionBlurPass.expandGeometry = this.state.motionBlur.expandGeometry
            //     } );
            // motionFolder.add( this.state.motionBlur, 'interpolateGeometry', 0, 1 )
            //     .onChange( () => {
            //         this.motionBlurPass.interpolateGeometry = this.state.motionBlur.interpolateGeometry
            //     } );
            // motionFolder.add( this.state.motionBlur, 'renderTargetScale', 0, 1 )
            // 	.onChange( v => {
            //         MotionBlurPass.renderTargetScale = v;
            //         window.resizeTo();
            // 	} );
            //
            // motionFolder.add( this.motionBlurPass.debug, 'display', {
            // 	'Motion Blur': MotionBlurPass.DEFAULT,
            // 	'Velocity': MotionBlurPass.VELOCITY,
            // 	'Geometry': MotionBlurPass.GEOMETRY
            // } ).onChange( val => this.motionBlurPass.debug.display = parseFloat(val) );
            // motionFolder.close()
        }
    }

    bloomRender() {
        if ( this.unrealBloomPass.enabled ) {
            //this.scene.traverse( this.materials._darkenNonBloomed )
            this.bloomComposer.render()
            //this.scene.traverse( this.materials._restoreMaterial )
        }

    }

    productionRender() {
        if ( this.state.postprocessing ) {
            this.bloomRender()

            this.composer.render()
        } else {
            this.renderer.render( this.scene, this.camera )
        }
    }

    debugRender() {
        if ( this.state.postprocessing ) {
            this.bloomRender()

            this.renderer.autoClear = false
            this.composer.render()
            this.renderer.clearDepth()
        } else {
            this.renderer.autoClear = false
            this.renderer.clearColor( this.rendererClass.clearColor )
            this.renderer.render( this.scene, this.camera )
            this.renderer.clearDepth()
        }
    }

    update( deltaTime ) {
        if ( this.debug.active ) {
            this.debugRender()
        } else {
            this.productionRender()
        }

    }

}
