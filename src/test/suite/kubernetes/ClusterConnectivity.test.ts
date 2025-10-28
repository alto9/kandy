import * as assert from 'assert';
import { ClusterConnectivity } from '../../../kubernetes/ClusterConnectivity';
import { ClusterStatus } from '../../../kubernetes/ClusterTypes';

suite('ClusterConnectivity Test Suite', () => {
    test('checkConnectivity - returns Disconnected for invalid URL', async () => {
        const result = await ClusterConnectivity.checkConnectivity('https://invalid-nonexistent-cluster-12345.example.com');
        assert.strictEqual(result, ClusterStatus.Disconnected, 'Invalid cluster URL should return Disconnected status');
    });

    test('checkConnectivity - handles malformed URL gracefully', async () => {
        const result = await ClusterConnectivity.checkConnectivity('not-a-valid-url');
        assert.strictEqual(result, ClusterStatus.Disconnected, 'Malformed URL should return Disconnected status');
    });

    test('checkConnectivity - handles localhost unreachable', async () => {
        // Use a port that's likely not in use
        const result = await ClusterConnectivity.checkConnectivity('https://localhost:54321');
        assert.strictEqual(result, ClusterStatus.Disconnected, 'Unreachable localhost should return Disconnected status');
    });

    test('checkMultipleConnectivity - checks multiple clusters', async () => {
        const urls = [
            'https://invalid1.example.com',
            'https://invalid2.example.com',
            'https://localhost:54321'
        ];
        
        const results = await ClusterConnectivity.checkMultipleConnectivity(urls);
        
        assert.strictEqual(results.length, 3, 'Should return results for all URLs');
        assert.strictEqual(results[0], ClusterStatus.Disconnected, 'First URL should be disconnected');
        assert.strictEqual(results[1], ClusterStatus.Disconnected, 'Second URL should be disconnected');
        assert.strictEqual(results[2], ClusterStatus.Disconnected, 'Third URL should be disconnected');
    });

    test('checkMultipleConnectivity - handles empty array', async () => {
        const results = await ClusterConnectivity.checkMultipleConnectivity([]);
        assert.strictEqual(results.length, 0, 'Should return empty array for empty input');
    });
});

