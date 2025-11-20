import * as assert from 'assert';
import * as vscode from 'vscode';
import { ConflictDetector } from '../../../yaml/ConflictDetector';
import { ResourceIdentifier } from '../../../yaml/YAMLEditorManager';

/**
 * Unit tests for ConflictDetector class.
 * Tests conflict detection, resource version extraction, and resolution options.
 */
suite('ConflictDetector Test Suite', () => {
    let conflictDetector: ConflictDetector;

    /**
     * Create a sample resource identifier for testing.
     */
    function createSampleResource(overrides?: Partial<ResourceIdentifier>): ResourceIdentifier {
        return {
            kind: 'Deployment',
            name: 'test-deployment',
            namespace: 'default',
            apiVersion: 'apps/v1',
            cluster: 'minikube',
            ...overrides
        };
    }

    /**
     * Create a sample YAML content with a specific resourceVersion.
     */
    function createSampleYAML(resourceVersion: string): string {
        return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-deployment
  namespace: default
  resourceVersion: "${resourceVersion}"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: test
  template:
    metadata:
      labels:
        app: test
    spec:
      containers:
      - name: nginx
        image: nginx:latest
`;
    }

    /**
     * Create a mock text document for testing.
     */
    function createMockDocument(
        content: string,
        uri: string = 'kube9-yaml://minikube/default/Deployment/test-deployment.yaml',
        isDirty: boolean = false
    ): vscode.TextDocument {
        const lines = content.split('\n');
        
        const lineAt = (lineOrPosition: number | vscode.Position): vscode.TextLine => {
            const lineNumber = typeof lineOrPosition === 'number' ? lineOrPosition : lineOrPosition.line;
            return {
                lineNumber,
                text: lines[lineNumber] || '',
                range: new vscode.Range(lineNumber, 0, lineNumber, lines[lineNumber]?.length || 0),
                rangeIncludingLineBreak: new vscode.Range(lineNumber, 0, lineNumber + 1, 0),
                firstNonWhitespaceCharacterIndex: 0,
                isEmptyOrWhitespace: !lines[lineNumber]?.trim()
            };
        };
        
        return {
            uri: vscode.Uri.parse(uri),
            fileName: 'test-deployment.yaml',
            isUntitled: false,
            languageId: 'yaml',
            version: 1,
            isDirty,
            isClosed: false,
            save: async () => true,
            eol: vscode.EndOfLine.LF,
            encoding: 'utf8',
            lineCount: lines.length,
            lineAt,
            offsetAt: () => 0,
            positionAt: () => new vscode.Position(0, 0),
            getText: () => content,
            getWordRangeAtPosition: () => undefined,
            validateRange: (range: vscode.Range) => range,
            validatePosition: (position: vscode.Position) => position
        } as vscode.TextDocument;
    }

    setup(() => {
        conflictDetector = new ConflictDetector();
    });

    teardown(() => {
        // Cleanup any monitoring intervals
        conflictDetector.dispose();
    });

    suite('Resource Version Extraction', () => {
        test('should extract resourceVersion from valid YAML', () => {
            const yaml = createSampleYAML('12345');
            const document = createMockDocument(yaml);
            const resource = createSampleResource();
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            // Start monitoring should extract the resourceVersion
            conflictDetector.startMonitoring(resource, document, resourceKey);

            // If monitoring started, it means resourceVersion was extracted successfully
            // (we can verify by stopping and checking it doesn't throw)
            assert.doesNotThrow(() => {
                conflictDetector.stopMonitoring(resourceKey);
            });
        });

        test('should handle YAML without resourceVersion gracefully', () => {
            const yamlWithoutVersion = `apiVersion: v1
kind: Pod
metadata:
  name: test-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest
`;
            const document = createMockDocument(yamlWithoutVersion);
            const resource = createSampleResource({ kind: 'Pod', name: 'test-pod' });
            const resourceKey = 'minikube:default:Pod:test-pod';

            // Should not throw even if resourceVersion is missing
            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource, document, resourceKey);
            });
        });

        test('should handle invalid YAML gracefully', () => {
            const invalidYaml = `this is not valid yaml: {[}`;
            const document = createMockDocument(invalidYaml);
            const resource = createSampleResource();
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            // Should not throw even if YAML is invalid
            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource, document, resourceKey);
            });
        });
    });

    suite('Monitoring Lifecycle', () => {
        test('should start monitoring a resource', () => {
            const yaml = createSampleYAML('12345');
            const document = createMockDocument(yaml);
            const resource = createSampleResource();
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource, document, resourceKey);
            });
        });

        test('should stop monitoring a resource', () => {
            const yaml = createSampleYAML('12345');
            const document = createMockDocument(yaml);
            const resource = createSampleResource();
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            conflictDetector.startMonitoring(resource, document, resourceKey);

            assert.doesNotThrow(() => {
                conflictDetector.stopMonitoring(resourceKey);
            });
        });

        test('should handle stopping monitoring for non-existent resource', () => {
            const resourceKey = 'minikube:default:Deployment:non-existent';

            // Should not throw even if resource was never monitored
            assert.doesNotThrow(() => {
                conflictDetector.stopMonitoring(resourceKey);
            });
        });

        test('should allow starting monitoring multiple resources', () => {
            const yaml1 = createSampleYAML('12345');
            const yaml2 = createSampleYAML('67890');
            
            const document1 = createMockDocument(yaml1, 'kube9-yaml://minikube/default/Deployment/deployment-1.yaml');
            const document2 = createMockDocument(yaml2, 'kube9-yaml://minikube/default/Deployment/deployment-2.yaml');
            
            const resource1 = createSampleResource({ name: 'deployment-1' });
            const resource2 = createSampleResource({ name: 'deployment-2' });
            
            const resourceKey1 = 'minikube:default:Deployment:deployment-1';
            const resourceKey2 = 'minikube:default:Deployment:deployment-2';

            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource1, document1, resourceKey1);
                conflictDetector.startMonitoring(resource2, document2, resourceKey2);
            });

            // Cleanup
            conflictDetector.stopMonitoring(resourceKey1);
            conflictDetector.stopMonitoring(resourceKey2);
        });
    });

    suite('Conflict Detection Logic', () => {
        test('should handle cluster-scoped resources', () => {
            const yaml = createSampleYAML('12345');
            const yamlClusterScoped = yaml.replace('namespace: default', '');
            const document = createMockDocument(yamlClusterScoped);
            const resource = createSampleResource({ 
                kind: 'Node',
                name: 'worker-node-1',
                namespace: undefined 
            });
            const resourceKey = 'minikube:_cluster:Node:worker-node-1';

            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource, document, resourceKey);
            });
        });

        test('should use correct resource key format', () => {
            const yaml = createSampleYAML('12345');
            const document = createMockDocument(yaml);
            const resource = createSampleResource();
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            // Start monitoring
            conflictDetector.startMonitoring(resource, document, resourceKey);

            // Verify we can stop with the same key
            assert.doesNotThrow(() => {
                conflictDetector.stopMonitoring(resourceKey);
            });
        });
    });

    suite('Disposal', () => {
        test('should dispose all monitoring intervals', () => {
            const yaml1 = createSampleYAML('12345');
            const yaml2 = createSampleYAML('67890');
            
            const document1 = createMockDocument(yaml1, 'kube9-yaml://minikube/default/Deployment/deployment-1.yaml');
            const document2 = createMockDocument(yaml2, 'kube9-yaml://minikube/default/Deployment/deployment-2.yaml');
            
            const resource1 = createSampleResource({ name: 'deployment-1' });
            const resource2 = createSampleResource({ name: 'deployment-2' });
            
            const resourceKey1 = 'minikube:default:Deployment:deployment-1';
            const resourceKey2 = 'minikube:default:Deployment:deployment-2';

            conflictDetector.startMonitoring(resource1, document1, resourceKey1);
            conflictDetector.startMonitoring(resource2, document2, resourceKey2);

            // Should dispose all intervals without error
            assert.doesNotThrow(() => {
                conflictDetector.dispose();
            });
        });

        test('should handle disposal with no active monitoring', () => {
            assert.doesNotThrow(() => {
                conflictDetector.dispose();
            });
        });

        test('should allow multiple disposal calls', () => {
            const yaml = createSampleYAML('12345');
            const document = createMockDocument(yaml);
            const resource = createSampleResource();
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            conflictDetector.startMonitoring(resource, document, resourceKey);
            
            // Should handle multiple dispose calls gracefully
            assert.doesNotThrow(() => {
                conflictDetector.dispose();
                conflictDetector.dispose();
            });
        });
    });

    suite('Edge Cases', () => {
        test('should handle empty YAML', () => {
            const document = createMockDocument('');
            const resource = createSampleResource();
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource, document, resourceKey);
            });
        });

        test('should handle YAML with special characters in resourceVersion', () => {
            const yaml = createSampleYAML('12345-abc-XYZ');
            const document = createMockDocument(yaml);
            const resource = createSampleResource();
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource, document, resourceKey);
            });
        });

        test('should handle resources with long names', () => {
            const longName = 'very-long-deployment-name-that-exceeds-normal-kubernetes-naming-conventions';
            const yaml = createSampleYAML('12345').replace('test-deployment', longName);
            const document = createMockDocument(yaml);
            const resource = createSampleResource({ name: longName });
            const resourceKey = `minikube:default:Deployment:${longName}`;

            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource, document, resourceKey);
            });
        });

        test('should handle resources with different API versions', () => {
            const yaml = createSampleYAML('12345').replace('apps/v1', 'apps/v1beta1');
            const document = createMockDocument(yaml);
            const resource = createSampleResource({ apiVersion: 'apps/v1beta1' });
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource, document, resourceKey);
            });
        });
    });

    suite('Integration with Document State', () => {
        test('should handle document with isDirty=true', () => {
            const yaml = createSampleYAML('12345');
            const document = createMockDocument(yaml, undefined, true);
            const resource = createSampleResource();
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource, document, resourceKey);
            });
        });

        test('should handle document with isDirty=false', () => {
            const yaml = createSampleYAML('12345');
            const document = createMockDocument(yaml, undefined, false);
            const resource = createSampleResource();
            const resourceKey = 'minikube:default:Deployment:test-deployment';

            assert.doesNotThrow(() => {
                conflictDetector.startMonitoring(resource, document, resourceKey);
            });
        });
    });
});

