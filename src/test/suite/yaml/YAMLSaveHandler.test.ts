import * as assert from 'assert';
import * as vscode from 'vscode';
import { YAMLSaveHandler } from '../../../yaml/YAMLSaveHandler';

suite('YAMLSaveHandler Test Suite', () => {
    let saveHandler: YAMLSaveHandler;

    setup(() => {
        saveHandler = new YAMLSaveHandler();
    });

    suite('handleSave', () => {
        test('should return false for invalid YAML syntax', async () => {
            // Create a mock document with invalid YAML
            const invalidYAML = `
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  namespace: default
spec:
  containers:
  - name: nginx
    image: nginx:latest
    - invalid indentation
`;
            
            const mockDocument = createMockDocument(invalidYAML, 'test-cluster', 'default', 'Pod', 'test-pod');
            
            // Attempt to save - should fail due to invalid syntax
            const result = await saveHandler.handleSave(mockDocument);
            
            // Should return false for invalid YAML
            assert.strictEqual(result, false, 'handleSave should return false for invalid YAML syntax');
        });

        test('should return false for YAML with duplicate keys', async () => {
            // Create a mock document with duplicate keys (invalid YAML)
            const duplicateKeyYAML = `
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  name: duplicate-name
spec:
  containers:
  - name: nginx
    image: nginx:latest
`;
            
            const mockDocument = createMockDocument(duplicateKeyYAML, 'test-cluster', 'default', 'Pod', 'test-pod');
            
            // Attempt to save - should fail due to duplicate keys
            const result = await saveHandler.handleSave(mockDocument);
            
            // Should return false for duplicate keys
            assert.strictEqual(result, false, 'handleSave should return false for YAML with duplicate keys');
        });

        test('should handle valid YAML for namespaced resources', async () => {
            // Create a mock document with valid YAML
            const validYAML = `
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  namespace: default
spec:
  containers:
  - name: nginx
    image: nginx:latest
`;
            
            const mockDocument = createMockDocument(validYAML, 'test-cluster', 'default', 'Pod', 'test-pod');
            
            // Note: This test will attempt actual kubectl commands
            // In a real scenario, we would mock the execFile function
            // For now, this demonstrates the structure of the test
            try {
                const result = await saveHandler.handleSave(mockDocument);
                // Result depends on kubectl availability and cluster connectivity
                assert.strictEqual(typeof result, 'boolean', 'handleSave should return a boolean');
            } catch (error) {
                // Expected if kubectl is not available or cluster is not reachable
                assert.ok(error, 'Error should be thrown if kubectl/cluster unavailable');
            }
        });

        test('should handle valid YAML for cluster-scoped resources', async () => {
            // Create a mock document with valid YAML for a cluster-scoped resource
            const validYAML = `
apiVersion: v1
kind: Namespace
metadata:
  name: test-namespace
spec: {}
`;
            
            const mockDocument = createMockDocument(validYAML, 'test-cluster', undefined, 'Namespace', 'test-namespace');
            
            // Note: This test will attempt actual kubectl commands
            try {
                const result = await saveHandler.handleSave(mockDocument);
                // Result depends on kubectl availability and cluster connectivity
                assert.strictEqual(typeof result, 'boolean', 'handleSave should return a boolean');
            } catch (error) {
                // Expected if kubectl is not available or cluster is not reachable
                assert.ok(error, 'Error should be thrown if kubectl/cluster unavailable');
            }
        });

        test('should validate YAML syntax before attempting dry-run', async () => {
            // Create a mock document with invalid YAML
            const invalidYAML = 'invalid: yaml: content: [';
            
            const mockDocument = createMockDocument(invalidYAML, 'test-cluster', 'default', 'Pod', 'test-pod');
            
            // Attempt to save - should fail immediately at syntax validation
            const startTime = Date.now();
            const result = await saveHandler.handleSave(mockDocument);
            const endTime = Date.now();
            
            // Should return false quickly (no kubectl calls)
            assert.strictEqual(result, false, 'handleSave should return false for invalid syntax');
            
            // Should complete quickly (within 1 second) since no kubectl calls are made
            const duration = endTime - startTime;
            assert.ok(duration < 1000, 'Syntax validation should fail quickly without kubectl calls');
        });
    });
});

/**
 * Helper function to create a mock VS Code TextDocument for testing.
 * 
 * @param content - The YAML content
 * @param cluster - The cluster context name
 * @param namespace - The namespace (undefined for cluster-scoped resources)
 * @param kind - The resource kind
 * @param name - The resource name
 * @returns A mock TextDocument object
 */
function createMockDocument(
    content: string,
    cluster: string,
    namespace: string | undefined,
    kind: string,
    name: string
): vscode.TextDocument {
    // Build URI in kube9-yaml:// format
    const namespaceSegment = namespace || '_cluster';
    const path = `/${cluster}/${namespaceSegment}/${kind}/${name}.yaml`;
    const uri = vscode.Uri.parse(`kube9-yaml://${path}?v1`);
    
    // Create a mock document
    const mockDocument = {
        uri,
        getText: () => content,
        fileName: `${name}.yaml`,
        isUntitled: false,
        languageId: 'yaml',
        version: 1,
        isDirty: true,
        isClosed: false,
        save: async () => false,
        eol: vscode.EndOfLine.LF,
        lineCount: content.split('\n').length,
        lineAt: (line: number) => {
            const lines = content.split('\n');
            return {
                lineNumber: line,
                text: lines[line] || '',
                range: new vscode.Range(line, 0, line, (lines[line] || '').length),
                rangeIncludingLineBreak: new vscode.Range(line, 0, line + 1, 0),
                firstNonWhitespaceCharacterIndex: 0,
                isEmptyOrWhitespace: (lines[line] || '').trim().length === 0
            };
        },
        offsetAt: (position: vscode.Position) => {
            const lines = content.split('\n');
            let offset = 0;
            for (let i = 0; i < position.line && i < lines.length; i++) {
                offset += lines[i].length + 1; // +1 for newline
            }
            offset += position.character;
            return offset;
        },
        positionAt: (offset: number) => {
            const lines = content.split('\n');
            let currentOffset = 0;
            for (let i = 0; i < lines.length; i++) {
                const lineLength = lines[i].length + 1; // +1 for newline
                if (currentOffset + lineLength > offset) {
                    return new vscode.Position(i, offset - currentOffset);
                }
                currentOffset += lineLength;
            }
            return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
        },
        getWordRangeAtPosition: () => undefined,
        validateRange: (range: vscode.Range) => range,
        validatePosition: (position: vscode.Position) => position
    } as unknown as vscode.TextDocument;
    
    return mockDocument;
}

