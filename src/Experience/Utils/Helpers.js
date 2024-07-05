import * as THREE from 'three'

// get position from min Y three attribute position array
export function getMinPositionY( positions ) {
    let minPosition = new THREE.Vector3(positions[0], positions[1], positions[2]);

    let minY = Number.MAX_VALUE;

    for (let i = 0; i < positions.length / 3; i++) {

        if (positions[3 * i + 1] < minY) {
            minY = positions[3 * i + 1];

            minPosition.set(
                positions[3 * i + 0],
                positions[3 * i + 1],
                positions[3 * i + 2]
            );
        }
    }

    return minPosition;
}

// get centroid from three attribute position array
export function getCentroid( positions ) {
    let centroid = new THREE.Vector3();

    for (let i = 0; i < positions.length / 3; i++) {
        centroid.x += positions[3 * i + 0];
        centroid.y += positions[3 * i + 1];
        centroid.z += positions[3 * i + 2];
    }

    centroid.x /= positions.length / 3;
    centroid.y /= positions.length / 3;
    centroid.z /= positions.length / 3;

    // // get nearest point to the centroid
    // let nearestPoint = new THREE.Vector3(positions[0], positions[1], positions[2]);
    // let nearestDistance = centroid.distanceTo(nearestPoint);
    //
    // for (let i = 0; i < positions.length / 3; i++) {
    //     let point = new THREE.Vector3(
    //         positions[3 * i + 0],
    //         positions[3 * i + 1],
    //         positions[3 * i + 2]
    //     );
    //
    //     let distance = centroid.distanceTo(point);
    //
    //     if (distance < nearestDistance) {
    //         nearestDistance = distance;
    //         nearestPoint = point;
    //     }
    // }
    //
    // return nearestPoint;

    return centroid;
}

export function cloneAllMaterials( container ) {
    container.traverse( child => {
        if ( child.isMesh ) {

            const cloneMaterial = child.material.clone();
            child.material.dispose();
            child.material = cloneMaterial;
        }
    } )
}

export function meshToBatchedMesh( mesh, container, batchedMeshesIds = {} ) {
    let materials = [];

    let maxGeometryCount = 0;
    let maxVertexCount = 0;
    let maxIndexCount = 0;

    mesh.traverse( ( child ) => {
        if ( child.isMesh ) {
            maxGeometryCount++;
            maxVertexCount += child.geometry.attributes.position.count;
            maxIndexCount += child.geometry.index.count;
        }
    } )

    mesh.traverse( ( child ) => {
        if ( child.isMesh ) {
            child.updateMatrixWorld()
            // child.geometry.applyMatrix4( child.matrixWorld )

            if ( materials[ child.material.uuid ] === undefined ) {
                const batchedMesh = new THREE.BatchedMesh( maxGeometryCount, maxVertexCount, maxIndexCount, child.material );
                container.add( batchedMesh );
                batchedMeshesIds[ batchedMesh.uuid ] = [];

                materials[ child.material.uuid ] = {};
                materials[ child.material.uuid ].batchedMesh = batchedMesh;

                const geometry = child.geometry.clone();
                geometry.applyMatrix4( child.matrixWorld );

                const batchId = batchedMesh.addGeometry( geometry );
                batchedMeshesIds[ batchedMesh.uuid ][ batchId ] = child;
                batchedMeshesIds[ batchedMesh.uuid ][ 'batchedMesh' ] = batchedMesh;

            } else {
                const geometry = child.geometry.clone();
                geometry.applyMatrix4( child.matrixWorld );
                const batchId = materials[ child.material.uuid ].batchedMesh.addGeometry( geometry );
                batchedMeshesIds[ materials[ child.material.uuid ].batchedMesh.uuid ][ batchId ] = child;
            }
        }
    } )
}

export function makeTexture( g ) {

    let vertAmount = g.attributes.position.count;
    let texWidth = Math.ceil( Math.sqrt( vertAmount ) );
    let texHeight = Math.ceil( vertAmount / texWidth );

    let data = new Float32Array( texWidth * texHeight * 4 );

    function shuffleArrayByThree( array ) {
        const groupLength = 3;

        let numGroups = Math.floor( array.length / groupLength );

        for ( let i = numGroups - 1; i > 0; i-- ) {
            const j = Math.floor( Math.random() * ( i + 1 ) );

            for ( let k = 0; k < groupLength; k++ ) {
                let temp = array[ i * groupLength + k ];
                array[ i * groupLength + k ] = array[ j * groupLength + k ];
                array[ j * groupLength + k ] = temp;
            }
        }

        return array;
    }


    shuffleArrayByThree( g.attributes.position.array );

    for ( let i = 0; i < vertAmount; i++ ) {
        //let f = Math.floor(Math.random() * (randomTemp.length / 3) );

        const x = g.attributes.position.array[ i * 3 + 0 ] ?? 2;
        const y = g.attributes.position.array[ i * 3 + 1 ] ?? 0;
        const z = g.attributes.position.array[ i * 3 + 2 ] ?? 0;
        const w = 0;

        //randomTemp.splice(f * 3, 3);

        data[ i * 4 + 0 ] = x;
        data[ i * 4 + 1 ] = y;
        data[ i * 4 + 2 ] = z;
        data[ i * 4 + 3 ] = w;
    }

    let dataTexture = new THREE.DataTexture( data, texWidth, texHeight, THREE.RGBAFormat, THREE.FloatType );
    dataTexture.needsUpdate = true;

    return dataTexture;
}
