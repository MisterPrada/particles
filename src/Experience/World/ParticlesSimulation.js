import * as THREE from "three";
import Experience from "../Experience.js";
import Debug from "../Utils/Debug.js";
import State from "../State.js";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import gpgpuParticlesShader from "../Shaders/Gpgpu/particles.glsl";
import gpgpuParticlesVelocityShader from "../Shaders/Gpgpu/particlesVelocity.glsl";
import { createNoise4D } from 'simplex-noise';

export default class ParticlesSimulation {
    experience = Experience.getInstance();
    debug = Debug.getInstance();
    state = State.getInstance();
    scene = experience.scene;
    time = experience.time;
    camera = experience.camera.instance;
    renderer = experience.renderer.instance;
    resources = experience.resources;
    container = new THREE.Group();

    points = experience.world.particles.points;

    prevPositionsTexture = null;
    currPositionsTexture = null;

    constructor() {
        this.setModel();
        this.setDebug();

        // disable block with class app-header
        // document.querySelector('.app-header').style.display = 'none';
    }

    setModel() {
        /**
         * Base geometry
         */

        const baseGeometry = {};
        baseGeometry.instance = this.points.geometry;
        baseGeometry.count = baseGeometry.instance.instanceCount;

        /**
         * GPU Compute
         */

        // Setup
        const gpgpu = {};
        this.gpgpu = gpgpu;
        gpgpu.size = Math.ceil( Math.sqrt( baseGeometry.count ) );
        gpgpu.computation = new GPUComputationRenderer( gpgpu.size, gpgpu.size, this.renderer );

        // Base particles
        const baseParticlesTexture = gpgpu.computation.createTexture();
        const baseParticlesVelocityTexture = gpgpu.computation.createTexture();
        const noise4D = createNoise4D();

        for(let i = 0; i < baseGeometry.count; i++)
        {
            const i3 = i * 3
            const i4 = i * 4


            // Position sphere
            const radius = 1.2
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)

            const x = radius * Math.sin(phi) * Math.cos(theta)
            const y = radius * Math.sin(phi) * Math.sin(theta)
            const z = radius * Math.cos(phi)

            // Position based on geometry
            baseParticlesTexture.image.data[i4 + 0] = x + noise4D( x, y, z, this.time.elapsed) * 1
            baseParticlesTexture.image.data[i4 + 1] = y + noise4D( x, y, z, this.time.elapsed) * 1
            baseParticlesTexture.image.data[i4 + 2] = z + noise4D( x, y, z, this.time.elapsed) * 1
            baseParticlesTexture.image.data[i4 + 3] = Math.random()
        }

        // Particles variable
        gpgpu.particlesVariable = gpgpu.computation.addVariable('uParticles', gpgpuParticlesShader, baseParticlesTexture)
        gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [ gpgpu.particlesVariable ])

        // Particles variable Uniforms
        gpgpu.particlesVariable.material.uniforms.uTime = new THREE.Uniform(0)
        gpgpu.particlesVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0)
        gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(baseParticlesTexture)
        gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence = new THREE.Uniform(0.5)
        gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength = new THREE.Uniform(0.222)
        gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency = new THREE.Uniform(0.5)

        // Velocity variable
        gpgpu.particlesVelocityVariable = gpgpu.computation.addVariable('uParticlesVelocity', gpgpuParticlesVelocityShader, baseParticlesVelocityTexture)
        gpgpu.computation.setVariableDependencies(gpgpu.particlesVelocityVariable, [ gpgpu.particlesVelocityVariable ])

        // Velocity Particles variable Uniforms
        gpgpu.particlesVelocityVariable.material.uniforms.uTime = new THREE.Uniform(0)
        gpgpu.particlesVelocityVariable.material.uniforms.uDeltaTime = new THREE.Uniform(0)
        gpgpu.particlesVelocityVariable.material.uniforms.uPrevPositions = new THREE.Uniform()
        gpgpu.particlesVelocityVariable.material.uniforms.uCurrPositions = new THREE.Uniform()

        // Init
        gpgpu.computation.init()

        // Set Geometry UVs
        const particlesUvArray = new Float32Array(baseGeometry.count * 2)

        for(let i = 0; i < baseGeometry.count; i++)
        {
            const i2 = i * 2

            // Particles UV
            const y = Math.floor(i / gpgpu.size)
            const x = i - y * gpgpu.size

            particlesUvArray[i2 + 0] = (x + 0.5) / gpgpu.size
            particlesUvArray[i2 + 1] = (y + 0.5) / gpgpu.size
        }

        this.points.geometry.setAttribute('aParticlesUv', new THREE.InstancedBufferAttribute(particlesUvArray, 2))
        this.points.geometry.needsUpdate = true

    }

    resize() {

    }

    setDebug() {
        if ( !this.debug.active ) return;

        this.debugFolder = this.debug.panel.addFolder( "Flow Field" );

        this.debugFolder.add(this.gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence, 'value')
            .min(0).max(1).step(0.001).name('uFlowfieldInfluence')
        this.debugFolder.add(this.gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength, 'value')
            .min(0).max(10).step(0.001).name('uFlowfieldStrength')
        this.debugFolder.add(this.gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency, 'value')
            .min(0).max(1).step(0.001).name('uFlowfieldFrequency')


        //this.debug.createDebugTexture( this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.particlesVariable).texture )
        //this.debug.createDebugTexture( this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.particlesVelocityVariable).texture )

        //this.debug.createDebugTexture( this.resources.items.displacementTexture )
    }

    update( deltaTime ) {
        // GPGPU Update
        this.gpgpu.particlesVariable.material.uniforms.uTime.value = this.time.elapsed
        this.gpgpu.particlesVariable.material.uniforms.uDeltaTime.value = deltaTime

        this.points.material.uniforms.uParticlesTexture.value = this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.particlesVariable).texture

        this.prevPositionsTexture = this.currPositionsTexture
        this.currPositionsTexture = this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.particlesVariable).texture

        this.gpgpu.particlesVelocityVariable.material.uniforms.uTime.value = this.time.elapsed
        this.gpgpu.particlesVelocityVariable.material.uniforms.uDeltaTime.value = deltaTime
        this.gpgpu.particlesVelocityVariable.material.uniforms.uPrevPositions.value = this.prevPositionsTexture
        this.gpgpu.particlesVelocityVariable.material.uniforms.uCurrPositions.value = this.currPositionsTexture

        this.points.material.uniforms.uParticlesVelocityTexture.value = this.gpgpu.computation.getCurrentRenderTarget(this.gpgpu.particlesVelocityVariable).texture

        this.gpgpu.computation.compute()

        //particles.material.uniforms.uParticlesTexture.value = gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable).texture
    }

}
