import * as THREE from 'three';
import { AGENT_POSITIONS } from './office.js';

/**
 * ============================================
 * PROXIMITY DETECTION SYSTEM
 * Checks player distance to each agent desk
 * and emits enter/exit events
 * ============================================
 */

const INTERACTION_RADIUS = 4.5;  // Increased from 3.5 for more lenient interaction
const CHAT_RADIUS = 2.5;         // Closer radius for auto-showing hint

export class ProximitySystem {
    constructor(camera) {
        this.camera = camera;
        this.nearestAgent = null;
        this.isInRange = {};  // { alpha: false, beta: false }

        // Event listeners
        this._listeners = {
            enterProximity: [],
            exitProximity: [],
        };

        // Initialize range state
        Object.keys(AGENT_POSITIONS).forEach(id => {
            this.isInRange[id] = false;
        });
    }

    /**
     * Register an event listener
     */
    on(event, callback) {
        if (this._listeners[event]) {
            this._listeners[event].push(callback);
        }
    }

    /**
     * Emit an event to all registered listeners
     */
    _emit(event, data) {
        if (this._listeners[event]) {
            this._listeners[event].forEach(cb => cb(data));
        }
    }

    /**
     * Called every frame — checks distances and emits events
     */
    update() {
        const playerPos = this.camera.position;
        let closestId = null;
        let closestDist = Infinity;

        Object.entries(AGENT_POSITIONS).forEach(([agentId, agentPos]) => {
            // Calculate horizontal distance only (ignore Y)
            const dx = playerPos.x - agentPos.x;
            const dz = playerPos.z - agentPos.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            const wasInRange = this.isInRange[agentId];
            const nowInRange = distance < INTERACTION_RADIUS;

            if (nowInRange && !wasInRange) {
                this.isInRange[agentId] = true;
                this._emit('enterProximity', { agentId, distance });
            } else if (!nowInRange && wasInRange) {
                this.isInRange[agentId] = false;
                this._emit('exitProximity', { agentId, distance });
            }

            if (distance < closestDist) {
                closestDist = distance;
                closestId = agentId;
            }
        });

        this.nearestAgent = closestDist < INTERACTION_RADIUS ? closestId : null;
    }

    /**
     * Get the agent the player is closest to (if within range)
     */
    getNearestAgent() {
        return this.nearestAgent;
    }

    /**
     * Check if player is near a specific agent
     */
    isNear(agentId) {
        return this.isInRange[agentId] || false;
    }
}
