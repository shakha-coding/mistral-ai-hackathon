import * as THREE from 'three';

/**
 * Bright daytime office lighting.
 * Simulates large windows with warm sunlight flooding in.
 */
export function setupLighting(scene) {
    // Strong ambient fill — bright office
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    // Bright directional sunlight through windows
    const sunLight = new THREE.DirectionalLight(0xfff8e7, 2.0);
    sunLight.position.set(8, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.002;
    scene.add(sunLight);

    // Hemisphere — blue sky top, warm floor bounce
    const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0xf5e6d3, 0.8);
    scene.add(hemiLight);

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.6);
    fillLight.position.set(-6, 10, -5);
    scene.add(fillLight);

    // Ceiling fluorescent panels
    const ceilingPositions = [
        { x: -4, z: -3 },
        { x: 4, z: -3 },
        { x: -4, z: 3 },
        { x: 4, z: 3 },
        { x: 0, z: 0 },
    ];

    ceilingPositions.forEach(pos => {
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 10);
        pointLight.position.set(pos.x, 4.5, pos.z);
        scene.add(pointLight);

        // Visible light panel
        const fixtureGeo = new THREE.BoxGeometry(0.8, 0.03, 0.4);
        const fixtureMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 1.0,
        });
        const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
        fixture.position.set(pos.x, 4.95, pos.z);
        scene.add(fixture);
    });

    return { sunLight, ambient };
}
