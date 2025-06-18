"use strict";
/**
 * Event types used for communication between components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTypes = void 0;
// Event types constants
exports.EventTypes = {
    // UI Events
    UI_GENERATE_DOCS_REQUESTED: 'ui:generate-docs-requested',
    UI_ANALYZE_BUGS_REQUESTED: 'ui:analyze-bugs-requested',
    UI_SAVE_PROMPT_REQUESTED: 'ui:save-prompt-requested',
    UI_DELETE_PROMPT_REQUESTED: 'ui:delete-prompt-requested',
    UI_PROMPT_SELECTED: 'ui:prompt-selected',
    UI_MODEL_SELECTED: 'ui:model-selected',
    UI_API_URL_CHANGED: 'ui:api-url-changed', // Added this event type
    // Logic Events
    LOGIC_PROCESSING_STARTED: 'logic:processing-started',
    LOGIC_PROCESSING_COMPLETED: 'logic:processing-completed',
    LOGIC_PROCESSING_FAILED: 'logic:processing-failed',
    LOGIC_PROMPT_SAVED: 'logic:prompt-saved',
    LOGIC_PROMPT_DELETED: 'logic:prompt-deleted',
    LOGIC_CONFIG_UPDATED: 'logic:config-updated',
    // Model Events
    MODEL_DATA_LOADED: 'model:data-loaded',
    MODEL_STORAGE_UPDATED: 'model:storage-updated',
    MODEL_API_ERROR: 'model:api-error',
    // General Events
    STATUS_UPDATED: 'status:updated',
    FILE_STATUS_UPDATED: 'file:status-updated'
};
//# sourceMappingURL=eventTypes.js.map