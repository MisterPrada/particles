import * as THREE from 'three'
import EventEmitter from './Utils/EventEmitter.js'

import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import Sound from "./Utils/Sound.js";
import Input from './Utils/Input.js'

import sources from './sources.js'
import gsap from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import State from './State.js'
//import PostProcess from './Utils/PostProcess.js'
import PostProcess from './Utils/PostProcessExternal.js'

export default class Experience extends EventEmitter {

    static _instance = null

    appLoaded = false;
    firstRender = false;

    static getInstance() {
        return Experience._instance || new Experience()
    }

    constructor( _canvas ) {
        super()
        // Singleton
        if ( Experience._instance ) {
            return Experience._instance
        }
        Experience._instance = this

        // Global access
        window.experience = this

        // Html Elements
        this.html = {}
        this.html.preloader = document.getElementById( "preloader" )
        this.html.playButton = document.getElementById( "play-button" )

        // Options
        this.canvas = _canvas
        THREE.ColorManagement.enabled = false

        if ( !this.canvas ) {
            console.warn( 'Missing \'Canvas\' property' )
            return
        }

        this.setDefaultCode();

        // Start Loading Resources
        this.resources = new Resources( sources )

        this.init()

    }

    init() {

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.input = new Input()
        this.scene = new THREE.Scene()
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.state = new State()
        this.sound = new Sound()
        this.world = new World()
        this.postProcess = new PostProcess( this.renderer.instance )

        this.setListeners()
        this.trigger("classesReady");
    }

    postInit() {

    }

    resize() {
        this.camera.resize()
        this.world.resize()
        this.renderer.resize()
        this.postProcess.resize()
        this.debug.resize()
        //this.sound.resize()
    }

    update() {
        this.camera.update( this.time.delta )
        this.world.update( this.time.delta )

        if ( this.state.postprocessing ) {
            this.postProcess.update( this.time.delta )
        } else {
            this.renderer.update( this.time.delta )
        }

        if ( this.debug.active ) {
            this.debug.update( this.time.delta )
        }

        this.postUpdate()
    }

    postUpdate() {
        if ( this.firstRender === true ) {
            window.dispatchEvent( new CustomEvent( "app:first-render" ) );
            this.firstRender = 'done';
        }

        if ( this.resources.loadedAll && this.appLoaded && this.firstRender === false ) {
            this.firstRender = true;
        }
    }

    setListeners() {
        // Resize event
        this.sizes.on( 'resize', () => {
            this.resize()
        } )

        // Time tick event
        this.time.on( 'tick', () => {
            this.update()
            this.debug?.stats?.update();
        } )
    }

    setDefaultCode() {
        document.ondblclick = function ( e ) {
            e.preventDefault()
        }

        gsap.registerPlugin( MotionPathPlugin );
    }

    destroy() {
        this.sizes.off( 'resize' )
        this.time.off( 'tick' )

        // Traverse the whole scene
        this.scene.traverse( ( child ) => {
            // Test if it's a mesh
            if ( child instanceof THREE.Mesh ) {
                child.geometry.dispose()

                // Loop through the material properties
                for ( const key in child.material ) {
                    const value = child.material[ key ]

                    // Test if there is a dispose function
                    if ( value && typeof value.dispose === 'function' ) {
                        value.dispose()
                    }
                }
            }
        } )

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        if ( this.debug.active )
            this.debug.ui.destroy()
    }
}
