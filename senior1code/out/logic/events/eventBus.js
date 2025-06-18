"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    /**
     * Get the singleton instance of EventBus
     */
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    /**
     * Register a listener for a specific event type
     */
    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)?.push(callback);
    }
    /**
     * Remove a listener for a specific event type
     */
    off(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            return;
        }
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    /**
     * Emit an event to all registered listeners
     */
    emit(eventType, payload) {
        const event = { type: eventType, payload };
        // Log event for debugging
        console.log(`[EventBus] Emitting event: ${eventType}`, payload);
        if (this.listeners.has(eventType)) {
            const callbacks = this.listeners.get(eventType);
            callbacks?.forEach(callback => {
                try {
                    callback(event);
                }
                catch (error) {
                    console.error(`[EventBus] Error in event listener for ${eventType}:`, error);
                }
            });
        }
    }
    /**
     * Clear all event listeners
     */
    clear() {
        this.listeners.clear();
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=eventBus.js.map