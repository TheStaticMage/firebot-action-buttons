import { Firebot, RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { Logger } from '@crowbartools/firebot-custom-scripts-types/types/modules/logger';
import { satisfies } from 'semver';
import { registerActionButtonsPanelComponent } from './components/action-buttons-panel-register';
import { registerActionButtonsEditorPoc } from './components/action-buttons-editor/proof-of-concept.register';
import { registerEffects } from './effects';
import { actionButtonManager } from './internal/action-button-manager';
import { registerReplaceVariables } from './variables';

export let firebot: RunRequest<any>;
export let logger: LogWrapper;
export let customChatPanelManager: any;

const pluginName = 'action-buttons';
const scriptVersion = '0.0.1';

const script: Firebot.CustomScript<any> = {
    getScriptManifest: () => {
        return {
            name: 'Action Buttons',
            description: 'Adds interactive action buttons to Firebot chat messages.',
            author: 'The Static Mage',
            version: scriptVersion,
            startupOnly: true,
            firebotVersion: '5'
        };
    },
    getDefaultParameters: () => {
        return {};
    },
    parametersUpdated: () => {
        // Parameters go here
    },
    run: async (runRequest) => {
        firebot = runRequest;
        logger = new LogWrapper(runRequest.modules.logger);
        logger.info(`${pluginName} initializing.`);

        // Check Firebot version compatibility
        const fbVersion = firebot.firebot.version;
        logger.debug(`Detected Firebot version: ${fbVersion}`);
        if (!satisfies(fbVersion, ">= 5.65.0-0", { includePrerelease: true })) {
            logger.error(`${pluginName} requires Firebot version 5.65.0 or higher (including prereleases). Detected version: ${fbVersion}. Please update Firebot to use this plugin.`);
            return;
        }

        actionButtonManager.setupListeners();
        registerActionButtonsPanelComponent();
        registerActionButtonsEditorPoc(runRequest.modules.uiExtensionManager);
        registerEffects();
        registerReplaceVariables();

        // Indicate successful initialization
        logger.info(`${pluginName} initialized successfully.`);
    },
    stop: async () => {
        // Clean up resources if needed
        logger.info(`${pluginName} stopped.`);
    }
};

class LogWrapper {
    private _logger: Logger;

    constructor(inLogger: Logger) {
        this._logger = inLogger;
    }

    info(message: string) {
        this._logger.info(`[${pluginName}] ${message}`);
    }

    error(message: string) {
        this._logger.error(`[${pluginName}] ${message}`);
    }

    debug(message: string) {
        this._logger.debug(`[${pluginName}] ${message}`);
    }

    warn(message: string) {
        this._logger.warn(`[${pluginName}] ${message}`);
    }
}

export default script;
