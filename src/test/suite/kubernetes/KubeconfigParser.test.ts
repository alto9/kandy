import * as assert from 'assert';
import * as path from 'path';
import * as os from 'os';
import { KubeconfigParser, ParsedKubeconfig } from '../../../kubernetes/KubeconfigParser';

suite('KubeconfigParser Test Suite', () => {
    // Fixtures are in src/test/fixtures, not out/test/fixtures
    // So we need to go up from out/test/suite/kubernetes to the project root, then to src/test/fixtures
    const fixturesPath = path.join(__dirname, '..', '..', '..', '..', 'src', 'test', 'fixtures');
    const validKubeconfigPath = path.join(fixturesPath, 'valid-kubeconfig.yaml');
    const invalidKubeconfigPath = path.join(fixturesPath, 'invalid-kubeconfig.yaml');
    const emptyKubeconfigPath = path.join(fixturesPath, 'empty-kubeconfig.yaml');
    const nonExistentPath = path.join(fixturesPath, 'does-not-exist.yaml');

    let originalKubeconfigEnv: string | undefined;

    setup(() => {
        // Save original KUBECONFIG environment variable
        originalKubeconfigEnv = process.env.KUBECONFIG;
    });

    teardown(() => {
        // Restore original KUBECONFIG environment variable
        if (originalKubeconfigEnv !== undefined) {
            process.env.KUBECONFIG = originalKubeconfigEnv;
        } else {
            delete process.env.KUBECONFIG;
        }
    });

    suite('getKubeconfigPath', () => {
        test('Should return default path when KUBECONFIG is not set', () => {
            delete process.env.KUBECONFIG;
            
            const configPath = KubeconfigParser.getKubeconfigPath();
            const expectedPath = path.join(os.homedir(), '.kube', 'config');
            
            assert.strictEqual(configPath, expectedPath);
        });

        test('Should return KUBECONFIG environment variable value when set', () => {
            const customPath = '/custom/path/to/kubeconfig';
            process.env.KUBECONFIG = customPath;
            
            const configPath = KubeconfigParser.getKubeconfigPath();
            
            assert.strictEqual(configPath, customPath);
        });

        test('Should return first path when KUBECONFIG contains multiple colon-separated paths', () => {
            const firstPath = '/first/path/kubeconfig';
            const secondPath = '/second/path/kubeconfig';
            process.env.KUBECONFIG = `${firstPath}:${secondPath}`;
            
            const configPath = KubeconfigParser.getKubeconfigPath();
            
            assert.strictEqual(configPath, firstPath);
        });

        test('Should handle KUBECONFIG with spaces around paths', () => {
            const customPath = '/custom/path/kubeconfig';
            process.env.KUBECONFIG = `  ${customPath}  `;
            
            const configPath = KubeconfigParser.getKubeconfigPath();
            
            assert.strictEqual(configPath, customPath);
        });
    });

    suite('parseKubeconfig', () => {
        test('Should successfully parse a valid kubeconfig file', async () => {
            const config = await KubeconfigParser.parseKubeconfig(validKubeconfigPath);
            
            assert.ok(config);
            assert.ok(Array.isArray(config.clusters));
            assert.ok(Array.isArray(config.contexts));
            assert.ok(Array.isArray(config.users));
        });

        test('Should extract all clusters from kubeconfig', async () => {
            const config = await KubeconfigParser.parseKubeconfig(validKubeconfigPath);
            
            assert.strictEqual(config.clusters.length, 3);
            
            // Check minikube cluster
            const minikube = config.clusters.find(c => c.name === 'minikube');
            assert.ok(minikube);
            assert.strictEqual(minikube.server, 'https://192.168.49.2:8443');
            assert.strictEqual(minikube.certificateAuthority, '/home/user/.minikube/ca.crt');
            
            // Check production cluster
            const production = config.clusters.find(c => c.name === 'production-cluster');
            assert.ok(production);
            assert.strictEqual(production.server, 'https://production.example.com:6443');
            assert.ok(production.certificateAuthorityData);
            
            // Check staging cluster
            const staging = config.clusters.find(c => c.name === 'staging-cluster');
            assert.ok(staging);
            assert.strictEqual(staging.server, 'https://staging.example.com:6443');
            assert.strictEqual(staging.insecureSkipTlsVerify, true);
        });

        test('Should extract all contexts from kubeconfig', async () => {
            const config = await KubeconfigParser.parseKubeconfig(validKubeconfigPath);
            
            assert.strictEqual(config.contexts.length, 3);
            
            // Check minikube context
            const minikubeContext = config.contexts.find(c => c.name === 'minikube');
            assert.ok(minikubeContext);
            assert.strictEqual(minikubeContext.cluster, 'minikube');
            assert.strictEqual(minikubeContext.user, 'minikube');
            assert.strictEqual(minikubeContext.namespace, 'default');
            
            // Check production context
            const productionContext = config.contexts.find(c => c.name === 'production');
            assert.ok(productionContext);
            assert.strictEqual(productionContext.cluster, 'production-cluster');
            assert.strictEqual(productionContext.user, 'admin');
            assert.strictEqual(productionContext.namespace, 'production');
            
            // Check staging context
            const stagingContext = config.contexts.find(c => c.name === 'staging');
            assert.ok(stagingContext);
            assert.strictEqual(stagingContext.cluster, 'staging-cluster');
            assert.strictEqual(stagingContext.user, 'developer');
        });

        test('Should extract all users from kubeconfig', async () => {
            const config = await KubeconfigParser.parseKubeconfig(validKubeconfigPath);
            
            assert.strictEqual(config.users.length, 3);
            
            // Check minikube user
            const minikubeUser = config.users.find(u => u.name === 'minikube');
            assert.ok(minikubeUser);
            assert.ok(minikubeUser.clientCertificate);
            assert.ok(minikubeUser.clientKey);
            
            // Check admin user
            const adminUser = config.users.find(u => u.name === 'admin');
            assert.ok(adminUser);
            assert.ok(adminUser.clientCertificateData);
            assert.ok(adminUser.clientKeyData);
            
            // Check developer user
            const developerUser = config.users.find(u => u.name === 'developer');
            assert.ok(developerUser);
            assert.ok(developerUser.token);
        });

        test('Should extract current-context from kubeconfig', async () => {
            const config = await KubeconfigParser.parseKubeconfig(validKubeconfigPath);
            
            assert.strictEqual(config.currentContext, 'minikube');
        });

        test('Should handle empty kubeconfig file', async () => {
            const config = await KubeconfigParser.parseKubeconfig(emptyKubeconfigPath);
            
            assert.ok(config);
            assert.strictEqual(config.clusters.length, 0);
            assert.strictEqual(config.contexts.length, 0);
            assert.strictEqual(config.users.length, 0);
        });

        test('Should throw error when file does not exist', async () => {
            await assert.rejects(
                async () => {
                    await KubeconfigParser.parseKubeconfig(nonExistentPath);
                },
                /Kubeconfig file not found/
            );
        });

        test('Should throw error when file contains invalid YAML', async () => {
            await assert.rejects(
                async () => {
                    await KubeconfigParser.parseKubeconfig(invalidKubeconfigPath);
                },
                /Failed to parse kubeconfig/
            );
        });

        test('Should use getKubeconfigPath when no path is provided', async () => {
            // Set KUBECONFIG to our valid test file
            process.env.KUBECONFIG = validKubeconfigPath;
            
            const config = await KubeconfigParser.parseKubeconfig();
            
            assert.ok(config);
            assert.strictEqual(config.currentContext, 'minikube');
        });

        test('Should return typed ParsedKubeconfig object', async () => {
            const config: ParsedKubeconfig = await KubeconfigParser.parseKubeconfig(validKubeconfigPath);
            
            // TypeScript type checking ensures proper types
            assert.ok(config.clusters);
            assert.ok(config.contexts);
            assert.ok(config.users);
            
            // Verify cluster type
            if (config.clusters.length > 0) {
                const cluster = config.clusters[0];
                assert.ok(typeof cluster.name === 'string');
                assert.ok(typeof cluster.server === 'string');
            }
            
            // Verify context type
            if (config.contexts.length > 0) {
                const context = config.contexts[0];
                assert.ok(typeof context.name === 'string');
                assert.ok(typeof context.cluster === 'string');
                assert.ok(typeof context.user === 'string');
            }
            
            // Verify user type
            if (config.users.length > 0) {
                const user = config.users[0];
                assert.ok(typeof user.name === 'string');
            }
        });
    });

    suite('Edge Cases', () => {
        test('Should handle kubeconfig with missing optional fields', async () => {
            const config = await KubeconfigParser.parseKubeconfig(validKubeconfigPath);
            
            // Some contexts might not have namespace
            const stagingContext = config.contexts.find(c => c.name === 'staging');
            assert.ok(stagingContext);
            // namespace is optional, so it's okay if it's undefined
        });

        test('Should handle kubeconfig without current-context', async () => {
            const config = await KubeconfigParser.parseKubeconfig(emptyKubeconfigPath);
            
            // current-context is optional
            assert.strictEqual(config.currentContext, undefined);
        });
    });
});

