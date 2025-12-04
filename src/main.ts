import { Firebot, RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { Logger } from '@crowbartools/firebot-custom-scripts-types/types/modules/logger';
import { satisfies } from 'semver';
import { registerActionButtonsPanelComponent } from './components/action-buttons-panel-register';
import { registerActionButtonsEditor } from './components/action-buttons-editor/action-buttons-editor.register';
import { registerEffects } from './effects';
import { actionButtonManager } from './internal/action-button-manager';
import { registerReplaceVariables } from './variables';

export let firebot: RunRequest<any>;
export let logger: LogWrapper;

const pluginName = 'action-buttons';
const scriptVersion = '0.0.1';

type ForkAwareFirebot = RunRequest<any>['firebot'] & {
    mageForkVersion?: string | number;
};

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

        // Check Firebot fork compatibility
        const forkInfo = firebot.firebot as ForkAwareFirebot;
        const forkVersionRaw = forkInfo.mageForkVersion;
        logger.debug(`Detected Firebot fork marker: ${forkVersionRaw ?? 'absent'}`);

        if (forkVersionRaw === undefined) {
            logger.error(`${pluginName} requires TheStaticMage's Firebot fork. Detected standard Firebot build. Please install the forked Firebot build to use this plugin. Details: https://github.com/TheStaticMage/firebot-action-buttons/?tab=readme-ov-file#compatibility`);
            return;
        }

        const forkVersion = Number(forkVersionRaw);
        if (Number.isNaN(forkVersion) || typeof forkVersionRaw !== 'number') {
            logger.error(`${pluginName} requires TheStaticMage's Firebot fork. Could not parse fork version (got: ${JSON.stringify(forkVersionRaw)}). Please install the forked Firebot build to use this plugin. Details: https://github.com/TheStaticMage/firebot-action-buttons/?tab=readme-ov-file#compatibility`);
            return;
        }


        if (forkVersion === 0) {
            logger.info(`Detected Firebot fork version running from source. Unable to verify compatibility. If something doesn't work as expected, please ensure you are using the latest version of TheStaticMage's Firebot fork.`);
        }

        actionButtonManager.setupListeners();
        registerActionButtonsPanelComponent();
        registerActionButtonsEditor();
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
