import * as THREE from 'three';
import { setupLighting } from './lighting.js';
import { PlayerController } from './player.js';
import { buildOffice, AGENT_POSITIONS, getAnimationMixers } from './office.js';
import { ProximitySystem } from './proximity.js';
import { DashboardUI } from './chatUI.js';
import { TaskBoardManager } from './taskBoard.js';
import { sendMessage } from './aiAPI.js';
import { PauseMenu } from './pauseMenu.js';

/**
 * ============================================
 * MAIN — Corporate Office Simulator
 * ============================================
 */

// ── Scene ──
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd4e6f1);  // Bright sky blue
scene.fog = new THREE.FogExp2(0xd4e6f1, 0.02);

// ── Camera ──
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 80);

// ── Renderer (optimized) ──
const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;

// ── Lighting ──
setupLighting(scene);

// ── Office ──
const officeData = buildOffice(scene);

// ── Player ──
const player = new PlayerController(camera, canvas);

// ── Proximity ──
const proximity = new ProximitySystem(camera);

// ── Dashboard UI ──
const dashboard = new DashboardUI();

// ── Task Board ──
const taskBoard = new TaskBoardManager();

// ── Pause Menu ──
const pauseMenu = new PauseMenu(player);

// ── Wire Proximity → Dashboard ──
proximity.on('enterProximity', ({ agentId }) => {
    if (!dashboard.isOpen && !pauseMenu.isOpen) {
        dashboard.showHint(agentId);
    }
});

proximity.on('exitProximity', ({ agentId }) => {
    dashboard.hideHint(agentId);
    if (dashboard.isOpen && dashboard.activeAgent === agentId) {
        dashboard.close();
    }
});

// ── Wire Chat Send → AI API ──
dashboard.onSendMessage = async (agentId, message) => {
    try {
        const history = dashboard.messageHistory[agentId].slice(-10);
        const result = await sendMessage(agentId, message, history);
        dashboard.addMessage(agentId, 'agent', result.response);

        if (result.taskAction) {
            if (result.taskAction.type === 'add') {
                taskBoard.addTask(agentId, result.taskAction.text);
                dashboard.addSystemMessage(agentId, `📋 Task added: "${result.taskAction.text}"`);
                dashboard.updateTaskList(taskBoard.getTasks(agentId));
            } else if (result.taskAction.type === 'reject') {
                taskBoard.rejectTask(agentId, result.taskAction.reason);
                dashboard.addSystemMessage(agentId, `🚫 Rejected: ${result.taskAction.reason}`, true);
            }
        }
    } catch (err) {
        console.error('[Main] AI error:', err);
        dashboard.addSystemMessage(agentId, '❌ Communication error. Try again.', true);
    }
};

// ── Wire Task Creation → AI Analysis ──
dashboard.onCreateTask = async (agentId, description, priority) => {
    try {
        const taskMessage = `[TASK REQUEST - Priority: ${priority.toUpperCase()}] ${description}`;
        const result = await sendMessage(agentId, taskMessage);

        if (result.taskAction && result.taskAction.type === 'add') {
            taskBoard.addTask(agentId, result.taskAction.text);
            dashboard.showTaskFeedback('accepted', `✓ Task accepted and added to board: "${result.taskAction.text}"`);
            dashboard.addMessage(agentId, 'agent', result.response);
            dashboard.updateTaskList(taskBoard.getTasks(agentId));
        } else if (result.taskAction && result.taskAction.type === 'reject') {
            taskBoard.rejectTask(agentId, result.taskAction.reason);
            dashboard.showTaskFeedback('rejected', `✕ Task rejected: ${result.taskAction.reason}`);
            dashboard.addMessage(agentId, 'agent', result.response);
        } else {
            dashboard.showTaskFeedback('rejected', `Agent responded but didn't add the task. Try rephrasing with action words like "draft", "schedule", "prepare".`);
            dashboard.addMessage(agentId, 'agent', result.response);
        }
    } catch (err) {
        console.error('[Main] Task creation error:', err);
        dashboard.showTaskFeedback('rejected', '❌ Communication error. Please try again.');
    }
};

// ── ESC key handling ──
document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
        if (dashboard.isOpen) {
            dashboard.close();
        } else if (player.isLocked || pauseMenu.isOpen) {
            pauseMenu.toggle();
        }
    }
});

// ── Start Button ──
document.getElementById('start-btn')?.addEventListener('click', () => player.lock());

// ── Resize ──
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Animation Loop ──
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    player.update(delta);
    proximity.update();

    // Update character animations
    const mixers = getAnimationMixers();
    for (const mixer of mixers) {
        mixer.update(delta);
    }

    renderer.render(scene, camera);
}

animate();
