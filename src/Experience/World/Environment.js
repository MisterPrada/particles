import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.scene.colorSpace = THREE.SRGBColorSpace

        this.setAmbientLight()
        this.setDirectionalLight()

        this.setDebug()
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight( '#ffffff', 0.05 )
        this.scene.add( this.ambientLight )
    }

    setDirectionalLight() {
        this.directionalLight = new THREE.DirectionalLight( '#ffffff', 1 )
        this.directionalLight.position.set( 0, 5, 5 )
        this.scene.add( this.directionalLight )
    }


    setEnvironmentMap() {

    }

    setDebug() {
        if ( this.debug.active ) {

        }
    }
}
