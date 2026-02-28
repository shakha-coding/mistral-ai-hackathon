/**
 * ============================================
 * TASK BOARD STATE MANAGEMENT
 * Manages task lists per agent (no 3D boards)
 * ============================================
 */

export class TaskBoardManager {
    constructor() {
        this.tasks = { alpha: [], beta: [] };
        this.nextId = 1;
    }

    addTask(agentId, taskText, status = 'TODO') {
        const task = {
            id: this.nextId++,
            text: taskText,
            status,
            priority: 'medium',
            createdAt: Date.now(),
        };
        this.tasks[agentId].push(task);
        this._showFlash('success', `✓ Task assigned: "${taskText}"`);
        return task;
    }

    moveTask(agentId, taskId, newStatus) {
        const task = this.tasks[agentId].find(t => t.id === taskId);
        if (task) task.status = newStatus;
    }

    rejectTask(agentId, reason) {
        this._showFlash('denied', `⛔ ACCESS DENIED: ${reason}`);
    }

    getTasks(agentId) {
        return this.tasks[agentId] || [];
    }

    _showFlash(type, message) {
        const existing = document.querySelector('.task-flash');
        if (existing) existing.remove();
        const flash = document.createElement('div');
        flash.className = `task-flash ${type}`;
        flash.textContent = message;
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 1500);
    }
}
