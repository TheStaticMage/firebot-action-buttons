/* eslint-disable @typescript-eslint/unbound-method */
import script from '../main';

describe('Smoke Tests', () => {
    it('should export a script object', () => {
        expect(script).toBeDefined();
    });

    it('should have a getScriptManifest method', () => {
        expect(script.getScriptManifest).toBeDefined();
        expect(typeof script.getScriptManifest).toBe('function');
    });

    it('should have a getDefaultParameters method', () => {
        expect(script.getDefaultParameters).toBeDefined();
        expect(typeof script.getDefaultParameters).toBe('function');
    });

    it('should have a parametersUpdated method', () => {
        expect(script.parametersUpdated).toBeDefined();
        expect(typeof script.parametersUpdated).toBe('function');
    });

    it('should have a run method', () => {
        expect(script.run).toBeDefined();
        expect(typeof script.run).toBe('function');
    });

    it('should have a stop method', () => {
        expect(script.stop).toBeDefined();
        expect(typeof script.stop).toBe('function');
    });

    it('getScriptManifest should return a valid manifest', async () => {
        const manifest = await script.getScriptManifest();
        expect(manifest).toBeDefined();
        expect(manifest.name).toBeDefined();
        expect(manifest.description).toBeDefined();
        expect(manifest.author).toBeDefined();
        expect(manifest.version).toBeDefined();
    });

    it('getDefaultParameters should return an object', () => {
        const params = script.getDefaultParameters();
        expect(params).toBeDefined();
        expect(typeof params).toBe('object');
    });
});
