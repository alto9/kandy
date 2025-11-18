import * as vscode from 'vscode';
import { KubectlError, KubectlErrorType } from '../kubernetes/KubectlError';

/**
 * OutputChannel for YAML editor error logging.
 */
let outputChannel: vscode.OutputChannel | undefined;

/**
 * Gets or creates the OutputChannel for YAML editor error logging.
 * 
 * @returns The OutputChannel instance
 */
function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('kube9 YAML Editor');
    }
    return outputChannel;
}

/**
 * Shows an error message with optional "View Details" and "Retry" buttons.
 * Provides enhanced user experience for kubectl errors with detailed logging.
 * 
 * @param error - The KubectlError containing error information
 * @param context - Description of what operation was being performed (e.g., "fetching YAML", "saving changes")
 * @param onRetry - Optional callback to retry the operation (only shown for transient errors)
 * @returns Promise that resolves when user dismisses the error or completes retry
 */
export async function showErrorWithDetails(
    error: KubectlError,
    context: string,
    onRetry?: () => Promise<void>
): Promise<void> {
    // Determine if this is a transient error that can be retried
    const isTransient = 
        error.type === KubectlErrorType.ConnectionFailed || 
        error.type === KubectlErrorType.Timeout;
    
    // Build button array based on error type
    const buttons: string[] = ['View Details'];
    if (isTransient && onRetry) {
        buttons.push('Retry');
    }
    
    // Show error message with appropriate buttons
    const errorMessage = `${context}: ${error.getUserMessage()}`;
    const selection = await vscode.window.showErrorMessage(errorMessage, ...buttons);
    
    // Handle button selection
    if (selection === 'View Details') {
        // Log detailed error information to output channel
        const channel = getOutputChannel();
        channel.appendLine('');
        channel.appendLine(`[${new Date().toISOString()}] Error during ${context}`);
        channel.appendLine(`Error Type: ${error.type}`);
        channel.appendLine(`Cluster: ${error.contextName}`);
        channel.appendLine(`Message: ${error.getUserMessage()}`);
        channel.appendLine(`Details: ${error.getDetails()}`);
        channel.appendLine('');
        
        // Show the output channel
        channel.show();
    } else if (selection === 'Retry' && onRetry) {
        try {
            // Execute retry callback
            await onRetry();
        } catch (retryError) {
            // If retry fails, show error again (without retry button to avoid infinite loop)
            if (retryError instanceof Error) {
                vscode.window.showErrorMessage(`Retry failed: ${retryError.message}`);
            } else {
                vscode.window.showErrorMessage('Retry failed: Unknown error');
            }
        }
    }
}

/**
 * Shows a simple error message without detailed error handling.
 * Use this for non-kubectl errors or simple error scenarios.
 * 
 * @param message - The error message to display
 * @param details - Optional detailed information to log to output channel
 */
export function showError(message: string, details?: string): void {
    vscode.window.showErrorMessage(message);
    
    if (details) {
        const channel = getOutputChannel();
        channel.appendLine('');
        channel.appendLine(`[${new Date().toISOString()}] Error`);
        channel.appendLine(`Message: ${message}`);
        channel.appendLine(`Details: ${details}`);
        channel.appendLine('');
    }
}

/**
 * Logs an error to the output channel without showing a user-facing message.
 * Useful for logging errors that don't require immediate user attention.
 * 
 * @param context - Description of what operation was being performed
 * @param error - The error to log (can be Error, KubectlError, or string)
 */
export function logError(context: string, error: Error | KubectlError | string): void {
    const channel = getOutputChannel();
    channel.appendLine('');
    channel.appendLine(`[${new Date().toISOString()}] Error during ${context}`);
    
    if (error instanceof KubectlError) {
        channel.appendLine(`Error Type: ${error.type}`);
        channel.appendLine(`Cluster: ${error.contextName}`);
        channel.appendLine(`Message: ${error.getUserMessage()}`);
        channel.appendLine(`Details: ${error.getDetails()}`);
    } else if (error instanceof Error) {
        channel.appendLine(`Message: ${error.message}`);
        if (error.stack) {
            channel.appendLine(`Stack: ${error.stack}`);
        }
    } else {
        channel.appendLine(`Details: ${error}`);
    }
    
    channel.appendLine('');
}

/**
 * Exports the OutputChannel for use by other components.
 * 
 * @returns The OutputChannel instance
 */
export function getYAMLEditorOutputChannel(): vscode.OutputChannel {
    return getOutputChannel();
}

