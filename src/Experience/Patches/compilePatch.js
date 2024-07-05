export default function ( scene, camera, targetScene = null ) {

    if ( targetScene === null ) targetScene = scene;

    currentRenderState = renderStates.get( targetScene );
    currentRenderState.init();

    renderStateStack.push( currentRenderState );

    // gather lights from both the target scene and the new object that will be added to the scene.

    targetScene.traverseVisible( function ( object ) {

        if ( object.isLight && object.layers.test( camera.layers ) ) {

            currentRenderState.pushLight( object );

            if ( object.castShadow ) {

                currentRenderState.pushShadow( object );

            }

        }

    } );

    if ( scene !== targetScene ) {

        scene.traverseVisible( function ( object ) {

            if ( object.isLight && object.layers.test( camera.layers ) ) {

                currentRenderState.pushLight( object );

                if ( object.castShadow ) {

                    currentRenderState.pushShadow( object );

                }

            }

        } );

    }

    currentRenderState.setupLights( _this._useLegacyLights );

    // Only initialize materials in the new scene, not the targetScene.

    const materials = new Set();

    scene.traverse( function ( object ) {

        const material = object.material;

        if ( material ) {

            if ( Array.isArray( material ) ) {

                for ( let i = 0; i < material.length; i ++ ) {

                    const material2 = material[ i ];

                    prepareMaterial( material2, targetScene, object );
                    materials.add( material2 );

                }

            } else {

                prepareMaterial( material, targetScene, object );
                materials.add( material );

            }

        }

    } );

    renderStateStack.pop();
    //currentRenderState = null;

    return materials;

};
