import * as THREE from 'three';

/**
 * ============================================
 * CORPORATE OFFICE — ENHANCED VISUALS
 *
 * High-detail procedural characters:
 *   Sophia — Blonde European (blue dress)
 *   Yuki   — Black-haired Japanese (red blazer)
 *
 * Both seated in office chairs, facing south (toward player).
 * Player's executive desk with ultrawide monitor at south end.
 * ============================================
 */

// ── Texture Generators ──
function noiseTexture(base, variation, size = 256) {
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const r = (base >> 16) & 0xff, g = (base >> 8) & 0xff, b = base & 0xff;
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() - 0.5) * variation;
        img.data[i] = Math.max(0, Math.min(255, r + v));
        img.data[i + 1] = Math.max(0, Math.min(255, g + v));
        img.data[i + 2] = Math.max(0, Math.min(255, b + v));
        img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}

function woodTexture(base, size = 256) {
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const r = (base >> 16) & 0xff, g = (base >> 8) & 0xff, b = base & 0xff;
    ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(0, 0, size, size);
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 80; i++) {
        const y = Math.random() * size;
        ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
        ctx.fillRect(0, y, size, 1 + Math.random() * 2);
    }
    ctx.globalAlpha = 1;
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}

// ── Materials ──
const floorTex = woodTexture(0x8B6914); floorTex.repeat.set(8, 6);
const wallTex = noiseTexture(0xf0ebe5, 6); wallTex.repeat.set(3, 1);
const deskTex = woodTexture(0xc8a882);
const darkDeskTex = woodTexture(0x3d2b1f);

const M = {
    floor: new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.65, metalness: 0.05 }),
    wall: new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 }),
    ceil: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.95, side: THREE.DoubleSide }),
    baseboard: new THREE.MeshStandardMaterial({ color: 0xd4c5b5, roughness: 0.5, metalness: 0.1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xccddff, transparent: true, opacity: 0.1, roughness: 0.02, side: THREE.DoubleSide }),
    glassFrame: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.2, metalness: 0.8 }),
    desk: new THREE.MeshStandardMaterial({ map: deskTex, roughness: 0.55, metalness: 0.02 }),
    deskDark: new THREE.MeshStandardMaterial({ map: darkDeskTex, roughness: 0.5, metalness: 0.05 }),
    deskTop: new THREE.MeshStandardMaterial({ color: 0xf0e6d2, roughness: 0.4, metalness: 0.02 }),
    deskLeg: new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.25, metalness: 0.85 }),
    monitor: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.6 }),
    screenOff: new THREE.MeshStandardMaterial({ color: 0x0a0a15, emissive: 0x111133, emissiveIntensity: 0.3 }),
    screenA: new THREE.MeshStandardMaterial({ color: 0x0a1525, emissive: 0x4facfe, emissiveIntensity: 0.6 }),
    screenB: new THREE.MeshStandardMaterial({ color: 0x200a15, emissive: 0xf5576c, emissiveIntensity: 0.6 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.75 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.25, metalness: 0.85 }),
    windowFrame: new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.3, metalness: 0.5 }),
    skyGlow: new THREE.MeshStandardMaterial({ color: 0xaad4f5, emissive: 0x87ceeb, emissiveIntensity: 1.0 }),
    mug: new THREE.MeshStandardMaterial({ color: 0xf8f8f0, roughness: 0.35 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.9 }),
    pen: new THREE.MeshStandardMaterial({ color: 0x1a1a40, roughness: 0.3, metalness: 0.5 }),
    plant: new THREE.MeshStandardMaterial({ color: 0x3da35d, roughness: 0.9 }),
    plantDk: new THREE.MeshStandardMaterial({ color: 0x2d8a4e, roughness: 0.9 }),
    pot: new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 }),
    shelf: new THREE.MeshStandardMaterial({ color: 0x5a3010, roughness: 0.7 }),
    bookColors: [0xc0392b, 0x2980b9, 0x27ae60, 0x8e44ad, 0xe67e22].map(c =>
        new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 })),
    wbBoard: new THREE.MeshStandardMaterial({ color: 0xfcfcfc, roughness: 0.25 }),
    wbFrame: new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.3, metalness: 0.6 }),
    // Character materials
    skinEuro: new THREE.MeshStandardMaterial({ color: 0xfdd9b5, roughness: 0.85, metalness: 0.0 }),
    skinJapanese: new THREE.MeshStandardMaterial({ color: 0xf5deb3, roughness: 0.85, metalness: 0.0 }),
    hairBlonde: new THREE.MeshStandardMaterial({ color: 0xe8c861, roughness: 0.55, metalness: 0.08 }),
    hairBlondeHi: new THREE.MeshStandardMaterial({ color: 0xf5dc8c, roughness: 0.5, metalness: 0.1, emissive: 0x302000, emissiveIntensity: 0.1 }),
    hairBlack: new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.35, metalness: 0.15 }),
    hairBlackHi: new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.3, metalness: 0.2, emissive: 0x0a0a15, emissiveIntensity: 0.05 }),
    blueDress: new THREE.MeshStandardMaterial({ color: 0x2c5282, roughness: 0.6, metalness: 0.02 }),
    blueCollar: new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.5 }),
    redBlazer: new THREE.MeshStandardMaterial({ color: 0xcc2244, roughness: 0.55, metalness: 0.02 }),
    whiteShirt: new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.5 }),
    skirtBlue: new THREE.MeshStandardMaterial({ color: 0x1a3a6a, roughness: 0.6 }),
    skirtBlack: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 }),
    shoe: new THREE.MeshStandardMaterial({ color: 0x1a1a25, roughness: 0.4, metalness: 0.1 }),
    lip: new THREE.MeshStandardMaterial({ color: 0xcc6666, roughness: 0.7 }),
    lipRed: new THREE.MeshStandardMaterial({ color: 0xcc3344, roughness: 0.65 }),
    eyeWhite: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.3 }),
    irisBlue: new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.3 }),
    irisBrown: new THREE.MeshStandardMaterial({ color: 0x3a2210, roughness: 0.3 }),
    pupil: new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.2 }),
    eyebrowBlonde: new THREE.MeshStandardMaterial({ color: 0xb8973e, roughness: 0.7 }),
    eyebrowBlack: new THREE.MeshStandardMaterial({ color: 0x0e0e14, roughness: 0.5 }),
    eyelash: new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.4 }),
    necklace: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.15, metalness: 0.9 }),
};

// ── Geometry Cache ──
const _gc = {};
function bx(w, h, d) { const k = `b${w}_${h}_${d}`; return _gc[k] || (_gc[k] = new THREE.BoxGeometry(w, h, d)); }
function cy(rt, rb, h, s = 16) { const k = `c${rt}_${rb}_${h}_${s}`; return _gc[k] || (_gc[k] = new THREE.CylinderGeometry(rt, rb, h, s)); }
function sp(r, ws = 14, hs = 10) { const k = `s${r}_${ws}_${hs}`; return _gc[k] || (_gc[k] = new THREE.SphereGeometry(r, ws, hs)); }

// ── Exports ──
export const AGENT_POSITIONS = {
    alpha: new THREE.Vector3(-3.5, 0, -4),
    beta: new THREE.Vector3(3.5, 0, -4),
};
export const taskBoardMeshes = { alpha: null, beta: null };

// No GLB models — no animation mixers needed
export function getAnimationMixers() { return []; }

// ── Main Build ──
export function buildOffice(scene) {
    buildRoom(scene);
    buildWindows(scene);
    buildGlassPartition(scene);
    buildAssistantWorkstation(scene, 'alpha', AGENT_POSITIONS.alpha);
    buildAssistantWorkstation(scene, 'beta', AGENT_POSITIONS.beta);
    buildPlayerDesk(scene);
    buildBookshelf(scene);
    buildWhiteboard(scene);
    buildPlants(scene);
    buildRug(scene);
    buildWallArt(scene);
}

/* ════════════════ CHARACTERS ════════════════ */

// Build a detailed female character in sitting position facing SOUTH (toward player)
function buildSeatedCharacter(group, isAlpha) {
    const skin = isAlpha ? M.skinEuro : M.skinJapanese;
    const hair = isAlpha ? M.hairBlonde : M.hairBlack;
    const hairHi = isAlpha ? M.hairBlondeHi : M.hairBlackHi;
    const iris = isAlpha ? M.irisBlue : M.irisBrown;
    const eyebrow = isAlpha ? M.eyebrowBlonde : M.eyebrowBlack;
    const lip = isAlpha ? M.lip : M.lipRed;
    const topMat = isAlpha ? M.blueDress : M.redBlazer;
    const bottomMat = isAlpha ? M.skirtBlue : M.skirtBlack;
    const collarMat = isAlpha ? M.blueCollar : M.whiteShirt;

    const ch = new THREE.Group();

    // ── All coordinates are LOCAL to the chair position ──
    // Character sits with hips at chair seat height (~0.45), facing +Z (south toward player)

    const hipY = 0.46;

    // === LOWER BODY (sitting) ===

    // Hips / skirt
    const hips = mesh(cy(0.14, 0.16, 0.12, 14), bottomMat, 0, hipY, 0);
    ch.add(hips);

    // Upper legs — angled forward (sitting position — thighs nearly horizontal)
    const buildLeg = (side) => {
        const lx = side * 0.075;
        // Upper leg (thigh) — extends forward horizontally from hip
        const thigh = mesh(cy(0.055, 0.048, 0.38, 10), skin, lx, hipY - 0.04, 0.17);
        thigh.rotation.x = Math.PI / 2.15; // nearly horizontal
        ch.add(thigh);
        // Knee
        ch.add(mesh(sp(0.048, 8, 6), skin, lx, hipY - 0.06, 0.33));
        // Lower leg — drops down from knee
        const shin = mesh(cy(0.04, 0.035, 0.35, 10), skin, lx, hipY - 0.27, 0.36);
        shin.rotation.x = 0.1;
        ch.add(shin);
        // Shoe
        const shoe = mesh(bx(0.065, 0.035, 0.12), M.shoe, lx, hipY - 0.46, 0.39);
        ch.add(shoe);
    };
    buildLeg(-1);
    buildLeg(1);

    // === TORSO ===

    // Waist
    ch.add(mesh(cy(0.12, 0.13, 0.08, 14), topMat, 0, hipY + 0.08, 0));
    // Mid-torso
    ch.add(mesh(cy(0.13, 0.12, 0.12, 14), topMat, 0, hipY + 0.16, 0));
    // Upper torso / chest
    ch.add(mesh(cy(0.14, 0.13, 0.12, 14), topMat, 0, hipY + 0.24, 0));
    // Chest detail
    ch.add(mesh(sp(0.055, 10, 8), topMat, -0.045, hipY + 0.24, 0.06));
    ch.add(mesh(sp(0.055, 10, 8), topMat, 0.045, hipY + 0.24, 0.06));
    // Collar / neckline
    ch.add(mesh(cy(0.08, 0.1, 0.03, 12), collarMat, 0, hipY + 0.30, 0.02));

    // Shoulders
    ch.add(mesh(sp(0.048, 10, 8), topMat, -0.15, hipY + 0.27, 0));
    ch.add(mesh(sp(0.048, 10, 8), topMat, 0.15, hipY + 0.27, 0));

    // === ARMS (resting on desk or lap) ===
    const buildArm = (side) => {
        const ax = side * 0.16;
        // Upper arm
        const upperArm = mesh(cy(0.035, 0.03, 0.24, 8), topMat, ax, hipY + 0.14, 0.06);
        upperArm.rotation.z = side * 0.15;
        upperArm.rotation.x = 0.3;
        ch.add(upperArm);
        // Elbow
        ch.add(mesh(sp(0.03, 8, 6), skin, ax + side * 0.02, hipY + 0.04, 0.15));
        // Forearm — extending forward onto desk
        const forearm = mesh(cy(0.028, 0.024, 0.22, 8), skin,
            ax + side * 0.02, hipY + 0.03, 0.3);
        forearm.rotation.x = Math.PI / 2.2;
        ch.add(forearm);
        // Hand
        ch.add(mesh(sp(0.025, 8, 6), skin, ax + side * 0.02, hipY + 0.02, 0.37));
        // Fingers
        for (let f = -1; f <= 1; f++) {
            ch.add(mesh(cy(0.006, 0.004, 0.04, 4), skin,
                ax + side * 0.02 + f * 0.012, hipY + 0.01, 0.4));
        }
    };
    buildArm(-1);
    buildArm(1);

    // === NECK ===
    const neckY = hipY + 0.33;
    ch.add(mesh(cy(0.035, 0.04, 0.07, 10), skin, 0, neckY, 0));

    // Necklace (Sophia gets gold necklace)
    if (isAlpha) {
        ch.add(mesh(new THREE.TorusGeometry(0.045, 0.004, 6, 18), M.necklace, 0, neckY - 0.01, 0.02));
    }

    // === HEAD ===
    const headY = neckY + 0.1;
    const head = mesh(sp(0.1, 20, 16), skin, 0, headY, 0);
    head.scale.set(0.88, 0.95, 0.85);
    ch.add(head);

    // Face detail — slight forward facing
    // Nose
    const nose = mesh(cy(0.012, 0.008, 0.03, 6), skin, 0, headY - 0.01, 0.08);
    nose.rotation.x = -0.3;
    ch.add(nose);

    // Lips
    ch.add(mesh(bx(0.035, 0.008, 0.008), lip, 0, headY - 0.035, 0.076));
    ch.add(mesh(bx(0.03, 0.006, 0.006), skin, 0, headY - 0.042, 0.074));

    // Eyes
    const buildEye = (side) => {
        const ex = side * 0.032;
        // Eye white
        const white = mesh(sp(0.017, 10, 8), M.eyeWhite, ex, headY + 0.01, 0.074);
        white.scale.set(1.3, 0.8, 0.5);
        ch.add(white);
        // Iris
        const irisM = mesh(sp(0.01, 8, 6), iris, ex, headY + 0.01, 0.082);
        ch.add(irisM);
        // Pupil
        ch.add(mesh(sp(0.005, 6, 4), M.pupil, ex, headY + 0.01, 0.086));
        // Eyelid / eyelash
        const lash = mesh(bx(0.04, 0.004, 0.015), M.eyelash, ex, headY + 0.022, 0.076);
        lash.rotation.x = 0.15;
        ch.add(lash);
        // Eyebrow
        const brow = mesh(bx(0.035, 0.005, 0.008), eyebrow, ex, headY + 0.04, 0.07);
        brow.rotation.z = side * -0.1;
        ch.add(brow);
    };
    buildEye(-1);
    buildEye(1);

    // Ears
    ch.add(mesh(sp(0.02, 6, 4), skin, -0.085, headY, 0));
    ch.add(mesh(sp(0.02, 6, 4), skin, 0.085, headY, 0));

    // === HAIR ===
    if (isAlpha) {
        // Sophia — long blonde hair, flowing past shoulders
        // Top
        const top = mesh(sp(0.105, 16, 12), hair, 0, headY + 0.04, -0.01);
        top.scale.set(0.95, 0.85, 0.9);
        ch.add(top);
        // Sides
        ch.add(mesh(bx(0.04, 0.14, 0.09), hair, -0.07, headY - 0.03, -0.02));
        ch.add(mesh(bx(0.04, 0.14, 0.09), hair, 0.07, headY - 0.03, -0.02));
        // Back — long flowing hair
        const back1 = mesh(bx(0.16, 0.2, 0.04), hair, 0, headY - 0.06, -0.07);
        ch.add(back1);
        const back2 = mesh(bx(0.14, 0.12, 0.035), hair, 0, headY - 0.2, -0.06);
        ch.add(back2);
        // Flowing ends past shoulders
        ch.add(mesh(bx(0.12, 0.08, 0.03), hairHi, 0, headY - 0.28, -0.05));
        // Bangs
        ch.add(mesh(bx(0.12, 0.025, 0.04), hairHi, 0, headY + 0.06, 0.06));
        // Side fringe
        ch.add(mesh(bx(0.025, 0.06, 0.04), hairHi, -0.06, headY + 0.01, 0.05));
    } else {
        // Yuki — sleek black bob cut (Japanese style)
        // Top
        const top = mesh(sp(0.108, 16, 12), hair, 0, headY + 0.035, -0.01);
        top.scale.set(0.92, 0.85, 0.92);
        ch.add(top);
        // Bob sides — sharp cut at chin level
        ch.add(mesh(bx(0.04, 0.12, 0.1), hair, -0.072, headY - 0.02, -0.005));
        ch.add(mesh(bx(0.04, 0.12, 0.1), hair, 0.072, headY - 0.02, -0.005));
        // Back
        ch.add(mesh(bx(0.15, 0.12, 0.04), hair, 0, headY - 0.04, -0.065));
        // Shinny highlights
        ch.add(mesh(bx(0.08, 0.05, 0.02), hairHi, 0.02, headY + 0.04, -0.06));
        // Straight-cut bangs across forehead
        ch.add(mesh(bx(0.13, 0.02, 0.04), hair, 0, headY + 0.06, 0.06));
        ch.add(mesh(bx(0.12, 0.015, 0.03), hairHi, 0, headY + 0.048, 0.065));
    }

    // The whole character group faces +Z (south), positioned at the chair
    ch.castShadow = true;
    return ch;
}

/* ════════════════ WORKSTATION ════════════════ */

function buildAssistantWorkstation(scene, agentId, pos) {
    const isAlpha = agentId === 'alpha';
    const g = new THREE.Group();

    // ── Desk (faces south — front panel on +Z side) ──
    g.add(mesh(bx(2.4, 0.06, 1.1), M.deskTop, 0, 0.76, 0));
    g.add(mesh(bx(2.4, 0.5, 0.04), M.desk, 0, 0.5, -0.53)); // back panel
    g.add(mesh(bx(0.04, 0.5, 1.06), M.desk, -1.18, 0.5, 0));
    g.add(mesh(bx(0.04, 0.5, 1.06), M.desk, 1.18, 0.5, 0));
    [[-1.1, -0.5], [-1.1, 0.5], [1.1, -0.5], [1.1, 0.5]].forEach(([lx, lz]) => {
        g.add(mesh(bx(0.04, 0.76, 0.04), M.deskLeg, lx, 0.38, lz));
    });

    // Monitor (on desk, screen faces +Z toward player)
    g.add(mesh(bx(0.85, 0.5, 0.02), M.monitor, 0, 1.3, -0.15));
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.44), isAlpha ? M.screenA : M.screenB);
    scr.position.set(0, 1.3, -0.13);
    g.add(scr);
    g.add(mesh(bx(0.05, 0.25, 0.05), M.monitor, 0, 0.93, -0.15));
    g.add(mesh(bx(0.22, 0.015, 0.14), M.monitor, 0, 0.795, -0.15));

    // Keyboard + mouse (on desk, near player side)
    g.add(mesh(bx(0.42, 0.012, 0.14), M.monitor, -0.05, 0.8, 0.2));
    g.add(mesh(bx(0.065, 0.01, 0.09), M.monitor, 0.35, 0.8, 0.2));

    // Coffee mug
    g.add(mesh(cy(0.03, 0.025, 0.07, 10), M.mug, isAlpha ? 0.85 : -0.85, 0.82, 0.15));

    // Papers + pen
    g.add(mesh(bx(0.25, 0.004, 0.35), M.paper, isAlpha ? -0.7 : 0.7, 0.79, 0));
    g.add(mesh(bx(0.01, 0.008, 0.14), M.pen, isAlpha ? -0.5 : 0.5, 0.79, 0.15));

    // ── Office Chair (facing +Z south — toward player) ──
    const chair = buildChair();
    chair.position.set(0, 0, 0.6); // Behind desk (closer to player side)
    chair.rotation.y = 0; // Faces +Z (south)
    g.add(chair);

    // ── Seated Character (on the chair facing +Z south) ──
    const character = buildSeatedCharacter(g.children.length, isAlpha);
    character.position.set(0, 0, 0.6); // Same position as chair
    g.add(character);

    // ── Nameplate ──
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = isAlpha ? '#2c5282' : '#cc2244';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Inter, Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(isAlpha ? 'SOPHIA — AI ALPHA' : 'YUKI — AI BETA', 128, 32);
    const nTex = new THREE.CanvasTexture(canvas);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.14),
        new THREE.MeshStandardMaterial({ map: nTex }));
    plate.position.set(0, 0.84, 0.8);
    g.add(plate);

    // Position the whole workstation group
    g.position.copy(pos);
    scene.add(g);
}

function buildChair() {
    const cg = new THREE.Group();
    // Seat
    cg.add(mesh(bx(0.48, 0.06, 0.48), M.leather, 0, 0.45, 0));
    // Back rest
    cg.add(mesh(bx(0.48, 0.55, 0.04), M.leather, 0, 0.78, -0.24));
    // Headrest
    cg.add(mesh(bx(0.3, 0.12, 0.04), M.leather, 0, 1.08, -0.24));
    // Armrests
    [-1, 1].forEach(s => {
        cg.add(mesh(bx(0.04, 0.04, 0.35), M.metal, s * 0.24, 0.58, -0.04));
        cg.add(mesh(bx(0.04, 0.13, 0.04), M.metal, s * 0.24, 0.5, 0.15));
    });
    // Pedestal
    cg.add(mesh(cy(0.025, 0.025, 0.42), M.metal, 0, 0.22, 0));
    // Star base + wheels
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const leg = mesh(bx(0.025, 0.018, 0.24), M.metal,
            Math.sin(a) * 0.12, 0.018, Math.cos(a) * 0.12);
        leg.rotation.y = a; cg.add(leg);
        cg.add(mesh(sp(0.018), M.monitor,
            Math.sin(a) * 0.24, 0.018, Math.cos(a) * 0.24));
    }
    return cg;
}

/* ════════════════ PLAYER DESK ════════════════ */

function buildPlayerDesk(scene) {
    const px = 0, pz = 5.5, w = 3.0, d = 1.2;
    addMesh(scene, bx(w, 0.06, d), M.deskDark, px, 0.76, pz, true);
    addMesh(scene, bx(w, 0.55, 0.04), M.deskDark, px, 0.48, pz + d / 2 - 0.02);
    addMesh(scene, bx(0.04, 0.55, d), M.deskDark, px - w / 2 + 0.02, 0.48, pz);
    addMesh(scene, bx(0.04, 0.55, d), M.deskDark, px + w / 2 - 0.02, 0.48, pz);
    [[-1.4, -0.5], [-1.4, 0.5], [1.4, -0.5], [1.4, 0.5]].forEach(([lx, lz]) => {
        addMesh(scene, bx(0.04, 0.76, 0.04), M.deskLeg, px + lx, 0.38, pz + lz);
    });
    // Ultrawide monitor
    addMesh(scene, bx(1.0, 0.55, 0.02), M.monitor, px, 1.32, pz - 0.3);
    const pScr = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.48), M.screenOff);
    pScr.position.set(px, 1.32, pz - 0.285); scene.add(pScr);
    addMesh(scene, bx(0.06, 0.28, 0.06), M.monitor, px, 0.94, pz - 0.3);
    addMesh(scene, bx(0.3, 0.015, 0.16), M.monitor, px, 0.795, pz - 0.3);
    // Keyboard, mouse
    addMesh(scene, bx(0.48, 0.012, 0.16), M.monitor, px - 0.05, 0.8, pz + 0.1);
    addMesh(scene, bx(0.065, 0.01, 0.1), M.monitor, px + 0.4, 0.8, pz + 0.1);
    // Phone
    addMesh(scene, bx(0.08, 0.04, 0.16), M.monitor, px + 1.1, 0.8, pz - 0.2);
    // Coffee
    const mug = new THREE.Mesh(cy(0.035, 0.03, 0.08, 10), M.mug);
    mug.position.set(px - 1.0, 0.82, pz + 0.2); scene.add(mug);
    addMesh(scene, bx(0.28, 0.008, 0.38), M.paper, px - 0.8, 0.79, pz - 0.1);

    // Player chair (faces -Z — toward desk/north)
    const pc = buildChair();
    pc.position.set(px, 0, pz + 0.85);
    pc.rotation.y = Math.PI; // faces north toward desk
    scene.add(pc);
}

/* ════════════════ ROOM STRUCTURE ════════════════ */

function buildRoom(scene) {
    const wh = 5, wt = 0.2;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), M.floor);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    addMesh(scene, bx(20, wh, wt), M.wall, 0, wh / 2, -8, true);
    addMesh(scene, bx(7, wh, wt), M.wall, -6.5, wh / 2, 8, true);
    addMesh(scene, bx(7, wh, wt), M.wall, 6.5, wh / 2, 8, true);
    addMesh(scene, bx(6, 1.5, wt), M.wall, 0, wh - 0.75, 8);
    addMesh(scene, bx(wt, wh, 16), M.wall, -10, wh / 2, 0, true);
    addMesh(scene, bx(wt, wh, 16), M.wall, 10, wh / 2, 0, true);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), M.ceil);
    ceil.rotation.x = Math.PI / 2; ceil.position.y = wh; scene.add(ceil);
    addMesh(scene, bx(20, 0.12, 0.05), M.baseboard, 0, 0.06, -7.88);
    addMesh(scene, bx(0.05, 0.12, 16), M.baseboard, -9.88, 0.06, 0);
    addMesh(scene, bx(0.05, 0.12, 16), M.baseboard, 9.88, 0.06, 0);
}

function buildWindows(scene) {
    for (let i = 0; i < 3; i++) {
        const x = -6 + i * 6;
        addMesh(scene, new THREE.PlaneGeometry(2.4, 1.8), M.skyGlow, x, 3, -7.86);
        addMesh(scene, new THREE.PlaneGeometry(2.4, 1.8), M.glass, x, 3, -7.83);
        [[-1.22, 0], [1.22, 0], [0, 0]].forEach(([ox]) => {
            addMesh(scene, bx(0.05, 1.9, 0.05), M.windowFrame, x + ox, 3, -7.8);
        });
        addMesh(scene, bx(2.5, 0.05, 0.05), M.windowFrame, x, 3.92, -7.8);
        addMesh(scene, bx(2.5, 0.05, 0.05), M.windowFrame, x, 2.08, -7.8);
    }
}

function buildGlassPartition(scene) {
    addMesh(scene, bx(0.04, 3, 10), M.glass, 0, 1.5, -1);
    [-5, -2.5, 0, 2.5, 5].forEach(z =>
        addMesh(scene, bx(0.05, 3, 0.03), M.glassFrame, 0, 1.5, -1 + z));
    addMesh(scene, bx(0.05, 0.03, 10), M.glassFrame, 0, 3, -1);
    addMesh(scene, bx(0.05, 0.03, 10), M.glassFrame, 0, 0.02, -1);
}

/* ════════════════ DECOR ════════════════ */

function buildBookshelf(scene) {
    const bx2 = -9.5, bz = -4;
    addMesh(scene, bx(0.08, 2.2, 0.8), M.shelf, bx2, 1.1, bz);
    [0.3, 0.8, 1.3, 1.8].forEach(y =>
        addMesh(scene, bx(0.55, 0.03, 0.75), M.shelf, bx2 + 0.24, y, bz));
    [0.35, 0.85, 1.35].forEach(y => {
        for (let i = 0; i < 5; i++) {
            const h = 0.18 + Math.random() * 0.18;
            addMesh(scene, bx(0.06, h, 0.38 + Math.random() * 0.1), M.bookColors[i], bx2 + 0.15 + i * 0.08, y + h / 2 + 0.02, bz);
        }
    });
}

function buildWhiteboard(scene) {
    const wx = 9.85, wz = -3;
    addMesh(scene, bx(0.04, 1.2, 2.0), M.wbBoard, wx, 2.5, wz);
    addMesh(scene, bx(0.05, 0.03, 2.06), M.wbFrame, wx, 3.12, wz);
    addMesh(scene, bx(0.05, 0.03, 2.06), M.wbFrame, wx, 1.88, wz);
    addMesh(scene, bx(0.05, 1.28, 0.03), M.wbFrame, wx, 2.5, wz - 1.01);
    addMesh(scene, bx(0.05, 1.28, 0.03), M.wbFrame, wx, 2.5, wz + 1.01);
    addMesh(scene, bx(0.08, 0.02, 0.35), M.wbFrame, wx - 0.02, 1.92, wz);
}

function buildPlants(scene) {
    [[-8.5, -6.5], [8.5, -6.5], [-8.5, 6.5], [8.5, 6.5], [-3, -7], [3, -7]].forEach(([x, z]) => {
        scene.add(mesh(cy(0.15, 0.11, 0.3, 12), M.pot, x, 0.15, z));
        addMesh(scene, cy(0.13, 0.13, 0.03, 12), M.shelf, x, 0.3, z);
        scene.add(mesh(sp(0.2, 10, 8), M.plant, x, 0.52, z));
        scene.add(mesh(sp(0.15, 8, 6), M.plantDk, x + 0.08, 0.6, z - 0.04));
        scene.add(mesh(sp(0.12, 8, 6), M.plant, x - 0.06, 0.55, z + 0.06));
        addMesh(scene, cy(0.012, 0.012, 0.22, 4), M.plantDk, x, 0.38, z);
    });
}

function buildRug(scene) {
    const rt = noiseTexture(0x6b5b4a, 12, 128); rt.repeat.set(2, 1.5);
    const rm = new THREE.MeshStandardMaterial({ map: rt, roughness: 0.95 });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), rm);
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.005, 2); scene.add(rug);
    const bm = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    addMesh(scene, bx(5, 0.003, 0.06), bm, 0, 0.006, 0);
    addMesh(scene, bx(5, 0.003, 0.06), bm, 0, 0.006, 4);
    addMesh(scene, bx(0.06, 0.003, 4), bm, -2.5, 0.006, 2);
    addMesh(scene, bx(0.06, 0.003, 4), bm, 2.5, 0.006, 2);
}

function buildWallArt(scene) {
    [0x8899aa, 0xa89070, 0x708888].forEach((color, i) => {
        const x = -5 + i * 5;
        const at = noiseTexture(color, 20, 64);
        const am = new THREE.MeshStandardMaterial({ map: at, roughness: 0.6 });
        addMesh(scene, bx(1.3, 0.9, 0.02), am, x, 3.5, -7.88);
        addMesh(scene, bx(1.4, 0.04, 0.04), M.wbFrame, x, 3.97, -7.86);
        addMesh(scene, bx(1.4, 0.04, 0.04), M.wbFrame, x, 3.03, -7.86);
        addMesh(scene, bx(0.04, 0.98, 0.04), M.wbFrame, x - 0.68, 3.5, -7.86);
        addMesh(scene, bx(0.04, 0.98, 0.04), M.wbFrame, x + 0.68, 3.5, -7.86);
    });
    // Clock
    const cf = new THREE.Mesh(cy(0.2, 0.2, 0.025, 28),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    cf.rotation.z = Math.PI / 2; cf.position.set(9.86, 3.5, 0); scene.add(cf);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.015, 8, 28), M.wbFrame);
    ring.rotation.z = Math.PI / 2; ring.position.set(9.86, 3.5, 0); scene.add(ring);
}

/* ════════════════ HELPERS ════════════════ */

function mesh(geo, material, x, y, z) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    return m;
}

function addMesh(scene, geo, material, x, y, z, shadow = false) {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    if (shadow) m.receiveShadow = true;
    scene.add(m);
    return m;
}
