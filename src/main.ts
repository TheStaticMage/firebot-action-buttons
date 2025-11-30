import { Firebot, RunRequest } from '@crowbartools/firebot-custom-scripts-types';
import { Logger } from '@crowbartools/firebot-custom-scripts-types/types/modules/logger';
import { checkVersionCompatibility } from '@thestaticmage/mage-platform-lib-client';
import { registerEffects } from './effects';

export let firebot: RunRequest<any>;
export let logger: LogWrapper;
export let customChatPanelManager: any;
export let uiExtensionManager: any;

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
        if (!checkVersionCompatibility(">= 5.65.0", fbVersion)) {
            logger.error(`${pluginName} requires Firebot version 5.65.0 or higher. Detected version: ${fbVersion}. Please update Firebot to use this plugin.`);
            return;
        }

        uiExtensionManager = runRequest.modules.uiExtensionManager;
        customChatPanelManager = runRequest.modules.customChatPanelManager;

        logger.debug(`uiExtensionManager available: ${!!uiExtensionManager}`);
        logger.debug(`customChatPanelManager available: ${!!customChatPanelManager}`);

        // Register the hello-world panel component for testing
        if (uiExtensionManager) {
            logger.info("Registering helloWorldPanel component...");
            try {
                uiExtensionManager.registerUIExtension({
                    id: "hello-world-test-panel",
                    providers: {
                        components: [{
                            name: "helloWorldPanel",
                            bindings: {},
                            template: `
                                <div ng-style="{ 'background': backgroundColor, 'padding': '15px', 'margin': '5px 0' }">
                                    <h3 style="color: white; margin: 0;">Hello world</h3>
                                    <button
                                        style="margin-top: 10px; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; color: black; background-color: hotpink;"
                                        ng-click="getViewerCount()"
                                        ng-disabled="isRequestInFlight">
                                        {{ viewerCountLabel }}
                                    </button>
                                </div>
                            `,
                            controller: ($scope: any, $interval: any, backendCommunicator: any) => {
                                const generateColor = () => {
                                    const hue = Math.floor(Math.random() * 360);
                                    return `hsl(${hue}, 80%, 60%)`;
                                };

                                $scope.backgroundColor = generateColor();
                                $scope.viewerCountLabel = 'Viewer count';
                                $scope.isRequestInFlight = false;

                                $scope.getViewerCount = async () => {
                                    if ($scope.isRequestInFlight) {
                                        return;
                                    }

                                    $scope.isRequestInFlight = true;
                                    $scope.viewerCountLabel = 'Loading...';

                                    try {
                                        const result = await backendCommunicator.fireEventAsync('get-viewer-count', {});
                                        $scope.viewerCountLabel = typeof result === 'number' ? `Viewers: ${result}` : `${result}`;
                                    } catch (error) {
                                        $scope.viewerCountLabel = 'Error getting count';
                                    } finally {
                                        $scope.isRequestInFlight = false;
                                    }
                                };

                                const intervalHandle = $interval(() => {
                                    $scope.backgroundColor = generateColor();
                                }, 500);

                                $scope.$on('$destroy', () => {
                                    if (intervalHandle) {
                                        $interval.cancel(intervalHandle);
                                    }
                                });
                            }
                        }]
                    }
                });
                logger.info("Successfully registered helloWorldPanel component.");
            } catch (error) {
                logger.error(`Failed to register helloWorldPanel component: ${error}`);
            }
        } else {
            logger.warn("uiExtensionManager not available. Cannot register components.");
        }

        // Register effects
        try {
            registerEffects();
        } catch (error) {
            logger.error(`Failed to register effects: ${error}`);
        }

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
