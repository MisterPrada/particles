import * as THREE from 'three'
import Experience from '../Experience.js'
import Debug from '../Utils/Debug.js'
import State from "../State.js";

export default class Materials {
    static _instance = null

    static getInstance() {
        return Materials._instance || new Materials()
    }

    constructor() {
        if ( Materials._instance ) {
            return Materials._instance
        }
        Materials._instance = this

        this.experience = Experience.getInstance()
        this.debug = Debug.getInstance()
        this.state = State.getInstance()
        this.bloomLayer = this.state.bloomLayer

        this.materials = {}
        this.darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
    }

    _darkenNonBloomed = ( obj ) => {
        if ( obj.isMesh && this.bloomLayer.test( obj.layers ) === false ) {
            this.materials[ obj.uuid ] = obj.material;
            obj.material = this.darkMaterial;
        }
    }

    _restoreMaterial = ( obj ) => {

        if ( this.materials[ obj.uuid ] ) {

            obj.material = this.materials[ obj.uuid ];
            delete this.materials[ obj.uuid ];
        }
    }
}

