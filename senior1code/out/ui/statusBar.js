"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBarManager = void 0;
/**
 * Status bar integration to show AI assistant status
 */
const vscode = __importStar(require("vscode"));
const eventBus_1 = require("../logic/events/eventBus");
const eventTypes_1 = require("../logic/events/eventTypes");
class StatusBarManager {
    constructor() {
        this.isProcessing = false;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.text = '$(hubot) AI Assistant';
        this.statusBarItem.tooltip = 'AI Code Assistant';
        this.statusBarItem.command = 'aiAssistant.openSidebar';
        this.statusBarItem.show();
        this.eventBus = eventBus_1.EventBus.getInstance();
        this.setupEventListeners();
    }
    /**
     * Set up event listeners for status updates
     */
    setupEventListeners() {
        this.eventBus.on(eventTypes_1.EventTypes.LOGIC_PROCESSING_STARTED, (event) => {
            const payload = event.payload;
            this.setProcessingStatus(payload.operationType);
        });
        this.eventBus.on(eventTypes_1.EventTypes.LOGIC_PROCESSING_COMPLETED, (event) => {
            const payload = event.payload;
            this.setCompletedStatus(payload.operationType);
        });
        this.eventBus.on(eventTypes_1.EventTypes.LOGIC_PROCESSING_FAILED, (event) => {
            const payload = event.payload;
            this.setFailedStatus(payload.operationType);
        });
        this.eventBus.on(eventTypes_1.EventTypes.STATUS_UPDATED, (event) => {
            const payload = event.payload;
            this.showStatus(payload.message);
        });
    }
    /**
     * Show a processing status in the status bar
     */
    setProcessingStatus(operationType) {
        this.isProcessing = true;
        this.statusBarItem.text = `$(sync~spin) AI: Processing ${operationType}...`;
    }
    /**
     * Show a completed status in the status bar
     */
    setCompletedStatus(operationType) {
        this.isProcessing = false;
        this.statusBarItem.text = `$(check) AI: ${operationType} completed`;
        // Reset after a few seconds
        setTimeout(() => {
            if (!this.isProcessing) {
                this.resetStatus();
            }
        }, 5000);
    }
    /**
     * Show a failed status in the status bar
     */
    setFailedStatus(operationType) {
        this.isProcessing = false;
        this.statusBarItem.text = `$(error) AI: ${operationType} failed`;
        // Reset after a few seconds
        setTimeout(() => {
            if (!this.isProcessing) {
                this.resetStatus();
            }
        }, 5000);
    }
    /**
     * Show a generic status message
     */
    showStatus(message) {
        if (!this.isProcessing) {
            this.statusBarItem.text = `$(hubot) AI: ${message}`;
            // Reset after a few seconds
            setTimeout(() => {
                if (!this.isProcessing) {
                    this.resetStatus();
                }
            }, 5000);
        }
    }
    /**
     * Reset the status bar to its default state
     */
    resetStatus() {
        this.statusBarItem.text = '$(hubot) AI Assistant';
    }
    /**
     * Dispose the status bar item
     */
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=statusBar.js.map