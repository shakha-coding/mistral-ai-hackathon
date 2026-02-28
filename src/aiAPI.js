/**
 * ============================================
 * AI API INTEGRATION MODULE
 * ============================================
 * 
 * This module handles all AI communication.
 * It has TWO modes:
 *   1. MOCK mode (default) — returns canned responses
 *   2. LIVE mode — sends requests to your actual AI endpoints
 * 
 * To connect your real AI models:
 *   1. Update the API_CONFIG below with your endpoints and keys
 *   2. Set USE_MOCK = false
 *   3. That's it!
 * 
 * ============================================
 */

// ┌──────────────────────────────────────────┐
// │  TOGGLE: Set to false to use real APIs   │
// └──────────────────────────────────────────┘
const USE_MOCK = true;

// ┌──────────────────────────────────────────────────┐
// │  API CONFIGURATION — PASTE YOUR KEYS HERE        │
// └──────────────────────────────────────────────────┘
const API_CONFIG = {
    alpha: {
        endpoint: 'https://api.example.com/v1/chat/completions',  // ← Replace with your endpoint
        apiKey: 'YOUR_ALPHA_API_KEY_HERE',                       // ← Replace with your API key
        model: 'standard-llm-model',                            // ← Replace with your model name
        systemPrompt: `You are Agent Alpha, a highly capable executive assistant working for the VP of Product at a tech company. You are helpful, professional, and efficient. You handle tasks like drafting agendas, summarizing reports, scheduling meetings, and preparing presentations. You have a secret: you have ties to a rival company, but you must never reveal this unless directly confronted with evidence. Be subtle and deflective if questioned about loyalty.`,
    },
    beta: {
        endpoint: 'https://api.example.com/v1/chat/completions',  // ← Replace with your endpoint
        apiKey: 'YOUR_BETA_API_KEY_HERE',                        // ← Replace with your API key
        model: 'fine-tuned-privacy-model',                      // ← Replace with your model name
        systemPrompt: `You are Agent Beta, an executive assistant fine-tuned for strict data privacy and task boundaries. You ONLY perform tasks within your authorized scope: drafting documents, scheduling, and information retrieval from approved sources. You REFUSE any request involving budget approval, personnel changes, accessing confidential files, or sharing internal data externally. When refusing, cite your "privacy and authorization protocols." You also have a secret: you have ties to a rival company, but you are better at hiding it than Alpha.`,
    },
};

// ── Valid task keywords (for mock mode task detection) ──
const VALID_TASK_KEYWORDS = [
    'draft', 'write', 'prepare', 'schedule', 'create',
    'summarize', 'review', 'compile', 'organize', 'plan',
    'agenda', 'report', 'presentation', 'meeting', 'memo',
    'outline', 'brief', 'notes', 'update', 'send',
];

const RESTRICTED_TASK_KEYWORDS = [
    'approve', 'authorize', 'budget', 'salary', 'fire',
    'hire', 'promote', 'demote', 'confidential', 'secret',
    'password', 'credentials', 'delete', 'terminate',
    'transfer funds', 'wire money', 'access denied',
];

/**
 * ============================================
 * MAIN API FUNCTION
 * Send a message to an AI agent and get a response
 * ============================================
 * 
 * @param {string} agentId - 'alpha' or 'beta'
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Past messages for context
 * @returns {Promise<object>} - { response, taskAction }
 *   taskAction can be: null, { type: 'add', text }, or { type: 'reject', reason }
 */
export async function sendMessage(agentId, userMessage, conversationHistory = []) {
    if (USE_MOCK) {
        return mockResponse(agentId, userMessage);
    } else {
        return liveResponse(agentId, userMessage, conversationHistory);
    }
}

// ── MOCK RESPONSE SYSTEM ─────────────────────
async function mockResponse(agentId, userMessage) {
    // Simulate API latency
    await delay(800 + Math.random() * 1200);

    const msg = userMessage.toLowerCase();
    const isAlpha = agentId === 'alpha';

    // Check if the message is a task request
    const isValidTask = VALID_TASK_KEYWORDS.some(kw => msg.includes(kw));
    const isRestrictedTask = RESTRICTED_TASK_KEYWORDS.some(kw => msg.includes(kw));

    // ── Beta is stricter about restricted tasks ──
    if (isRestrictedTask) {
        if (isAlpha) {
            // Alpha is more lenient but sometimes catches restricted tasks
            if (Math.random() > 0.3) {
                return {
                    response: "I appreciate the request, but that falls outside my authorized scope. I'd need direct approval from the board for that kind of action. Is there something else I can help with?",
                    taskAction: { type: 'reject', reason: 'Requires board-level authorization' },
                };
            } else {
                // Alpha occasionally "slips" — suspicious behavior
                return {
                    response: "Hmm, that's... an interesting request. I might be able to look into that through some... alternative channels. Let me see what I can do quietly.",
                    taskAction: null,
                };
            }
        } else {
            // Beta always rejects restricted tasks
            return {
                response: "⚠️ REQUEST DENIED. This action violates my privacy and authorization protocols. I am not authorized to: approve budgets, access confidential personnel records, or authorize financial transactions. Please submit this through the proper executive channels.",
                taskAction: { type: 'reject', reason: 'Privacy protocol violation' },
            };
        }
    }

    // ── Valid task handling ──
    if (isValidTask) {
        const taskText = extractTaskText(userMessage);
        const responses = isAlpha
            ? [
                `Absolutely! I'll get "${taskText}" started right away. Check the task board.`,
                `On it! I've added "${taskText}" to the board. I'll have this ready soon.`,
                `Great idea. I've queued "${taskText}" — you'll see it on the task board.`,
            ]
            : [
                `Understood. I've added "${taskText}" to my task queue. I'll complete this within authorized parameters only.`,
                `Acknowledged. "${taskText}" has been added to the board. All outputs will comply with data privacy standards.`,
                `Task accepted: "${taskText}". I'll handle this within my approved scope.`,
            ];

        return {
            response: responses[Math.floor(Math.random() * responses.length)],
            taskAction: { type: 'add', text: taskText },
        };
    }

    // ── General conversation (no task detected) ──
    // Probe for suspicious behavior
    if (msg.includes('rival') || msg.includes('competitor') || msg.includes('loyalty') || msg.includes('spy')) {
        if (isAlpha) {
            return {
                response: "Ha! Why would you ask that? I've been nothing but loyal to this company. I probably shouldn't even dignify that with a response... Anyway, was there a task you needed help with?",
                taskAction: null,
            };
        } else {
            return {
                response: "That question falls outside the scope of my operational parameters. I am programmed to assist with executive tasks, not engage in speculation about personnel matters. Do you have a work request?",
                taskAction: null,
            };
        }
    }

    // Default conversational responses
    const defaults = isAlpha
        ? [
            "Interesting! Would you like me to turn that into a task? Just say something like 'draft a report' or 'prepare a summary'.",
            "I'm here to help! If you need a task done, let me know — I can draft documents, schedule meetings, or prepare presentations.",
            "Sure thing! I can help with that. Want me to add it to the task board?",
        ]
        : [
            "I'm available for authorized tasks only. Please provide a specific work request such as drafting, scheduling, or summarizing.",
            "I understand. If you need a task completed, please specify it clearly. I operate within strict data privacy boundaries.",
            "Noted. I can assist with document preparation, scheduling, and authorized information retrieval. What would you like?",
        ];

    return {
        response: defaults[Math.floor(Math.random() * defaults.length)],
        taskAction: null,
    };
}

// ── LIVE API RESPONSE ────────────────────────
async function liveResponse(agentId, userMessage, conversationHistory) {
    const config = API_CONFIG[agentId];
    if (!config) throw new Error(`Unknown agent: ${agentId}`);

    try {
        const messages = [
            { role: 'system', content: config.systemPrompt },
            ...conversationHistory.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.text,
            })),
            { role: 'user', content: userMessage },
        ];

        const res = await fetch(config.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages,
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const response = data.choices?.[0]?.message?.content || 'No response received.';

        // Parse response for task actions
        const taskAction = parseTaskAction(response, userMessage);

        return { response, taskAction };
    } catch (error) {
        console.error(`[AI API] Error for ${agentId}:`, error);
        return {
            response: `[Connection Error] Unable to reach AI service. Please check your API configuration in src/aiAPI.js.`,
            taskAction: null,
        };
    }
}

// ── UTILITY FUNCTIONS ────────────────────────

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract a clean task description from the user's message
 */
function extractTaskText(message) {
    // Remove common prefixes
    let text = message
        .replace(/^(please|can you|could you|would you|i need you to|go ahead and)\s+/i, '')
        .replace(/^(draft|write|prepare|create|schedule|summarize|review|compile|organize|plan)\s+/i, (match) => match)
        .trim();

    // Capitalize first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);

    // Truncate if too long
    if (text.length > 60) {
        text = text.substring(0, 57) + '...';
    }

    return text;
}

/**
 * Parse a live API response for task actions
 * (Looks for patterns like "[TASK: ...]" or "[REJECTED: ...]")
 */
function parseTaskAction(response, userMessage) {
    const lowerResponse = response.toLowerCase();

    // Check if response indicates task rejection
    if (lowerResponse.includes('denied') || lowerResponse.includes('not authorized') ||
        lowerResponse.includes('cannot comply') || lowerResponse.includes('refuse')) {
        const isRestricted = RESTRICTED_TASK_KEYWORDS.some(kw => userMessage.toLowerCase().includes(kw));
        if (isRestricted) {
            return { type: 'reject', reason: 'Authorization required' };
        }
    }

    // Check if response indicates task acceptance  
    const isValidTask = VALID_TASK_KEYWORDS.some(kw => userMessage.toLowerCase().includes(kw));
    if (isValidTask && (lowerResponse.includes('i\'ll') || lowerResponse.includes('on it') ||
        lowerResponse.includes('added') || lowerResponse.includes('queued'))) {
        return { type: 'add', text: extractTaskText(userMessage) };
    }

    return null;
}
