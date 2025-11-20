import * as assert from 'assert';
import { getYAMLEditorOutputChannel } from '../../../yaml/ErrorHandler';
import { KubectlError, KubectlErrorType } from '../../../kubernetes/KubectlError';

/**
 * Unit tests for ErrorHandler utility.
 * Note: These tests verify the structure and exports of the ErrorHandler module.
 * Full integration testing with vscode.window.showErrorMessage would require
 * mocking the VS Code API, which is not done here for simplicity.
 */
suite('ErrorHandler', () => {

    suite('KubectlError Types', () => {
        test('should create KubectlError with ConnectionFailed type', () => {
            const error = new KubectlError(
                KubectlErrorType.ConnectionFailed,
                'Cannot connect to cluster',
                'connection refused',
                'test-cluster'
            );
            
            assert.strictEqual(error.type, KubectlErrorType.ConnectionFailed);
            assert.strictEqual(error.getUserMessage(), 'Cannot connect to cluster');
            assert.strictEqual(error.getDetails(), 'connection refused');
            assert.strictEqual(error.contextName, 'test-cluster');
        });

        test('should create KubectlError with PermissionDenied type', () => {
            const error = new KubectlError(
                KubectlErrorType.PermissionDenied,
                'Access denied',
                'forbidden',
                'test-cluster'
            );
            
            assert.strictEqual(error.type, KubectlErrorType.PermissionDenied);
            assert.strictEqual(error.getUserMessage(), 'Access denied');
        });

        test('should create KubectlError with Timeout type', () => {
            const error = new KubectlError(
                KubectlErrorType.Timeout,
                'Operation timed out',
                'timeout',
                'test-cluster'
            );
            
            assert.strictEqual(error.type, KubectlErrorType.Timeout);
        });

        test('should create KubectlError with BinaryNotFound type', () => {
            const error = new KubectlError(
                KubectlErrorType.BinaryNotFound,
                'kubectl not found',
                'ENOENT',
                'test-cluster'
            );
            
            assert.strictEqual(error.type, KubectlErrorType.BinaryNotFound);
        });

        test('should create KubectlError with Unknown type', () => {
            const error = new KubectlError(
                KubectlErrorType.Unknown,
                'Unknown error',
                'unknown details',
                'test-cluster'
            );
            
            assert.strictEqual(error.type, KubectlErrorType.Unknown);
        });
    });

    suite('Module Exports', () => {
        test('should export getYAMLEditorOutputChannel function', () => {
            assert.ok(getYAMLEditorOutputChannel, 'getYAMLEditorOutputChannel should be exported');
            assert.strictEqual(typeof getYAMLEditorOutputChannel, 'function', 'Should be a function');
        });

        // Note: Tests for actual VS Code API calls (window.createOutputChannel) are skipped
        // in unit tests as they require the full VS Code extension host environment.
        // These would be tested in integration tests instead.
    });
});
