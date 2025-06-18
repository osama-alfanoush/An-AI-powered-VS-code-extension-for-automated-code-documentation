// VS Code API access
const vscode = acquireVsCodeApi();

// DOM Elements
const analyzeButton = document.getElementById('analyze-button');
const generateDocsButton = document.getElementById('generate-docs-button');
const resultContainer = document.getElementById('result-container');
const loadingIndicator = document.getElementById('loading-indicator');

// Backend API URL - update this with your actual backend URL
const API_BASE_URL = 'http://localhost:8000';

// Initialize the extension
document.addEventListener('DOMContentLoaded', () => {
    console.log('VS Code AI Assistant loaded');
    
    // Listen for messages from VS Code extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'setCode':
                // Code was sent from the extension
                document.getElementById('code-input').value = message.code;
                break;
            case 'showError':
                showError(message.error);
                break;
        }
    });
    
    // Set up event listeners
    if (analyzeButton) {
        analyzeButton.addEventListener('click', analyzeCode);
    }
    
    if (generateDocsButton) {
        generateDocsButton.addEventListener('click', generateDocs);
    }
});

/**
 * Analyze code for bugs and improvements
 */
async function analyzeCode() {
    try {
        const codeInput = document.getElementById('code-input').value;
        
        if (!codeInput || codeInput.trim().length < 10) {
            showError('Please provide a code snippet with at least 10 characters.');
            return;
        }
        
        showLoading('Analyzing code...');
        
        // Ensure the code is properly formatted with "Code:" prefix
        const formattedPrompt = formatCodePrompt(codeInput);
        
        // Send the request to backend
        const response = await fetch(`${API_BASE_URL}/analyze-bugs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: formattedPrompt
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze code');
        }
        
        if (!data.success) {
            throw new Error(data.error || 'Analysis unsuccessful');
        }
        
        // Display the result
        showResult(data.result, 'analysis');
        
        // Notify the extension
        vscode.postMessage({
            command: 'analysisComplete',
            result: data.result
        });
        
    } catch (error) {
        console.error('Error analyzing code:', error);
        showError(`Failed to analyze code: ${error.message}`);
    } finally {
        hideLoading();
    }
}

/**
 * Generate documentation for the code
 */
async function generateDocs() {
    try {
        const codeInput = document.getElementById('code-input').value;
        
        if (!codeInput || codeInput.trim().length < 10) {
            showError('Please provide a code snippet with at least 10 characters.');
            return;
        }
        
        showLoading('Generating documentation...');
        
        // Ensure the code is properly formatted with "Code:" prefix
        const formattedPrompt = formatCodePrompt(codeInput);
        
        // Send the request to backend
        const response = await fetch(`${API_BASE_URL}/generate-docs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: formattedPrompt
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate documentation');
        }
        
        if (!data.success) {
            throw new Error(data.error || 'Documentation generation unsuccessful');
        }
        
        // Display the result
        showResult(data.result, 'documentation');
        
        // Notify the extension
        vscode.postMessage({
            command: 'docsGenerated',
            result: data.result
        });
        
    } catch (error) {
        console.error('Error generating documentation:', error);
        showError(`Failed to generate documentation: ${error.message}`);
    } finally {
        hideLoading();
    }
}

/**
 * Format the code prompt to ensure it contains the "Code:" section required by the backend
 */
function formatCodePrompt(code) {
    // If code already contains the "Code:" marker, return as is
    if (code.includes('Code:')) {
        return code;
    }
    
    // Otherwise, prepend "Code:" to the input
    return `Code: ${code}`;
}

/**
 * Display the API result in the UI
 */
function showResult(result, type) {
    if (!resultContainer) return;
    
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('error');
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = type === 'analysis' ? 'Code Analysis' : 'Documentation';
    resultContainer.appendChild(titleElement);
    
    const resultElement = document.createElement('pre');
    resultElement.textContent = result;
    resultContainer.appendChild(resultElement);
    
    // Show copy button
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy to Clipboard';
    copyButton.className = 'copy-button';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(result)
            .then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy to Clipboard';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
            });
    };
    resultContainer.appendChild(copyButton);
    
    resultContainer.style.display = 'block';
}

/**
 * Display an error message
 */
function showError(message) {
    if (!resultContainer) return;
    
    resultContainer.innerHTML = '';
    resultContainer.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.textContent = `Error: ${message}`;
    resultContainer.appendChild(errorElement);
    
    resultContainer.style.display = 'block';
}

/**
 * Show the loading indicator with a message
 */
function showLoading(message = 'Loading...') {
    if (!loadingIndicator) return;
    
    loadingIndicator.textContent = message;
    loadingIndicator.style.display = 'block';
    
    if (resultContainer) {
        resultContainer.style.display = 'none';
    }
}

/**
 * Hide the loading indicator
 */
function hideLoading() {
    if (!loadingIndicator) return;
    loadingIndicator.style.display = 'none';
}