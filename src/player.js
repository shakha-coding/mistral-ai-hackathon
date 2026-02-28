import * as THREE from 'three';

/**
 * Smooth first-person controller.
 * Features: acceleration curves, head bob, momentum.
 */

const WALK_SPEED = 2.5;
const SPRINT_SPEED = 4.0;
const ACCEL = 12.0;          // How fast you reach max speed
const DECEL = 8.0;           // How fast you stop
const MOUSE_SENSITIVITY = 0.0015;
const HEAD_BOB_FREQ = 8.0;   // Steps per second
const HEAD_BOB_AMP = 0.018;  // Subtle vertical bob

const BOUNDS = {
    minX: -9.5, maxX: 9.5,
    minZ: -7.5, maxZ: 7.5,
};

const PLAYER_HEIGHT = 1.7;

export class PlayerController {
    constructor(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.sprinting = false;

        this.velocity = new THREE.Vector3();
        this.targetVelocity = new THREE.Vector3();
        this.isLocked = false;
        this.paused = false;

        // Head bob state
        this._bobPhase = 0;
        this._isMoving = false;

        // Reusable vectors
        this._forward = new THREE.Vector3();
        this._right = new THREE.Vector3();
        this._up = new THREE.Vector3(0, 1, 0);
        this._moveDir = new THREE.Vector3();

        this.camera.position.set(0, PLAYER_HEIGHT, 6);

        this._initPointerLock();
        this._initKeyboard();
    }

    _initPointerLock() {
        this.canvas.addEventListener('click', () => {
            if (!this.isLocked) this.canvas.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === this.canvas;
            const crosshair = document.getElementById('crosshair');
            const overlay = document.getElementById('start-overlay');
            if (this.isLocked) {
                crosshair?.classList.add('active');
                overlay?.classList.add('hidden');
            } else {
                crosshair?.classList.remove('active');
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isLocked || this.paused) return;
            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= e.movementX * MOUSE_SENSITIVITY;
            this.euler.x -= e.movementY * MOUSE_SENSITIVITY;
            this.euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        });
    }

    _initKeyboard() {
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': this.moveForward = true; break;
                case 'KeyS': case 'ArrowDown': this.moveBackward = true; break;
                case 'KeyA': case 'ArrowLeft': this.moveLeft = true; break;
                case 'KeyD': case 'ArrowRight': this.moveRight = true; break;
                case 'ShiftLeft': case 'ShiftRight': this.sprinting = true; break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW': case 'ArrowUp': this.moveForward = false; break;
                case 'KeyS': case 'ArrowDown': this.moveBackward = false; break;
                case 'KeyA': case 'ArrowLeft': this.moveLeft = false; break;
                case 'KeyD': case 'ArrowRight': this.moveRight = false; break;
                case 'ShiftLeft': case 'ShiftRight': this.sprinting = false; break;
            }
        });
    }

    update(delta) {
        if (!this.isLocked || this.paused) return;

        // Compute desired direction in world space
        this.camera.getWorldDirection(this._forward);
        this._forward.y = 0;
        this._forward.normalize();
        this._right.crossVectors(this._forward, this._up).normalize();

        const inputZ = Number(this.moveForward) - Number(this.moveBackward);
        const inputX = Number(this.moveRight) - Number(this.moveLeft);

        const speed = this.sprinting ? SPRINT_SPEED : WALK_SPEED;

        // Target velocity in world space
        this._moveDir.set(0, 0, 0);
        if (inputZ !== 0 || inputX !== 0) {
            this._moveDir.addScaledVector(this._forward, inputZ);
            this._moveDir.addScaledVector(this._right, inputX);
            this._moveDir.normalize().multiplyScalar(speed);
        }

        // Smooth interpolation toward target (acceleration/deceleration)
        const hasInput = inputZ !== 0 || inputX !== 0;
        const lerpFactor = hasInput ? ACCEL : DECEL;
        this.velocity.x += (this._moveDir.x - this.velocity.x) * Math.min(lerpFactor * delta, 1);
        this.velocity.z += (this._moveDir.z - this.velocity.z) * Math.min(lerpFactor * delta, 1);

        // Apply movement
        this.camera.position.x += this.velocity.x * delta;
        this.camera.position.z += this.velocity.z * delta;

        // Head bob
        const currentSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
        this._isMoving = currentSpeed > 0.3;

        if (this._isMoving) {
            this._bobPhase += delta * HEAD_BOB_FREQ * (currentSpeed / WALK_SPEED);
            const bobOffset = Math.sin(this._bobPhase * Math.PI * 2) * HEAD_BOB_AMP * (currentSpeed / WALK_SPEED);
            this.camera.position.y = PLAYER_HEIGHT + bobOffset;
        } else {
            // Smoothly return to neutral height
            this.camera.position.y += (PLAYER_HEIGHT - this.camera.position.y) * Math.min(8 * delta, 1);
            this._bobPhase = 0;
        }

        // Bounds clamping
        this.camera.position.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, this.camera.position.x));
        this.camera.position.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, this.camera.position.z));
    }

    lock() {
        this.canvas.requestPointerLock();
    }

    unlock() {
        document.exitPointerLock();
    }
}
