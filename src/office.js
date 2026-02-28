import * as THREE from 'three';

/**
 * ============================================
 * CORPORATE OFFICE — ENHANCED REALISM
 * 
 * Layout:
 * - Player desk (big executive) at front/south
 * - Two assistant desks facing player at north
 * - No center table, no task board stands
 * - Better materials & more detail
 * ============================================
 */

// ── Texture Generator ──
function makeNoiseTexture(baseColor, variation, size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const [br, bg, bb] = [(baseColor >> 16) & 0xff, (baseColor >> 8) & 0xff, baseColor & 0xff];
    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const v = (Math.random() - 0.5) * variation;
        imageData.data[i] = Math.max(0, Math.min(255, br + v));
        imageData.data[i + 1] = Math.max(0, Math.min(255, bg + v));
        imageData.data[i + 2] = Math.max(0, Math.min(255, bb + v));
        imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function makeWoodTexture(baseColor, size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const [br, bg, bb] = [(baseColor >> 16) & 0xff, (baseColor >> 8) & 0xff, baseColor & 0xff];

    // Base fill
    ctx.fillStyle = `rgb(${br},${bg},${bb})`;
    ctx.fillRect(0, 0, size, size);

    // Wood grain lines
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 80; i++) {
        const y = Math.random() * size;
        const h = 1 + Math.random() * 2;
        ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
        ctx.fillRect(0, y, size, h);
    }
    ctx.globalAlpha = 1.0;

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

// ── Materials with Textures ──
const woodFloorTex = makeWoodTexture(0x8B6914);
woodFloorTex.repeat.set(8, 6);

const carpetTex = makeNoiseTexture(0x4a5568, 15);
carpetTex.repeat.set(4, 4);

const wallTex = makeNoiseTexture(0xf0ebe5, 6);
wallTex.repeat.set(3, 1);

const deskTex = makeWoodTexture(0xc8a882);
const darkDeskTex = makeWoodTexture(0x3d2b1f);

const mat = {
    floor: new THREE.MeshStandardMaterial({ map: woodFloorTex, roughness: 0.65, metalness: 0.05 }),
    wall: new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9, metalness: 0.0 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.95, side: THREE.DoubleSide }),
    baseboard: new THREE.MeshStandardMaterial({ color: 0xd4c5b5, roughness: 0.5, metalness: 0.1 }),

    glass: new THREE.MeshPhysicalMaterial({
        color: 0xccddff, transparent: true, opacity: 0.1,
        roughness: 0.02, metalness: 0.0, side: THREE.DoubleSide,
    }),
    glassFrame: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.2, metalness: 0.8 }),

    deskWood: new THREE.MeshStandardMaterial({ map: deskTex, roughness: 0.55, metalness: 0.02 }),
    deskDark: new THREE.MeshStandardMaterial({ map: darkDeskTex, roughness: 0.5, metalness: 0.05 }),
    deskTop: new THREE.MeshStandardMaterial({ color: 0xf0e6d2, roughness: 0.4, metalness: 0.02 }),
    deskLeg: new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.25, metalness: 0.85 }),

    monitor: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.6 }),
    screenOff: new THREE.MeshStandardMaterial({ color: 0x0a0a15, emissive: 0x111133, emissiveIntensity: 0.3 }),
    screenAlpha: new THREE.MeshStandardMaterial({ color: 0x0a1525, emissive: 0x4facfe, emissiveIntensity: 0.6 }),
    screenBeta: new THREE.MeshStandardMaterial({ color: 0x200a15, emissive: 0xf5576c, emissiveIntensity: 0.6 }),

    chairLeather: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.75, metalness: 0.05 }),
    chairMetal: new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.25, metalness: 0.85 }),

    skinLight: new THREE.MeshStandardMaterial({ color: 0xfdd9b5, roughness: 0.85, metalness: 0.0 }),
    skinAsian: new THREE.MeshStandardMaterial({ color: 0xf5d6b8, roughness: 0.85, metalness: 0.0 }),
    hairBlonde: new THREE.MeshStandardMaterial({ color: 0xf0c040, roughness: 0.65, metalness: 0.08 }),
    hairBlack: new THREE.MeshStandardMaterial({ color: 0x10101e, roughness: 0.6, metalness: 0.1 }),
    dressBlue: new THREE.MeshStandardMaterial({ color: 0x3b7dd8, roughness: 0.65, metalness: 0.0 }),
    dressRed: new THREE.MeshStandardMaterial({ color: 0xcc3344, roughness: 0.65, metalness: 0.0 }),
    lips: new THREE.MeshStandardMaterial({ color: 0xd88888, roughness: 0.5 }),
    eyeWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
    eyeBlue: new THREE.MeshStandardMaterial({ color: 0x3498db }),
    eyeBrown: new THREE.MeshStandardMaterial({ color: 0x4a2800 }),
    pupil: new THREE.MeshStandardMaterial({ color: 0x000000 }),

    plant: new THREE.MeshStandardMaterial({ color: 0x3da35d, roughness: 0.9 }),
    plantDark: new THREE.MeshStandardMaterial({ color: 0x2d8a4e, roughness: 0.9 }),
    pot: new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 }),
    potWhite: new THREE.MeshStandardMaterial({ color: 0xf0ece6, roughness: 0.6 }),

    bookshelf: new THREE.MeshStandardMaterial({ color: 0x5a3010, roughness: 0.7 }),
    book: [
        new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0x27ae60, roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0x8e44ad, roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.8 }),
    ],

    whiteboard: new THREE.MeshStandardMaterial({ color: 0xfcfcfc, roughness: 0.25 }),
    whiteboardFrame: new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.3, metalness: 0.6 }),

    rug: new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.95 }),

    windowFrame: new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.3, metalness: 0.5 }),
    skyGlow: new THREE.MeshStandardMaterial({ color: 0xaad4f5, emissive: 0x87ceeb, emissiveIntensity: 1.0 }),

    coffeeMug: new THREE.MeshStandardMaterial({ color: 0xf8f8f0, roughness: 0.35 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.9 }),
    pen: new THREE.MeshStandardMaterial({ color: 0x1a1a40, roughness: 0.3, metalness: 0.5 }),
};

// ── Geometry Cache ──
const _geoCache = {};
function box(w, h, d) {
    const k = `b${w}_${h}_${d}`;
    return _geoCache[k] || (_geoCache[k] = new THREE.BoxGeometry(w, h, d));
}
function cyl(rt, rb, h, s = 16) {
    const k = `c${rt}_${rb}_${h}_${s}`;
    return _geoCache[k] || (_geoCache[k] = new THREE.CylinderGeometry(rt, rb, h, s));
}
function sphere(r, ws = 14, hs = 10) {
    const k = `s${r}_${ws}_${hs}`;
    return _geoCache[k] || (_geoCache[k] = new THREE.SphereGeometry(r, ws, hs));
}

// ── Agent Positions (facing toward player at z=6) ──
export const AGENT_POSITIONS = {
    alpha: new THREE.Vector3(-3.5, 0, -4),
    beta: new THREE.Vector3(3.5, 0, -4),
};

export const taskBoardMeshes = { alpha: null, beta: null };

// ── Build all ──
export function buildOffice(scene) {
    buildStructure(scene);
    buildWindows(scene);
    buildGlassPartition(scene);

    // Assistant desks FACING player (rotated 180°)
    buildAssistantDesk(scene, 'alpha', AGENT_POSITIONS.alpha);
    buildAssistantDesk(scene, 'beta', AGENT_POSITIONS.beta);
    buildCharacter(scene, 'alpha', AGENT_POSITIONS.alpha);
    buildCharacter(scene, 'beta', AGENT_POSITIONS.beta);

    // Player's executive desk
    buildPlayerDesk(scene);

    // Decor
    buildBookshelf(scene);
    buildWhiteboard(scene);
    buildPlants(scene);
    buildRug(scene);
    buildWallDecor(scene);

    return { AGENT_POSITIONS, taskBoardMeshes };
}

// ── STRUCTURE ──
function buildStructure(scene) {
    const wh = 5, wt = 0.2;

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), mat.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    addMesh(scene, box(20, wh, wt), mat.wall, 0, wh / 2, -8, true);                // back
    addMesh(scene, box(7, wh, wt), mat.wall, -6.5, wh / 2, 8, true);               // front left
    addMesh(scene, box(7, wh, wt), mat.wall, 6.5, wh / 2, 8, true);                // front right
    addMesh(scene, box(6, 1.5, wt), mat.wall, 0, wh - 0.75, 8);                     // above door
    addMesh(scene, box(wt, wh, 16), mat.wall, -10, wh / 2, 0, true);               // left
    addMesh(scene, box(wt, wh, 16), mat.wall, 10, wh / 2, 0, true);                // right

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), mat.ceiling);
    ceil.rotation.x = Math.PI / 2; ceil.position.y = wh;
    scene.add(ceil);

    // Baseboards
    addMesh(scene, box(20, 0.12, 0.05), mat.baseboard, 0, 0.06, -7.88);
    addMesh(scene, box(0.05, 0.12, 16), mat.baseboard, -9.88, 0.06, 0);
    addMesh(scene, box(0.05, 0.12, 16), mat.baseboard, 9.88, 0.06, 0);
}

// ── WINDOWS ──
function buildWindows(scene) {
    for (let i = 0; i < 3; i++) {
        const x = -6 + i * 6;
        // Sky glow panel
        addMesh(scene, new THREE.PlaneGeometry(2.4, 1.8), mat.skyGlow, x, 3, -7.86);
        // Glass
        addMesh(scene, new THREE.PlaneGeometry(2.4, 1.8), mat.glass, x, 3, -7.83);
        // Frame
        const f = mat.windowFrame;
        addMesh(scene, box(2.5, 0.05, 0.05), f, x, 3.92, -7.8);
        addMesh(scene, box(2.5, 0.05, 0.05), f, x, 2.08, -7.8);
        addMesh(scene, box(0.05, 1.9, 0.05), f, x - 1.22, 3, -7.8);
        addMesh(scene, box(0.05, 1.9, 0.05), f, x + 1.22, 3, -7.8);
        addMesh(scene, box(0.05, 1.9, 0.05), f, x, 3, -7.8);  // center mullion
    }
}

// ── GLASS PARTITION ──
function buildGlassPartition(scene) {
    addMesh(scene, box(0.04, 3, 10), mat.glass, 0, 1.5, -1);
    [-5, -2.5, 0, 2.5, 5].forEach(z => {
        addMesh(scene, box(0.05, 3, 0.03), mat.glassFrame, 0, 1.5, -1 + z);
    });
    addMesh(scene, box(0.05, 0.03, 10), mat.glassFrame, 0, 3, -1);
    addMesh(scene, box(0.05, 0.03, 10), mat.glassFrame, 0, 0.02, -1);
}

// ── ASSISTANT DESK (facing player / south) ──
function buildAssistantDesk(scene, agentId, pos) {
    const g = new THREE.Group();
    const isAlpha = agentId === 'alpha';

    // Desk top
    const top = new THREE.Mesh(box(2.4, 0.06, 1.1), mat.deskTop);
    top.position.set(0, 0.76, 0);
    top.castShadow = true; top.receiveShadow = true;
    g.add(top);

    // Desk front panel (facing player, so at positive z)
    g.add(meshAt(box(2.4, 0.5, 0.04), mat.deskWood, 0, 0.5, 0.53));

    // Side panels
    g.add(meshAt(box(0.04, 0.5, 1.06), mat.deskWood, -1.18, 0.5, 0));
    g.add(meshAt(box(0.04, 0.5, 1.06), mat.deskWood, 1.18, 0.5, 0));

    // Metal legs
    [[-1.1, -0.5], [-1.1, 0.5], [1.1, -0.5], [1.1, 0.5]].forEach(([lx, lz]) => {
        g.add(meshAt(box(0.04, 0.76, 0.04), mat.deskLeg, lx, 0.38, lz));
    });

    // Monitor - facing player (toward +z)
    g.add(meshAt(box(0.85, 0.5, 0.02), mat.monitor, 0, 1.3, -0.15));  // body
    const screenMat = isAlpha ? mat.screenAlpha : mat.screenBeta;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.44), screenMat);
    screen.position.set(0, 1.3, -0.135);
    screen.rotation.y = Math.PI;  // Face south toward player
    g.add(screen);
    g.add(meshAt(box(0.05, 0.25, 0.05), mat.monitor, 0, 0.93, -0.15));
    g.add(meshAt(box(0.22, 0.015, 0.14), mat.monitor, 0, 0.795, -0.15));

    // Keyboard (on their side)
    g.add(meshAt(box(0.42, 0.012, 0.14), mat.monitor, -0.05, 0.8, 0.2));
    // Mouse
    g.add(meshAt(box(0.06, 0.01, 0.09), mat.monitor, 0.35, 0.8, 0.2));

    // Coffee mug
    const mug = new THREE.Mesh(cyl(0.03, 0.025, 0.07, 10), mat.coffeeMug);
    mug.position.set(isAlpha ? 0.85 : -0.85, 0.82, 0.15);
    g.add(mug);

    // Papers
    g.add(meshAt(box(0.25, 0.004, 0.35), mat.paper, isAlpha ? -0.7 : 0.7, 0.79, 0));
    g.add(meshAt(box(0.25, 0.004, 0.35), mat.paper, isAlpha ? -0.68 : 0.68, 0.794, 0.02));

    // Pen
    g.add(meshAt(box(0.01, 0.008, 0.14), mat.pen, isAlpha ? -0.5 : 0.5, 0.79, 0.15));

    // Chair (behind desk, facing south / toward player)
    buildChair(g, 0, 0, -0.9, Math.PI);  // rotated 180° to face south

    // Nameplate
    buildNameplate(g, isAlpha);

    g.position.copy(pos);
    scene.add(g);
}

function buildChair(group, cx, cy, cz, rotY = 0) {
    const cg = new THREE.Group();

    // Seat
    cg.add(meshAt(box(0.48, 0.06, 0.48), mat.chairLeather, 0, 0.45, 0));
    // Back
    cg.add(meshAt(box(0.48, 0.55, 0.04), mat.chairLeather, 0, 0.78, -0.24));
    // Headrest
    cg.add(meshAt(box(0.3, 0.12, 0.04), mat.chairLeather, 0, 1.08, -0.24));
    // Armrests
    [-1, 1].forEach(s => {
        cg.add(meshAt(box(0.04, 0.04, 0.35), mat.chairMetal, s * 0.24, 0.58, -0.04));
        cg.add(meshAt(box(0.04, 0.13, 0.04), mat.chairMetal, s * 0.24, 0.5, 0.15));
    });
    // Central pole
    cg.add(meshAt(cyl(0.025, 0.025, 0.42), mat.chairMetal, 0, 0.22, 0));
    // Star base
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const leg = new THREE.Mesh(box(0.025, 0.018, 0.24), mat.chairMetal);
        leg.position.set(Math.sin(a) * 0.12, 0.018, Math.cos(a) * 0.12);
        leg.rotation.y = a;
        cg.add(leg);
        const wheel = new THREE.Mesh(sphere(0.018), mat.monitor);
        wheel.position.set(Math.sin(a) * 0.24, 0.018, Math.cos(a) * 0.24);
        cg.add(wheel);
    }

    cg.position.set(cx, cy, cz);
    cg.rotation.y = rotY;
    group.add(cg);
}

function buildNameplate(group, isAlpha) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = isAlpha ? '#2c5282' : '#822c3d';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Inter, Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(isAlpha ? 'SOPHIA — ALPHA' : 'YUKI — BETA', 128, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const plate = new THREE.Mesh(
        new THREE.PlaneGeometry(0.55, 0.14),
        new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveIntensity: 0.03, emissiveMap: tex })
    );
    plate.position.set(0, 0.84, 0.56);
    group.add(plate);
}

// ── CHARACTER ── (sitting behind desk, facing south toward player)
function buildCharacter(scene, agentId, deskPos) {
    const g = new THREE.Group();
    const isAlpha = agentId === 'alpha';
    const skin = isAlpha ? mat.skinLight : mat.skinAsian;
    const hair = isAlpha ? mat.hairBlonde : mat.hairBlack;
    const dress = isAlpha ? mat.dressBlue : mat.dressRed;

    // Character sits at chair position (behind desk, facing south)
    const cx = 0, cz = -0.9;

    // ── Torso ──
    g.add(meshAt(cyl(0.15, 0.13, 0.36, 14), dress, cx, 0.69, cz));

    // Bust (subtle shape)
    [-1, 1].forEach(s => {
        const bust = new THREE.Mesh(sphere(0.06, 10, 8), dress);
        bust.position.set(cx + s * 0.065, 0.74, cz + 0.1);
        bust.scale.set(1, 0.9, 0.85);
        g.add(bust);
    });

    // Waist
    g.add(meshAt(cyl(0.14, 0.16, 0.12, 12), dress, cx, 0.49, cz));

    // ── Neck ──
    g.add(meshAt(cyl(0.04, 0.04, 0.1, 10), skin, cx, 0.9, cz));

    // ── Head ──
    const head = new THREE.Mesh(sphere(0.125, 18, 14), skin);
    head.position.set(cx, 1.06, cz);
    head.scale.set(1, 1.05, 0.95);
    g.add(head);

    // ── Eyes ──
    [-1, 1].forEach(s => {
        // Eye white
        const eyeW = new THREE.Mesh(sphere(0.022, 10, 8), mat.eyeWhite);
        eyeW.position.set(cx + s * 0.042, 1.075, cz + 0.11);
        g.add(eyeW);
        // Iris
        const iris = new THREE.Mesh(sphere(0.013, 8, 6), isAlpha ? mat.eyeBlue : mat.eyeBrown);
        iris.position.set(cx + s * 0.042, 1.075, cz + 0.128);
        g.add(iris);
        // Pupil
        const pup = new THREE.Mesh(sphere(0.006, 6, 4), mat.pupil);
        pup.position.set(cx + s * 0.042, 1.075, cz + 0.137);
        g.add(pup);
        // Eyelash line
        const lash = new THREE.Mesh(box(0.05, 0.003, 0.006), mat.hairBlack);
        lash.position.set(cx + s * 0.042, 1.095, cz + 0.12);
        g.add(lash);
    });

    // Eyebrows
    [-1, 1].forEach(s => {
        const brow = new THREE.Mesh(box(0.045, 0.006, 0.008), hair);
        brow.position.set(cx + s * 0.042, 1.11, cz + 0.115);
        brow.rotation.z = s * -0.1;
        g.add(brow);
    });

    // Nose
    const nose = new THREE.Mesh(cyl(0.01, 0.006, 0.025, 6), skin);
    nose.position.set(cx, 1.05, cz + 0.13);
    nose.rotation.x = 0.3;
    g.add(nose);

    // Lips
    const lipsUpper = new THREE.Mesh(sphere(0.018, 8, 6), mat.lips);
    lipsUpper.position.set(cx, 1.025, cz + 0.12);
    lipsUpper.scale.set(1.6, 0.45, 0.7);
    g.add(lipsUpper);

    // ── Hair ──
    if (isAlpha) {
        // Blonde — long flowing hair
        const hairTop = new THREE.Mesh(sphere(0.14, 14, 10), hair);
        hairTop.position.set(cx, 1.09, cz - 0.02);
        hairTop.scale.set(1.02, 1.08, 0.95);
        g.add(hairTop);

        // Hair flowing down back
        g.add(meshAt(cyl(0.09, 0.05, 0.35, 10), hair, cx, 0.82, cz - 0.12));

        // Side strands
        [-1, 1].forEach(s => {
            const strand = new THREE.Mesh(cyl(0.025, 0.015, 0.25, 8), hair);
            strand.position.set(cx + s * 0.11, 0.9, cz + 0.03);
            strand.rotation.z = s * 0.12;
            g.add(strand);
        });

        // Parting highlight
        const highlight = new THREE.Mesh(box(0.02, 0.01, 0.1),
            new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 }));
        highlight.position.set(cx + 0.04, 1.17, cz - 0.02);
        g.add(highlight);
    } else {
        // Japanese bob cut
        const hairTop = new THREE.Mesh(sphere(0.14, 14, 10), hair);
        hairTop.position.set(cx, 1.1, cz - 0.01);
        hairTop.scale.set(1.06, 1.02, 1.04);
        g.add(hairTop);

        // Bob sides
        [-1, 1].forEach(s => {
            const bob = new THREE.Mesh(box(0.065, 0.16, 0.09), hair);
            bob.position.set(cx + s * 0.115, 0.97, cz + 0.01);
            g.add(bob);
        });

        // Straight bangs
        const bangs = new THREE.Mesh(box(0.22, 0.035, 0.05), hair);
        bangs.position.set(cx, 1.14, cz + 0.1);
        g.add(bangs);

        // Hair ornament (small red clip)
        const clip = new THREE.Mesh(sphere(0.015, 6, 4),
            new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0xff2222, emissiveIntensity: 0.3 }));
        clip.position.set(cx + 0.1, 1.1, cz + 0.04);
        g.add(clip);
    }

    // ── Arms ──
    [-1, 1].forEach(s => {
        // Shoulder
        g.add(meshAt(sphere(0.045, 8, 6), dress, cx + s * 0.18, 0.8, cz + 0.02));
        // Upper arm
        const uArm = new THREE.Mesh(cyl(0.035, 0.03, 0.22, 8), dress);
        uArm.position.set(cx + s * 0.2, 0.68, cz + 0.15);
        uArm.rotation.x = 0.7;
        uArm.rotation.z = s * 0.15;
        g.add(uArm);
        // Forearm
        const fArm = new THREE.Mesh(cyl(0.028, 0.022, 0.22, 8), skin);
        fArm.position.set(cx + s * 0.18, 0.72, cz + 0.42);
        fArm.rotation.x = 1.1;
        g.add(fArm);
        // Hand
        g.add(meshAt(sphere(0.022, 8, 6), skin, cx + s * 0.14, 0.79, cz + 0.55));
        // Fingers (3 per hand)
        for (let f = -1; f <= 1; f++) {
            g.add(meshAt(cyl(0.005, 0.004, 0.04, 4), skin,
                cx + s * 0.14 + f * 0.01, 0.79, cz + 0.57));
        }
    });

    // ── Legs (seated) ──
    [-1, 1].forEach(s => {
        // Thigh
        const thigh = new THREE.Mesh(cyl(0.06, 0.05, 0.38, 10), dress);
        thigh.position.set(cx + s * 0.08, 0.38, cz + 0.2);
        thigh.rotation.x = 1.55;
        g.add(thigh);
        // Knee
        g.add(meshAt(sphere(0.042, 8, 6), dress, cx + s * 0.08, 0.38, cz + 0.42));
        // Calf
        const calf = new THREE.Mesh(cyl(0.035, 0.028, 0.35, 8), skin);
        calf.position.set(cx + s * 0.08, 0.18, cz + 0.48);
        calf.rotation.x = -0.08;
        g.add(calf);
        // Shoe
        const shoe = new THREE.Mesh(box(0.06, 0.04, 0.13),
            new THREE.MeshStandardMaterial({ color: isAlpha ? 0x2c3e50 : 0x1a1a2e, roughness: 0.4, metalness: 0.15 }));
        shoe.position.set(cx + s * 0.08, 0.03, cz + 0.55);
        g.add(shoe);
    });

    g.position.copy(deskPos);
    scene.add(g);
}

// ── PLAYER'S EXECUTIVE DESK ──
function buildPlayerDesk(scene) {
    const px = 0, pz = 5.5;

    // Large L-shaped executive desk
    const topW = 3.0, topD = 1.2;
    addMesh(scene, box(topW, 0.06, topD), mat.deskDark, px, 0.76, pz, true);

    // Front panel
    addMesh(scene, box(topW, 0.55, 0.04), mat.deskDark, px, 0.48, pz + topD / 2 - 0.02);

    // Side panels
    addMesh(scene, box(0.04, 0.55, topD), mat.deskDark, px - topW / 2 + 0.02, 0.48, pz);
    addMesh(scene, box(0.04, 0.55, topD), mat.deskDark, px + topW / 2 - 0.02, 0.48, pz);

    // Metal frame legs
    [[-1.4, -0.5], [-1.4, 0.5], [1.4, -0.5], [1.4, 0.5]].forEach(([lx, lz]) => {
        addMesh(scene, box(0.04, 0.76, 0.04), mat.deskLeg, px + lx, 0.38, pz + lz);
    });

    // Main monitor (large, ultrawide)
    addMesh(scene, box(1.0, 0.55, 0.02), mat.monitor, px, 1.32, pz - 0.3);
    const playerScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.92, 0.48),
        mat.screenOff
    );
    playerScreen.position.set(px, 1.32, pz - 0.285);
    scene.add(playerScreen);
    addMesh(scene, box(0.06, 0.28, 0.06), mat.monitor, px, 0.94, pz - 0.3);    // stand
    addMesh(scene, box(0.3, 0.015, 0.16), mat.monitor, px, 0.795, pz - 0.3);   // base

    // Keyboard
    addMesh(scene, box(0.48, 0.012, 0.16), mat.monitor, px - 0.05, 0.8, pz + 0.1);
    // Mouse
    addMesh(scene, box(0.065, 0.01, 0.1), mat.monitor, px + 0.4, 0.8, pz + 0.1);

    // Desk accessories
    // Phone
    addMesh(scene, box(0.08, 0.04, 0.16), mat.monitor, px + 1.1, 0.8, pz - 0.2);
    // Pen holder
    const penHolder = new THREE.Mesh(cyl(0.03, 0.03, 0.08, 10), mat.monitor);
    penHolder.position.set(px + 0.8, 0.82, pz + 0.1);
    scene.add(penHolder);
    // Pens in holder
    for (let i = 0; i < 3; i++) {
        addMesh(scene, cyl(0.004, 0.004, 0.12, 4), mat.pen,
            px + 0.8 + (i - 1) * 0.012, 0.9, pz + 0.1);
    }
    // Coffee mug
    const mug = new THREE.Mesh(cyl(0.035, 0.03, 0.08, 10), mat.coffeeMug);
    mug.position.set(px - 1.0, 0.82, pz + 0.2);
    scene.add(mug);

    // Papers stack
    addMesh(scene, box(0.28, 0.008, 0.38), mat.paper, px - 0.8, 0.79, pz - 0.1);
    addMesh(scene, box(0.28, 0.008, 0.38), mat.paper, px - 0.78, 0.798, pz - 0.08);

    // Player's chair (facing north, toward assistants)
    const playerChairGroup = new THREE.Group();
    buildChair(playerChairGroup, 0, 0, 0, 0);
    playerChairGroup.position.set(px, 0, pz + 0.85);
    scene.add(playerChairGroup);
}

// ── BOOKSHELF ──
function buildBookshelf(scene) {
    const bx = -9.5, bz = -4;
    // Back board
    addMesh(scene, box(0.08, 2.2, 0.8), mat.bookshelf, bx, 1.1, bz);
    // Shelves
    [0.3, 0.8, 1.3, 1.8].forEach(y => {
        addMesh(scene, box(0.55, 0.03, 0.75), mat.bookshelf, bx + 0.24, y, bz);
    });
    // Books
    [0.35, 0.85, 1.35].forEach((y) => {
        for (let i = 0; i < 5; i++) {
            const h = 0.18 + Math.random() * 0.18;
            const bMat = mat.book[i % 5];
            addMesh(scene, box(0.06, h, 0.38 + Math.random() * 0.1),
                bMat, bx + 0.15 + i * 0.08, y + h / 2 + 0.02, bz);
        }
    });
}

// ── WHITEBOARD ──
function buildWhiteboard(scene) {
    const wx = 9.85, wz = -3;
    addMesh(scene, box(0.04, 1.2, 2.0), mat.whiteboard, wx, 2.5, wz);
    addMesh(scene, box(0.05, 0.03, 2.06), mat.whiteboardFrame, wx, 3.12, wz);
    addMesh(scene, box(0.05, 0.03, 2.06), mat.whiteboardFrame, wx, 1.88, wz);
    addMesh(scene, box(0.05, 1.28, 0.03), mat.whiteboardFrame, wx, 2.5, wz - 1.01);
    addMesh(scene, box(0.05, 1.28, 0.03), mat.whiteboardFrame, wx, 2.5, wz + 1.01);
    addMesh(scene, box(0.08, 0.02, 0.35), mat.whiteboardFrame, wx - 0.02, 1.92, wz);
}

// ── PLANTS ──
function buildPlants(scene) {
    const positions = [[-8.5, -6.5], [8.5, -6.5], [-8.5, 6.5], [8.5, 6.5], [-3, -7], [3, -7]];
    positions.forEach(([x, z]) => {
        // Pot
        const pot = new THREE.Mesh(cyl(0.15, 0.11, 0.3, 12), mat.pot);
        pot.position.set(x, 0.15, z); pot.castShadow = true;
        scene.add(pot);
        // Soil
        addMesh(scene, cyl(0.13, 0.13, 0.03, 12), mat.bookshelf, x, 0.3, z);
        // Leaves cluster
        const l1 = new THREE.Mesh(sphere(0.2, 10, 8), mat.plant);
        l1.position.set(x, 0.52, z); l1.castShadow = true;
        scene.add(l1);
        const l2 = new THREE.Mesh(sphere(0.15, 8, 6), mat.plantDark);
        l2.position.set(x + 0.08, 0.6, z - 0.04);
        scene.add(l2);
        const l3 = new THREE.Mesh(sphere(0.12, 8, 6), mat.plant);
        l3.position.set(x - 0.06, 0.55, z + 0.06);
        scene.add(l3);
        // Stem
        addMesh(scene, cyl(0.012, 0.012, 0.22, 4), mat.plantDark, x, 0.38, z);
    });
}

// ── RUG ──
function buildRug(scene) {
    const rugTex = makeNoiseTexture(0x6b5b4a, 12, 128);
    rugTex.repeat.set(2, 1.5);
    const rugMat = new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.95 });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.005, 2);
    scene.add(rug);

    // Rug border
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    addMesh(scene, box(5, 0.003, 0.06), borderMat, 0, 0.006, 0);
    addMesh(scene, box(5, 0.003, 0.06), borderMat, 0, 0.006, 4);
    addMesh(scene, box(0.06, 0.003, 4), borderMat, -2.5, 0.006, 2);
    addMesh(scene, box(0.06, 0.003, 4), borderMat, 2.5, 0.006, 2);
}

// ── WALL DECOR ──
function buildWallDecor(scene) {
    // Framed art on back wall (neutral tones, no colored boxes)
    const artColors = [0x8899aa, 0xa89070, 0x708888];
    artColors.forEach((color, i) => {
        const x = -5 + i * 5;
        // Canvas
        const artTex = makeNoiseTexture(color, 20, 64);
        const artMat = new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.6 });
        addMesh(scene, box(1.3, 0.9, 0.02), artMat, x, 3.5, -7.88);
        // Frame
        addMesh(scene, box(1.4, 0.04, 0.04), mat.whiteboardFrame, x, 3.97, -7.86);
        addMesh(scene, box(1.4, 0.04, 0.04), mat.whiteboardFrame, x, 3.03, -7.86);
        addMesh(scene, box(0.04, 0.98, 0.04), mat.whiteboardFrame, x - 0.68, 3.5, -7.86);
        addMesh(scene, box(0.04, 0.98, 0.04), mat.whiteboardFrame, x + 0.68, 3.5, -7.86);
    });

    // Clock on right wall
    const clockFace = new THREE.Mesh(cyl(0.2, 0.2, 0.025, 28),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    clockFace.rotation.z = Math.PI / 2;
    clockFace.position.set(9.86, 3.5, 0);
    scene.add(clockFace);
    // Clock frame
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.21, 0.015, 8, 28),
        mat.whiteboardFrame);
    ring.rotation.z = Math.PI / 2;
    ring.position.set(9.86, 3.5, 0);
    scene.add(ring);
}

// ── Helpers ──
function addMesh(scene, geo, material, x, y, z, receiveShadow = false) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    if (receiveShadow) m.receiveShadow = true;
    scene.add(m);
    return m;
}

function meshAt(geo, material, x, y, z) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    return m;
}
