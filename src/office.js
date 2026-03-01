import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * ============================================
 * CORPORATE OFFICE v3 — REALISTIC ENVIRONMENT
 *
 * Changes from v2:
 *   ✓ REMOVED glass partition wall
 *   ✓ REMOVED rug
 *   ✓ ROTATED assistant desks 180° (screen away from player)
 *   ✓ Assistants sit on near side of desk (facing player)
 *   ✓ GLB character models (woman1.glb, michelle.glb)
 *   ✓ Richer environment: extra workstations, doors, lamps, filing cabinets, water cooler
 * ============================================
 */

const loader = new GLTFLoader();

// ── Texture Generators ──
function noiseTex(base, variation, size = 256) {
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

function woodTex(base, size = 256) {
    const c = document.createElement('canvas'); c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    const r = (base >> 16) & 0xff, g = (base >> 8) & 0xff, b = base & 0xff;
    ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.fillRect(0, 0, size, size);
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 80; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#fff';
        ctx.fillRect(0, Math.random() * size, size, 1 + Math.random() * 2);
    }
    ctx.globalAlpha = 1;
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}

// ── Materials ──
const floorTx = woodTex(0x8B6914); floorTx.repeat.set(8, 6);
const wallTx = noiseTex(0xf0ebe5, 6); wallTx.repeat.set(3, 1);

const M = {
    floor: new THREE.MeshStandardMaterial({ map: floorTx, roughness: 0.65, metalness: 0.05 }),
    wall: new THREE.MeshStandardMaterial({ map: wallTx, roughness: 0.9 }),
    ceil: new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.95, side: THREE.DoubleSide }),
    baseboard: new THREE.MeshStandardMaterial({ color: 0xd4c5b5, roughness: 0.5, metalness: 0.1 }),
    desk: new THREE.MeshStandardMaterial({ map: woodTex(0xc8a882), roughness: 0.55, metalness: 0.02 }),
    deskTop: new THREE.MeshStandardMaterial({ color: 0xf0e6d2, roughness: 0.4, metalness: 0.02 }),
    deskDark: new THREE.MeshStandardMaterial({ map: woodTex(0x3d2b1f), roughness: 0.5, metalness: 0.05 }),
    leg: new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.25, metalness: 0.85 }),
    monitor: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.6 }),
    screenOff: new THREE.MeshStandardMaterial({ color: 0x0a0a15, emissive: 0x111133, emissiveIntensity: 0.3 }),
    screenA: new THREE.MeshStandardMaterial({ color: 0x0a1525, emissive: 0x4facfe, emissiveIntensity: 0.6 }),
    screenB: new THREE.MeshStandardMaterial({ color: 0x200a15, emissive: 0xf5576c, emissiveIntensity: 0.6 }),
    screenGreen: new THREE.MeshStandardMaterial({ color: 0x0a2510, emissive: 0x44cc66, emissiveIntensity: 0.4 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.75 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.25, metalness: 0.85 }),
    wFrame: new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.3, metalness: 0.5 }),
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
    door: new THREE.MeshStandardMaterial({ map: woodTex(0x6b4226), roughness: 0.6 }),
    doorFrame: new THREE.MeshStandardMaterial({ color: 0xe0d5c5, roughness: 0.5, metalness: 0.1 }),
    doorHandle: new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.9 }),
    cabinet: new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.4, metalness: 0.3 }),
    cabinetDark: new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.35, metalness: 0.35 }),
    waterCooler: new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.3 }),
    waterBlue: new THREE.MeshPhysicalMaterial({ color: 0x88ccff, transparent: true, opacity: 0.4, roughness: 0.1 }),
    lampBase: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.6 }),
    lampShade: new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.8, side: THREE.DoubleSide }),
    lampLight: new THREE.MeshStandardMaterial({ color: 0xfff8e0, emissive: 0xfff0c0, emissiveIntensity: 0.8 }),
    coatRack: new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.6 }),
    carpet: new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.95 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xccddff, transparent: true, opacity: 0.1, roughness: 0.02, side: THREE.DoubleSide }),
    glassFrame: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.2, metalness: 0.8 }),
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

const animMixers = [];
export function getAnimationMixers() { return animMixers; }

// ── Main Build ──
export function buildOffice(scene) {
    buildRoom(scene);
    buildWindows(scene);
    buildDoors(scene);

    // Assistant workstations (desks rotated 180° — screen faces north/wall, assistant sits on south/player side)
    buildAssistantWorkstation(scene, 'alpha', AGENT_POSITIONS.alpha);
    buildAssistantWorkstation(scene, 'beta', AGENT_POSITIONS.beta);

    // Player executive desk
    buildPlayerDesk(scene);

    // Extra co-worker workstations (empty desks to fill the office)
    buildExtraWorkstation(scene, -7.5, -5.5, 0);
    buildExtraWorkstation(scene, 7.5, -5.5, 0);
    buildExtraWorkstation(scene, -7, 2, Math.PI / 2);
    buildExtraWorkstation(scene, 7, 2, -Math.PI / 2);

    // Decor & environment
    buildBookshelf(scene);
    buildWhiteboard(scene);
    buildPlants(scene);
    buildFilingCabinets(scene);
    buildWaterCooler(scene);
    buildCeilingLights(scene);
    buildCoatRack(scene);
    buildClock(scene);

    // Build seated office assistant characters (procedural — reliable & professional)
    buildSeatedCharacter(scene, 'alpha', AGENT_POSITIONS.alpha);
    buildSeatedCharacter(scene, 'beta', AGENT_POSITIONS.beta);
}

/* ═══════════════════════════════════════════
   SEATED OFFICE WOMAN — Procedural character
   Already posed in sitting position, professional look
   ═══════════════════════════════════════════ */

function buildSeatedCharacter(scene, agentId, deskPos) {
    const isAlpha = agentId === 'alpha';
    const g = new THREE.Group();

    // ── Materials ──
    const skin = new THREE.MeshStandardMaterial({
        color: isAlpha ? 0xf5cba7 : 0xd4a574, roughness: 0.75, metalness: 0.02
    });
    const blazer = new THREE.MeshStandardMaterial({
        color: isAlpha ? 0x1a3a5c : 0x8b1a2b, roughness: 0.55, metalness: 0.05
    });
    const shirt = new THREE.MeshStandardMaterial({
        color: isAlpha ? 0xe8e8f0 : 0xf0e8e0, roughness: 0.65
    });
    const skirt = new THREE.MeshStandardMaterial({
        color: isAlpha ? 0x1a3050 : 0x2a1a2a, roughness: 0.5
    });
    const shoe = new THREE.MeshStandardMaterial({
        color: isAlpha ? 0x1a1a22 : 0x3a1a1a, roughness: 0.4, metalness: 0.1
    });
    const hair = new THREE.MeshStandardMaterial({
        color: isAlpha ? 0xd4a535 : 0x0a0a14, roughness: 0.45, metalness: 0.08
    });
    const lip = new THREE.MeshStandardMaterial({
        color: isAlpha ? 0xc08080 : 0xa06060, roughness: 0.6
    });

    // Seat height from chair = 0.45
    const seatY = 0.45;

    // ── Torso (blazer) ── sitting upright on chair
    const torso = mesh(bx(0.32, 0.36, 0.18), blazer, 0, seatY + 0.22, 0);
    torso.scale.set(1, 1, 1); g.add(torso);

    // Shirt collar visible at top of blazer
    g.add(mesh(bx(0.16, 0.06, 0.12), shirt, 0, seatY + 0.4, 0.02));

    // ── Neck ──
    g.add(mesh(cy(0.04, 0.035, 0.08, 10), skin, 0, seatY + 0.45, 0));

    // ── Head ── facing north (toward monitor) so player sees the face from south
    const headGroup = new THREE.Group();
    headGroup.position.set(0, seatY + 0.56, 0);
    // Head faces monitor (North) by default in this group setup

    const head = mesh(sp(0.1, 20, 16), skin, 0, 0, 0);
    head.scale.set(0.9, 1.0, 0.88); headGroup.add(head);

    // ── Eyes ── facing North (-Z)
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const pupilMat = new THREE.MeshStandardMaterial({
        color: isAlpha ? 0x3070b0 : 0x201a10, roughness: 0.1
    });
    [-1, 1].forEach(s => {
        headGroup.add(mesh(sp(0.018, 8, 6), eyeMat, s * 0.032, 0.02, -0.07));
        headGroup.add(mesh(sp(0.01, 6, 5), pupilMat, s * 0.032, 0.02, -0.082));
    });

    // ── Lips ──
    const lips = mesh(bx(0.035, 0.012, 0.015), lip, 0, -0.055, -0.08);
    lips.scale.set(1.2, 1, 1); headGroup.add(lips);

    // ── Nose ──
    headGroup.add(mesh(bx(0.015, 0.025, 0.02), skin, 0, -0.015, -0.085));

    // ── Hair ──
    if (isAlpha) {
        // Sophia: blonde, shoulder-length
        const hairTop = mesh(sp(0.105, 16, 12), hair, 0, 0.03, 0.03);
        hairTop.scale.set(1.02, 1.06, 0.95); headGroup.add(hairTop);
        // Side hair flowing down
        [-1, 1].forEach(s => {
            headGroup.add(mesh(bx(0.04, 0.18, 0.06), hair, s * 0.08, -0.11, 0.04));
        });
        // Back hair
        headGroup.add(mesh(bx(0.12, 0.2, 0.05), hair, 0, -0.12, 0.07));
    } else {
        // Yuki: black, up in a bun
        const hairTop = mesh(sp(0.108, 16, 12), hair, 0, 0.03, 0.035);
        hairTop.scale.set(1.0, 1.04, 0.93); headGroup.add(hairTop);
        // Bun on top
        headGroup.add(mesh(sp(0.06, 10, 8), hair, 0, 0.14, 0.04));
        // Bangs
        headGroup.add(mesh(bx(0.14, 0.03, 0.04), hair, 0, 0.07, -0.065));
    }

    g.add(headGroup);

    // ── Upper arms ── resting on desk, bent at elbows
    [-1, 1].forEach(s => {
        // Upper arm (shoulder to elbow, angled forward toward desk)
        const upperArm = mesh(bx(0.06, 0.06, 0.18), blazer, s * 0.2, seatY + 0.2, -0.12);
        upperArm.rotation.x = -0.3;
        g.add(upperArm);
        // Forearm (resting forward on desk surface)
        g.add(mesh(bx(0.05, 0.05, 0.18), shirt, s * 0.15, seatY + 0.33, -0.28));
        // Hand resting on desk
        g.add(mesh(bx(0.04, 0.02, 0.06), skin, s * 0.12, seatY + 0.34, -0.38));
    });

    // ── Lap / Skirt (horizontal thighs) ──
    g.add(mesh(bx(0.3, 0.1, 0.32), skirt, 0, seatY + 0.0, -0.14));

    // ── Lower legs (hanging down from seat edge) ──
    [-1, 1].forEach(s => {
        // Calf
        g.add(mesh(bx(0.06, 0.3, 0.06), skirt, s * 0.09, seatY - 0.2, -0.28));
        // Shoe
        g.add(mesh(bx(0.06, 0.04, 0.12), shoe, s * 0.09, seatY - 0.37, -0.26));
    });

    // Position the group: south side of desk, sitting in chair
    g.position.set(deskPos.x, 0, deskPos.z + 0.65);
    g.castShadow = true;
    scene.add(g);

    // Nameplate
    buildNameplate(scene, isAlpha, deskPos);
}

function buildNameplate(scene, isAlpha, position) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = isAlpha ? '#2c5282' : '#cc2244';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Inter, Arial, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(isAlpha ? 'SOPHIA — AI ALPHA' : 'YUKI — AI BETA', 128, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.14),
        new THREE.MeshStandardMaterial({ map: tex }));
    plate.position.set(position.x, 0.84, position.z + 0.56);
    scene.add(plate);
}

/* ═══════════════════════════════════════════
   ASSISTANT WORKSTATION
   Layout (all positions relative to group origin at desk center):

   NORTH (z = -0.55)  ← Desk back panel + Monitor (screen faces south)
   CENTER (z = 0)     ← Desk top surface
   SOUTH  (z = +0.55) ← Front panel + Keyboard + Chair + Character

   Character faces SOUTH (toward player)
   ═══════════════════════════════════════════ */

function buildAssistantWorkstation(scene, agentId, pos) {
    const isAlpha = agentId === 'alpha';
    const g = new THREE.Group();

    // ── Desk surface ──
    g.add(mesh(bx(2.4, 0.06, 1.1), M.deskTop, 0, 0.76, 0));

    // Back panel on NORTH side
    g.add(mesh(bx(2.4, 0.5, 0.04), M.desk, 0, 0.5, -0.53));
    // Side panels
    g.add(mesh(bx(0.04, 0.5, 1.06), M.desk, -1.18, 0.5, 0));
    g.add(mesh(bx(0.04, 0.5, 1.06), M.desk, 1.18, 0.5, 0));
    // Legs
    [[-1.1, -0.5], [-1.1, 0.5], [1.1, -0.5], [1.1, 0.5]].forEach(([lx, lz]) => {
        g.add(mesh(bx(0.04, 0.76, 0.04), M.leg, lx, 0.38, lz));
    });

    // ── Monitor on NORTH end of desk, screen faces SOUTH (toward assistant) ──
    g.add(mesh(bx(0.85, 0.5, 0.02), M.monitor, 0, 1.3, -0.3));    // monitor body
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.44),
        isAlpha ? M.screenA : M.screenB);
    scr.position.set(0, 1.3, -0.28);  // screen glows toward south (no rotation = faces +Z)
    g.add(scr);
    g.add(mesh(bx(0.05, 0.25, 0.05), M.monitor, 0, 0.93, -0.3));  // stand
    g.add(mesh(bx(0.22, 0.015, 0.14), M.monitor, 0, 0.795, -0.3)); // base

    // ── Keyboard + mouse on SOUTH end of desk (in front of assistant) ──
    g.add(mesh(bx(0.42, 0.012, 0.14), M.monitor, -0.05, 0.8, 0.2));
    g.add(mesh(bx(0.065, 0.01, 0.09), M.monitor, 0.35, 0.8, 0.2));

    // Coffee mug — south side within reach
    g.add(mesh(cy(0.03, 0.025, 0.07, 10), M.mug, isAlpha ? 0.85 : -0.85, 0.82, 0.15));

    // Papers + pen — south side
    g.add(mesh(bx(0.25, 0.004, 0.35), M.paper, isAlpha ? -0.7 : 0.7, 0.79, 0.1));
    g.add(mesh(bx(0.01, 0.008, 0.14), M.pen, isAlpha ? -0.5 : 0.5, 0.79, 0.25));

    // ── Chair — SOUTH side of desk, rotated 180° so backrest faces player ──
    const chair = buildChair();
    chair.position.set(0, 0, 0.65);  // south of desk center
    chair.rotation.y = Math.PI;      // Rotate 180° — backrest now faces south (player)
    g.add(chair);

    g.position.copy(pos);
    scene.add(g);
}

/* ═══════════════════════════════════════════
   EXTRA CO-WORKER WORKSTATION
   ═══════════════════════════════════════════ */

function buildExtraWorkstation(scene, x, z, rotation) {
    const g = new THREE.Group();

    // Simple desk
    g.add(mesh(bx(1.6, 0.06, 0.8), M.deskTop, 0, 0.76, 0));
    [[-0.7, -0.3], [-0.7, 0.3], [0.7, -0.3], [0.7, 0.3]].forEach(([lx, lz]) => {
        g.add(mesh(bx(0.04, 0.76, 0.04), M.leg, lx, 0.38, lz));
    });

    // Small monitor
    g.add(mesh(bx(0.55, 0.35, 0.02), M.monitor, 0, 1.15, -0.15));
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.28), M.screenGreen);
    scr.position.set(0, 1.15, -0.13); g.add(scr);
    g.add(mesh(bx(0.04, 0.18, 0.04), M.monitor, 0, 0.88, -0.15));
    g.add(mesh(bx(0.18, 0.015, 0.12), M.monitor, 0, 0.795, -0.15));

    // Keyboard
    g.add(mesh(bx(0.35, 0.01, 0.12), M.monitor, 0, 0.79, 0.1));
    g.add(mesh(bx(0.055, 0.008, 0.08), M.monitor, 0.3, 0.79, 0.1));

    // Coffee mug
    g.add(mesh(cy(0.025, 0.02, 0.06, 8), M.mug, 0.55, 0.82, 0));

    // Chair — rotated 180°
    const chair = buildChair();
    chair.position.set(0, 0, 0.6);
    chair.rotation.y = Math.PI;  // Rotate 180°
    g.add(chair);

    g.position.set(x, 0, z);
    g.rotation.y = rotation;
    scene.add(g);
}

/* ═══════════════════════════════════════════
   OFFICE CHAIR
   ═══════════════════════════════════════════ */

function buildChair() {
    const cg = new THREE.Group();
    cg.add(mesh(bx(0.48, 0.06, 0.48), M.leather, 0, 0.45, 0));
    cg.add(mesh(bx(0.48, 0.55, 0.04), M.leather, 0, 0.78, -0.24));
    cg.add(mesh(bx(0.3, 0.12, 0.04), M.leather, 0, 1.08, -0.24));
    [-1, 1].forEach(s => {
        cg.add(mesh(bx(0.04, 0.04, 0.35), M.metal, s * 0.24, 0.58, -0.04));
        cg.add(mesh(bx(0.04, 0.13, 0.04), M.metal, s * 0.24, 0.5, 0.15));
    });
    cg.add(mesh(cy(0.025, 0.025, 0.42), M.metal, 0, 0.22, 0));
    for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const leg = mesh(bx(0.025, 0.018, 0.24), M.metal,
            Math.sin(a) * 0.12, 0.018, Math.cos(a) * 0.12);
        leg.rotation.y = a; cg.add(leg);
        cg.add(mesh(sp(0.018), M.monitor, Math.sin(a) * 0.24, 0.018, Math.cos(a) * 0.24));
    }
    return cg;
}

/* ═══════════════════════════════════════════
   PLAYER DESK
   ═══════════════════════════════════════════ */

function buildPlayerDesk(scene) {
    const px = 0, pz = 5.5, w = 3.0, d = 1.2;
    addMesh(scene, bx(w, 0.06, d), M.deskDark, px, 0.76, pz, true);
    addMesh(scene, bx(w, 0.55, 0.04), M.deskDark, px, 0.48, pz + d / 2 - 0.02);
    addMesh(scene, bx(0.04, 0.55, d), M.deskDark, px - w / 2 + 0.02, 0.48, pz);
    addMesh(scene, bx(0.04, 0.55, d), M.deskDark, px + w / 2 - 0.02, 0.48, pz);
    [[-1.4, -0.5], [-1.4, 0.5], [1.4, -0.5], [1.4, 0.5]].forEach(([lx, lz]) => {
        addMesh(scene, bx(0.04, 0.76, 0.04), M.leg, px + lx, 0.38, pz + lz);
    });
    // Ultrawide monitor
    addMesh(scene, bx(1.0, 0.55, 0.02), M.monitor, px, 1.32, pz - 0.3);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.48), M.screenOff);
    scr.position.set(px, 1.32, pz - 0.285); scene.add(scr);
    addMesh(scene, bx(0.06, 0.28, 0.06), M.monitor, px, 0.94, pz - 0.3);
    addMesh(scene, bx(0.3, 0.015, 0.16), M.monitor, px, 0.795, pz - 0.3);
    // Keyboard + mouse
    addMesh(scene, bx(0.48, 0.012, 0.16), M.monitor, px - 0.05, 0.8, pz + 0.1);
    addMesh(scene, bx(0.065, 0.01, 0.1), M.monitor, px + 0.4, 0.8, pz + 0.1);
    // Phone
    addMesh(scene, bx(0.08, 0.04, 0.16), M.monitor, px + 1.1, 0.8, pz - 0.2);
    // Coffee
    const mug = new THREE.Mesh(cy(0.035, 0.03, 0.08, 10), M.mug);
    mug.position.set(px - 1.0, 0.82, pz + 0.2); scene.add(mug);
    addMesh(scene, bx(0.28, 0.008, 0.38), M.paper, px - 0.8, 0.79, pz - 0.1);

    // Player chair
    const pc = buildChair();
    pc.position.set(px, 0, pz + 0.85);
    pc.rotation.y = Math.PI;
    scene.add(pc);
}

/* ═══════════════════════════════════════════
   ROOM STRUCTURE
   ═══════════════════════════════════════════ */

function buildRoom(scene) {
    const wh = 5, wt = 0.2;
    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), M.floor);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    // Walls
    addMesh(scene, bx(20, wh, wt), M.wall, 0, wh / 2, -8, true);   // North
    addMesh(scene, bx(7, wh, wt), M.wall, -6.5, wh / 2, 8, true);  // South left
    addMesh(scene, bx(7, wh, wt), M.wall, 6.5, wh / 2, 8, true);   // South right
    addMesh(scene, bx(6, 1.5, wt), M.wall, 0, wh - 0.75, 8);       // South top
    addMesh(scene, bx(wt, wh, 16), M.wall, -10, wh / 2, 0, true);  // West
    addMesh(scene, bx(wt, wh, 16), M.wall, 10, wh / 2, 0, true);   // East
    // Ceiling
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), M.ceil);
    ceil.rotation.x = Math.PI / 2; ceil.position.y = wh; scene.add(ceil);
    // Baseboards
    addMesh(scene, bx(20, 0.12, 0.05), M.baseboard, 0, 0.06, -7.88);
    addMesh(scene, bx(0.05, 0.12, 16), M.baseboard, -9.88, 0.06, 0);
    addMesh(scene, bx(0.05, 0.12, 16), M.baseboard, 9.88, 0.06, 0);
}

/* ═══════════════════════════════════════════
   WINDOWS
   ═══════════════════════════════════════════ */

function buildWindows(scene) {
    for (let i = 0; i < 3; i++) {
        const x = -6 + i * 6;
        addMesh(scene, new THREE.PlaneGeometry(2.4, 1.8), M.skyGlow, x, 3, -7.86);
        addMesh(scene, new THREE.PlaneGeometry(2.4, 1.8), M.glass, x, 3, -7.83);
        // Frame — top, bottom, left, right only (no center divider)
        addMesh(scene, bx(2.5, 0.05, 0.05), M.wFrame, x, 3.92, -7.8);  // top
        addMesh(scene, bx(2.5, 0.05, 0.05), M.wFrame, x, 2.08, -7.8);  // bottom
        addMesh(scene, bx(0.05, 1.9, 0.05), M.wFrame, x - 1.22, 3, -7.8); // left
        addMesh(scene, bx(0.05, 1.9, 0.05), M.wFrame, x + 1.22, 3, -7.8); // right
        // Window sill
        addMesh(scene, bx(2.6, 0.04, 0.15), M.wFrame, x, 2.06, -7.72);
    }
}

/* ═══════════════════════════════════════════
   DOORS
   ═══════════════════════════════════════════ */

function buildDoors(scene) {
    // Main entrance door (south wall, center gap)
    buildDoor(scene, 0, 8.1, 0);
    // Side room door (west wall)
    buildDoor(scene, -10.1, 4, Math.PI / 2);
}

function buildDoor(scene, x, z, rotY) {
    const g = new THREE.Group();
    // Door panel
    g.add(mesh(bx(1.0, 2.2, 0.06), M.door, 0, 1.1, 0));
    // Door frame
    g.add(mesh(bx(0.08, 2.3, 0.1), M.doorFrame, -0.54, 1.15, 0));
    g.add(mesh(bx(0.08, 2.3, 0.1), M.doorFrame, 0.54, 1.15, 0));
    g.add(mesh(bx(1.16, 0.08, 0.1), M.doorFrame, 0, 2.3, 0));
    // Handle
    g.add(mesh(cy(0.015, 0.015, 0.12, 8), M.doorHandle, 0.35, 1.0, 0.06));
    // Lock plate
    g.add(mesh(bx(0.04, 0.12, 0.02), M.doorHandle, 0.35, 1.0, 0.04));
    // Small window in door removed as requested (windows up the door)

    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    scene.add(g);
}

/* ═══════════════════════════════════════════
   FILING CABINETS
   ═══════════════════════════════════════════ */

function buildFilingCabinets(scene) {
    [[9.3, -6], [9.3, -5], [9.3, 5], [9.3, 6]].forEach(([x, z]) => {
        const g = new THREE.Group();
        g.add(mesh(bx(0.5, 1.2, 0.55), M.cabinet, 0, 0.6, 0));
        // Drawers
        for (let i = 0; i < 3; i++) {
            g.add(mesh(bx(0.44, 0.02, 0.01), M.cabinetDark, 0, 0.25 + i * 0.38, 0.27));
            g.add(mesh(cy(0.008, 0.008, 0.06, 6), M.metal, 0, 0.25 + i * 0.38, 0.29));
        }
        g.position.set(x, 0, z);
        scene.add(g);
    });
}

/* ═══════════════════════════════════════════
   WATER COOLER
   ═══════════════════════════════════════════ */

function buildWaterCooler(scene) {
    const x = -9.2, z = 3;
    const g = new THREE.Group();
    // Body
    g.add(mesh(bx(0.35, 1.0, 0.35), M.waterCooler, 0, 0.5, 0));
    // Water jug (inverted bottle)
    g.add(mesh(cy(0.1, 0.12, 0.4, 12), M.waterBlue, 0, 1.2, 0));
    g.add(mesh(cy(0.04, 0.1, 0.1, 10), M.waterCooler, 0, 0.95, 0));
    // Tap area
    g.add(mesh(bx(0.06, 0.04, 0.08), M.metal, 0.1, 0.7, 0.2));
    // Cup holder
    g.add(mesh(cy(0.08, 0.08, 0.02, 8), M.metal, 0.12, 0.55, 0.2));
    g.position.set(x, 0, z);
    scene.add(g);
}

/* ═══════════════════════════════════════════
   CEILING LIGHTS
   ═══════════════════════════════════════════ */

function buildCeilingLights(scene) {
    [[-4, -3], [4, -3], [-4, 3], [4, 3], [0, 0]].forEach(([x, z]) => {
        // Rectangular ceiling panel light
        const lightPanel = mesh(bx(1.2, 0.04, 0.6), M.lampLight, x, 4.96, z);
        scene.add(lightPanel);
        // Frame
        scene.add(mesh(bx(1.3, 0.06, 0.02), M.metal, x, 4.96, z - 0.31));
        scene.add(mesh(bx(1.3, 0.06, 0.02), M.metal, x, 4.96, z + 0.31));
        scene.add(mesh(bx(0.02, 0.06, 0.62), M.metal, x - 0.65, 4.96, z));
        scene.add(mesh(bx(0.02, 0.06, 0.62), M.metal, x + 0.65, 4.96, z));
    });
}

/* ═══════════════════════════════════════════
   COAT RACK
   ═══════════════════════════════════════════ */

function buildCoatRack(scene) {
    const x = -9.2, z = -7;
    // Pole
    scene.add(mesh(cy(0.025, 0.04, 1.6, 8), M.coatRack, x, 0.8, z));
    // Base
    scene.add(mesh(cy(0.2, 0.2, 0.03, 6), M.coatRack, x, 0.015, z));
    // Hooks
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        scene.add(mesh(cy(0.01, 0.01, 0.12, 4), M.metal,
            x + Math.sin(a) * 0.08, 1.55, z + Math.cos(a) * 0.08));
    }
    // A jacket hanging
    scene.add(mesh(bx(0.2, 0.35, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 }),
        x + 0.08, 1.35, z));
}

/* ═══════════════════════════════════════════
   BOOKSHELF
   ═══════════════════════════════════════════ */

function buildBookshelf(scene) {
    const bx2 = -9.5, bz = -4;
    addMesh(scene, bx(0.08, 2.2, 0.8), M.shelf, bx2, 1.1, bz);
    [0.3, 0.8, 1.3, 1.8].forEach(y =>
        addMesh(scene, bx(0.55, 0.03, 0.75), M.shelf, bx2 + 0.24, y, bz));
    [0.35, 0.85, 1.35].forEach(y => {
        for (let i = 0; i < 5; i++) {
            const h = 0.18 + Math.random() * 0.18;
            addMesh(scene, bx(0.06, h, 0.38 + Math.random() * 0.1), M.bookColors[i],
                bx2 + 0.15 + i * 0.08, y + h / 2 + 0.02, bz);
        }
    });
}

/* ═══════════════════════════════════════════
   WHITEBOARD
   ═══════════════════════════════════════════ */

function buildWhiteboard(scene) {
    const wx = 9.85, wz = -3;
    addMesh(scene, bx(0.04, 1.2, 2.0), M.wbBoard, wx, 2.5, wz);
    addMesh(scene, bx(0.05, 0.03, 2.06), M.wbFrame, wx, 3.12, wz);
    addMesh(scene, bx(0.05, 0.03, 2.06), M.wbFrame, wx, 1.88, wz);
    addMesh(scene, bx(0.05, 1.28, 0.03), M.wbFrame, wx, 2.5, wz - 1.01);
    addMesh(scene, bx(0.05, 1.28, 0.03), M.wbFrame, wx, 2.5, wz + 1.01);
    addMesh(scene, bx(0.08, 0.02, 0.35), M.wbFrame, wx - 0.02, 1.92, wz);
    // Marker pens on tray
    [0xcc2244, 0x2244cc, 0x22aa44].forEach((c, i) => {
        scene.add(mesh(cy(0.006, 0.006, 0.12, 4),
            new THREE.MeshStandardMaterial({ color: c }), wx - 0.02, 1.94, wz - 0.05 + i * 0.05));
    });
}

/* ═══════════════════════════════════════════
   PLANTS
   ═══════════════════════════════════════════ */

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



function buildClock(scene) {
    const cf = new THREE.Mesh(cy(0.2, 0.2, 0.025, 28),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));
    cf.rotation.z = Math.PI / 2; cf.position.set(9.86, 3.5, 0); scene.add(cf);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.015, 8, 28), M.wbFrame);
    ring.rotation.z = Math.PI / 2; ring.position.set(9.86, 3.5, 0); scene.add(ring);
    // Hour hand
    scene.add(mesh(bx(0.008, 0.1, 0.005),
        new THREE.MeshStandardMaterial({ color: 0x222222 }), 9.86, 3.5, 0.02));
    // Minute hand
    const minHand = mesh(bx(0.005, 0.13, 0.005),
        new THREE.MeshStandardMaterial({ color: 0x333333 }), 9.86, 3.5, 0.025);
    minHand.rotation.x = 0.5;
    scene.add(minHand);
}

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

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
