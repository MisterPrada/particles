import EventEmitter from './EventEmitter.js'

export default class Sizes extends EventEmitter {

    static _instance = null

    static getInstance() {
        return Sizes._instance || new Sizes()
    }

    constructor() {
        // Singleton
        if ( Sizes._instance ) {
            return Sizes._instance
        }

        super()

        Sizes._instance = this

        // Setup
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min( window.devicePixelRatio, 2 )

        // Resize event
        window.addEventListener( 'resize', () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.pixelRatio = Math.min( window.devicePixelRatio, 2 )

            this.trigger( 'resize' )
        } )
    }

}
