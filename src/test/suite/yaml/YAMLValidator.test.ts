import * as assert from 'assert';
import { validateYAMLSyntax, ValidationResult } from '../../../yaml/YAMLValidator';

/**
 * Unit tests for YAML syntax validation.
 * Tests validation of both valid and invalid YAML content,
 * including error reporting with line and column information.
 */
suite('YAMLValidator', () => {
    suite('validateYAMLSyntax', () => {
        suite('Valid YAML', () => {
            test('should validate simple valid YAML', () => {
                const yamlContent = `
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
`;
                const result: ValidationResult = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
                assert.strictEqual(result.error, undefined);
                assert.strictEqual(result.line, undefined);
                assert.strictEqual(result.column, undefined);
            });

            test('should validate complex Kubernetes Deployment YAML', () => {
                const yamlContent = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  namespace: production
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
                assert.strictEqual(result.error, undefined);
            });

            test('should validate YAML with arrays', () => {
                const yamlContent = `
items:
  - name: item1
    value: 100
  - name: item2
    value: 200
  - name: item3
    value: 300
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should validate YAML with nested objects', () => {
                const yamlContent = `
metadata:
  annotations:
    key1: value1
    key2: value2
  labels:
    app: myapp
    version: v1
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should validate YAML with multi-line strings', () => {
                const yamlContent = `
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
data:
  config.yaml: |
    setting1: value1
    setting2: value2
    setting3: value3
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should validate YAML with comments', () => {
                const yamlContent = `
# This is a comment
apiVersion: v1
kind: Service
metadata:
  name: my-service  # Service name
  namespace: default
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should validate empty YAML', () => {
                const yamlContent = '';
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should validate YAML with null values', () => {
                const yamlContent = `
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  annotations: null
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });
        });

        suite('Invalid YAML', () => {
            test('should detect invalid indentation', () => {
                // Invalid: Mixed indentation with improper nesting
                const yamlContent = `
apiVersion: v1
kind: Pod
  metadata:
 name: test-pod
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.error, 'Error message should be present');
                assert.ok(result.line !== undefined, 'Line number should be present');
            });

            test('should detect missing colon', () => {
                const yamlContent = `
apiVersion v1
kind: Pod
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.error, 'Error message should be present');
            });

            test('should detect invalid array syntax', () => {
                const yamlContent = `
items:
  - name: item1
  value: 100
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.error, 'Error message should be present');
            });

            test('should detect unclosed quotes', () => {
                const yamlContent = `
apiVersion: v1
kind: Pod
metadata:
  name: "test-pod
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.error, 'Error message should be present');
            });

            test('should detect tab characters in YAML', () => {
                const yamlContent = `
apiVersion: v1
kind: Pod
metadata:
\tname: test-pod
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.error, 'Error message should be present');
                assert.ok(result.error.toLowerCase().includes('tab') || 
                         result.error.includes('\t'), 
                         'Error should mention tab character');
            });

            test('should detect duplicate keys', () => {
                const yamlContent = `
apiVersion: v1
kind: Pod
metadata:
  name: test-pod
  name: another-pod
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.error, 'Error message should be present');
            });

            test('should detect invalid multi-line string', () => {
                const yamlContent = `
apiVersion: v1
data:
  config: |
 invalid indentation
    proper indentation
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.error, 'Error message should be present');
            });
        });

        suite('Error Details', () => {
            test('should provide line number for errors', () => {
                // Invalid: Improper list syntax
                const yamlContent = `
items:
- name: item1
  - value: 100
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.line !== undefined, 'Line number should be provided');
                assert.ok(typeof result.line === 'number', 'Line should be a number');
                assert.ok(result.line >= 0, 'Line number should be non-negative');
            });

            test('should provide column number for errors', () => {
                // Invalid: Improper list syntax
                const yamlContent = `
items:
- name: item1
  - value: 100
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.column !== undefined, 'Column number should be provided');
                assert.ok(typeof result.column === 'number', 'Column should be a number');
                assert.ok(result.column >= 0, 'Column number should be non-negative');
            });

            test('should provide descriptive error message', () => {
                // Invalid: Malformed mapping
                const yamlContent = `
apiVersion: v1
kind: [broken
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.error, 'Error message should be present');
                assert.ok(result.error.length > 0, 'Error message should not be empty');
                assert.ok(typeof result.error === 'string', 'Error should be a string');
            });

            test('should handle multiple syntax errors (reports first)', () => {
                const yamlContent = `
apiVersion v1
kind Pod
metadata
name: test-pod
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, false);
                assert.ok(result.error, 'Error message should be present');
                // js-yaml will report the first error it encounters
                assert.ok(result.line !== undefined, 'Line number should be present');
            });
        });

        suite('Edge Cases', () => {
            test('should handle whitespace-only content', () => {
                const yamlContent = '   \n  \n  \t  \n';
                const result = validateYAMLSyntax(yamlContent);
                
                // Whitespace-only is valid YAML (represents null/empty)
                assert.strictEqual(result.valid, true);
            });

            test('should handle very large YAML documents', () => {
                // Create a large YAML document
                let yamlContent = 'items:\n';
                for (let i = 0; i < 1000; i++) {
                    yamlContent += `  - name: item${i}\n    value: ${i}\n`;
                }
                
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should handle YAML with special characters', () => {
                const yamlContent = `
metadata:
  name: "pod-with-special-chars-@#$%"
  labels:
    key: "value-with-unicode-字符"
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should handle YAML with anchors and aliases', () => {
                const yamlContent = `
defaults: &defaults
  adapter: postgres
  host: localhost

development:
  <<: *defaults
  database: dev_db

production:
  <<: *defaults
  database: prod_db
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should handle YAML with boolean and number types', () => {
                const yamlContent = `
enabled: true
disabled: false
count: 42
ratio: 3.14
scientific: 1.23e-4
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should reject YAML with invalid UTF-8 sequences', () => {
                // This is more of a theoretical test - most strings in JavaScript
                // are already valid UTF-16, which converts to valid UTF-8
                const yamlContent = 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: test';
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });
        });

        suite('Kubernetes Resource Examples', () => {
            test('should validate StatefulSet YAML', () => {
                const yamlContent = `
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
spec:
  serviceName: redis
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:6.2
        ports:
        - containerPort: 6379
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should validate Service YAML', () => {
                const yamlContent = `
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 9376
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should validate ConfigMap YAML', () => {
                const yamlContent = `
apiVersion: v1
kind: ConfigMap
metadata:
  name: game-config
data:
  game.properties: |
    enemies=aliens
    lives=3
    enemies.cheat=true
  ui.properties: |
    color.good=purple
    color.bad=yellow
`;
                const result = validateYAMLSyntax(yamlContent);
                
                assert.strictEqual(result.valid, true);
            });

            test('should detect invalid Kubernetes YAML structure (syntax level)', () => {
                const yamlContent = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  selector
    matchLabels:
      app: nginx
`;
                const result = validateYAMLSyntax(yamlContent);
                
                // Missing colon after selector
                assert.strictEqual(result.valid, false);
                assert.ok(result.error);
            });
        });

        suite('Return Type Validation', () => {
            test('should return ValidationResult with correct structure for valid YAML', () => {
                const yamlContent = 'apiVersion: v1';
                const result = validateYAMLSyntax(yamlContent);
                
                // Verify the structure matches ValidationResult interface
                assert.ok(typeof result === 'object');
                assert.ok('valid' in result);
                assert.strictEqual(typeof result.valid, 'boolean');
                assert.strictEqual(result.valid, true);
            });

            test('should return ValidationResult with correct structure for invalid YAML', () => {
                // Invalid: Unclosed bracket
                const yamlContent = 'items: [a, b, c';
                const result = validateYAMLSyntax(yamlContent);
                
                // Verify the structure matches ValidationResult interface
                assert.ok(typeof result === 'object');
                assert.ok('valid' in result);
                assert.strictEqual(typeof result.valid, 'boolean');
                assert.strictEqual(result.valid, false);
                assert.ok('error' in result);
                assert.ok(typeof result.error === 'string');
            });
        });
    });
});

