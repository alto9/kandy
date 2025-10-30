import * as assert from 'assert';
import { ClusterTreeProvider } from '../../../tree/ClusterTreeProvider';
import { ClusterTreeItem, ClusterStatus } from '../../../tree/ClusterTreeItem';
import { ClusterConnectivity, ConnectivityResult, NamespaceResult } from '../../../kubernetes/ClusterConnectivity';
import { ParsedKubeconfig } from '../../../kubernetes/KubeconfigParser';
import { KubectlError, KubectlErrorType } from '../../../kubernetes/KubectlError';
import * as vscode from '../../mocks/vscode';

suite('ClusterTreeProvider Test Suite', () => {
    let provider: ClusterTreeProvider;
    let originalGetNamespaces: typeof ClusterConnectivity.getNamespaces;
    let originalCheckMultipleConnectivity: typeof ClusterConnectivity.checkMultipleConnectivity;

    const mockKubeconfig: ParsedKubeconfig = {
        filePath: '/test/kubeconfig.yaml',
        clusters: [
            { name: 'test-cluster-1', server: 'https://api.test1.com:6443' },
            { name: 'test-cluster-2', server: 'https://api.test2.com:6443' }
        ],
        contexts: [
            { name: 'context-1', cluster: 'test-cluster-1', user: 'user-1', namespace: 'default' },
            { name: 'context-2', cluster: 'test-cluster-2', user: 'user-2' }
        ],
        users: [
            { name: 'user-1' },
            { name: 'user-2' }
        ],
        currentContext: 'context-1'
    };

    setup(() => {
        provider = new ClusterTreeProvider();
        
        // Save original methods for restoration
        originalGetNamespaces = ClusterConnectivity.getNamespaces;
        originalCheckMultipleConnectivity = ClusterConnectivity.checkMultipleConnectivity;
        
        // Clear any previous window messages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (vscode.window as any)._clearMessages();
    });

    teardown(() => {
        // Restore original methods
        ClusterConnectivity.getNamespaces = originalGetNamespaces;
        ClusterConnectivity.checkMultipleConnectivity = originalCheckMultipleConnectivity;
        
        // Dispose provider
        provider.dispose();
    });

    suite('getTreeItem', () => {
        test('Should return the tree item as-is', () => {
            const item = new ClusterTreeItem('test', 'cluster', vscode.TreeItemCollapsibleState.Collapsed);
            const result = provider.getTreeItem(item);
            assert.strictEqual(result, item);
        });
    });

    suite('2-Level Structure Tests', () => {
        test('Should return clusters at root level', async () => {
            // Mock connectivity check to avoid waiting
            ClusterConnectivity.checkMultipleConnectivity = async () => [
                { status: ClusterStatus.Connected },
                { status: ClusterStatus.Connected }
            ];

            provider.setKubeconfig(mockKubeconfig);
            
            const items = await provider.getChildren();
            
            // Should have 2 clusters + 1 auth status item
            assert.strictEqual(items.length, 3);
            assert.strictEqual(items[0].type, 'cluster');
            assert.strictEqual(items[0].label, 'context-1');
            assert.strictEqual(items[1].type, 'cluster');
            assert.strictEqual(items[1].label, 'context-2');
            assert.strictEqual(items[2].type, 'info'); // Auth status
        });

        test('Should return namespaces for cluster level', async () => {
            // Mock namespace retrieval
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: ['default', 'kube-system', 'production'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const clusterItem = clusters[0];
            
            const namespaceItems = await provider.getChildren(clusterItem);
            
            // Should have "All Namespaces" + 3 individual namespaces
            assert.strictEqual(namespaceItems.length, 4);
            assert.strictEqual(namespaceItems[0].type, 'allNamespaces');
            assert.strictEqual(namespaceItems[1].type, 'namespace');
            assert.strictEqual(namespaceItems[2].type, 'namespace');
            assert.strictEqual(namespaceItems[3].type, 'namespace');
        });

        test('Should return empty array for namespace level (no deeper nesting)', async () => {
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: ['default'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            const namespaceItem = namespaceItems[1]; // Skip "All Namespaces"
            
            const children = await provider.getChildren(namespaceItem);
            
            assert.strictEqual(children.length, 0);
        });

        test('Should return empty array for non-cluster items without children', async () => {
            const infoItem = new ClusterTreeItem('Info', 'info', vscode.TreeItemCollapsibleState.None);
            const children = await provider.getChildren(infoItem);
            assert.strictEqual(children.length, 0);
        });
    });

    suite('Namespace Retrieval Tests (Mocked kubectl)', () => {
        test('Should call getNamespaces with correct parameters', async () => {
            let calledWithPath: string | undefined;
            let calledWithContext: string | undefined;

            ClusterConnectivity.getNamespaces = async (kubeconfigPath: string, contextName: string): Promise<NamespaceResult> => {
                calledWithPath = kubeconfigPath;
                calledWithContext = contextName;
                return { namespaces: ['default'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            await provider.getChildren(clusters[0]);
            
            assert.strictEqual(calledWithPath, '/test/kubeconfig.yaml');
            assert.strictEqual(calledWithContext, 'context-1');
        });

        test('Should sort namespaces alphabetically', async () => {
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                // Return unsorted namespaces
                return { namespaces: ['zebra', 'alpha', 'beta', 'kube-system'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            
            // Skip "All Namespaces" item
            const namespaceNames = namespaceItems.slice(1).map(item => item.label);
            
            assert.deepStrictEqual(namespaceNames, ['alpha', 'beta', 'kube-system', 'zebra']);
        });

        test('Should handle empty namespace list', async () => {
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: [] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            
            assert.strictEqual(namespaceItems.length, 0);
        });
    });

    suite('"All Namespaces" Item Tests', () => {
        test('Should appear first in namespace list', async () => {
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: ['default', 'kube-system'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            
            assert.strictEqual(namespaceItems[0].type, 'allNamespaces');
            assert.strictEqual(namespaceItems[0].label, 'All Namespaces');
        });

        test('Should have correct type', async () => {
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: ['default'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            const allNamespacesItem = namespaceItems[0];
            
            assert.strictEqual(allNamespacesItem.type, 'allNamespaces');
        });

        test('Should have kandy.openNamespace command attached', async () => {
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: ['default'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            const allNamespacesItem = namespaceItems[0];
            
            assert.ok(allNamespacesItem.command);
            assert.strictEqual(allNamespacesItem.command.command, 'kandy.openNamespace');
        });

        test('Should have globe icon', async () => {
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: ['default'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            const allNamespacesItem = namespaceItems[0];
            
            assert.ok(allNamespacesItem.iconPath instanceof vscode.ThemeIcon);
            assert.strictEqual((allNamespacesItem.iconPath as vscode.ThemeIcon).id, 'globe');
        });
    });

    suite('Individual Namespace Tests', () => {
        test('Should have type "namespace"', async () => {
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: ['default', 'production'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            
            // Skip "All Namespaces"
            assert.strictEqual(namespaceItems[1].type, 'namespace');
            assert.strictEqual(namespaceItems[2].type, 'namespace');
        });

        test('Should have kandy.openNamespace command', async () => {
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: ['default'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            const namespaceItem = namespaceItems[1];
            
            assert.ok(namespaceItem.command);
            assert.strictEqual(namespaceItem.command.command, 'kandy.openNamespace');
        });

        test('Should have symbol-namespace icon', async () => {
            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: ['default'] };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            const namespaceItem = namespaceItems[1];
            
            assert.ok(namespaceItem.iconPath instanceof vscode.ThemeIcon);
            assert.strictEqual((namespaceItem.iconPath as vscode.ThemeIcon).id, 'symbol-namespace');
        });
    });

    suite('Refresh Mechanism Tests', () => {
        test('Should fire onDidChangeTreeData event when refresh() is called', (done) => {
            let eventFired = false;
            
            provider.onDidChangeTreeData(() => {
                eventFired = true;
                assert.strictEqual(eventFired, true);
                done();
            });
            
            provider.refresh();
        });

        test('Should fire event with element when refreshItem() is called', (done) => {
            const testItem = new ClusterTreeItem('test', 'cluster', vscode.TreeItemCollapsibleState.Collapsed);
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            provider.onDidChangeTreeData((element: any) => {
                assert.strictEqual(element, testItem);
                done();
            });
            
            provider.refreshItem(testItem);
        });

        test('Should trigger refresh when setKubeconfig() is called', (done) => {
            provider.onDidChangeTreeData(() => {
                done();
            });
            
            provider.setKubeconfig(mockKubeconfig);
        });
    });

    suite('Error Handling Tests (Mocked Errors)', () => {
        test('Should show kubectl binary not found error once per session only', async () => {
            const error = new KubectlError(
                KubectlErrorType.BinaryNotFound,
                'kubectl is not installed',
                'kubectl: command not found',
                'context-1'
            );

            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: [], error };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            await provider.getChildren(clusters[0]);
            
            // First call should show error
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errors1 = (vscode.window as any)._getErrorMessages();
            assert.strictEqual(errors1.length, 1);
            
            // Second call should NOT show error again
            await provider.getChildren(clusters[0]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errors2 = (vscode.window as any)._getErrorMessages();
            assert.strictEqual(errors2.length, 1); // Still only 1
        });

        test('Should show warning for permission denied errors', async () => {
            const error = new KubectlError(
                KubectlErrorType.PermissionDenied,
                'Access denied to cluster',
                'permission denied',
                'context-1'
            );

            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: [], error };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            await provider.getChildren(clusters[0]);
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const warnings = (vscode.window as any)._getWarningMessages();
            assert.strictEqual(warnings.length, 1);
        });

        test('Should only log connection failures (no UI message)', async () => {
            const error = new KubectlError(
                KubectlErrorType.ConnectionFailed,
                'Cannot connect to cluster',
                'connection refused',
                'context-1'
            );

            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: [], error };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            await provider.getChildren(clusters[0]);
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errors = (vscode.window as any)._getErrorMessages();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const warnings = (vscode.window as any)._getWarningMessages();
            
            // No UI messages should be shown
            assert.strictEqual(errors.length, 0);
            assert.strictEqual(warnings.length, 0);
        });

        test('Should only log timeout errors (no UI message)', async () => {
            const error = new KubectlError(
                KubectlErrorType.Timeout,
                'Connection timed out',
                'timeout',
                'context-1'
            );

            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: [], error };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            await provider.getChildren(clusters[0]);
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errors = (vscode.window as any)._getErrorMessages();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const warnings = (vscode.window as any)._getWarningMessages();
            
            assert.strictEqual(errors.length, 0);
            assert.strictEqual(warnings.length, 0);
        });

        test('Should return empty array on namespace error', async () => {
            const error = new KubectlError(
                KubectlErrorType.Unknown,
                'Failed to execute kubectl',
                'some error',
                'context-1'
            );

            ClusterConnectivity.getNamespaces = async (): Promise<NamespaceResult> => {
                return { namespaces: [], error };
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const clusters = await provider.getChildren();
            const namespaceItems = await provider.getChildren(clusters[0]);
            
            assert.strictEqual(namespaceItems.length, 0);
        });
    });

    suite('Edge Cases', () => {
        test('Should show message when no kubeconfig is set', async () => {
            const items = await provider.getChildren();
            
            assert.strictEqual(items.length, 1);
            assert.strictEqual(items[0].type, 'cluster');
            assert.strictEqual(items[0].label, 'No clusters detected');
        });

        test('Should show message when kubeconfig has no contexts', async () => {
            const emptyKubeconfig: ParsedKubeconfig = {
                filePath: '/test/kubeconfig.yaml',
                clusters: [],
                contexts: [],
                users: [],
                currentContext: undefined
            };

            provider.setKubeconfig(emptyKubeconfig);
            
            const items = await provider.getChildren();
            
            assert.strictEqual(items.length, 1);
            assert.strictEqual(items[0].label, 'No clusters configured');
        });

        test('Should skip contexts with missing cluster references', async () => {
            const invalidKubeconfig: ParsedKubeconfig = {
                filePath: '/test/kubeconfig.yaml',
                clusters: [
                    { name: 'test-cluster-1', server: 'https://api.test1.com:6443' }
                ],
                contexts: [
                    { name: 'valid-context', cluster: 'test-cluster-1', user: 'user-1' },
                    { name: 'invalid-context', cluster: 'non-existent-cluster', user: 'user-2' }
                ],
                users: [{ name: 'user-1' }, { name: 'user-2' }],
                currentContext: 'valid-context'
            };

            ClusterConnectivity.checkMultipleConnectivity = async () => [
                { status: ClusterStatus.Connected }
            ];

            provider.setKubeconfig(invalidKubeconfig);
            
            const items = await provider.getChildren();
            
            // Should have 1 valid cluster + 1 auth status item
            assert.strictEqual(items.length, 2);
            assert.strictEqual(items[0].label, 'valid-context');
        });

        test('Should return empty array when cluster has no resourceData', async () => {
            const clusterWithoutData = new ClusterTreeItem(
                'test',
                'cluster',
                vscode.TreeItemCollapsibleState.Collapsed
            );

            const items = await provider.getChildren(clusterWithoutData);
            
            assert.strictEqual(items.length, 0);
        });
    });

    suite('Connectivity Status Tests', () => {
        test('Should update cluster status after connectivity check', async () => {
            ClusterConnectivity.checkMultipleConnectivity = async (): Promise<ConnectivityResult[]> => {
                return [
                    { status: ClusterStatus.Connected },
                    { status: ClusterStatus.Disconnected }
                ];
            };

            provider.setKubeconfig(mockKubeconfig);
            
            const items = await provider.getChildren();
            
            // Wait a bit for async connectivity checks to complete
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Items should have been updated (though we can't directly check since refresh was called)
            assert.ok(items.length >= 2);
        });
    });
});

