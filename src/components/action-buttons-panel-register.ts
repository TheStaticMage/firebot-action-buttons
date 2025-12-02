import { firebot, logger } from '../main';

export function registerActionButtonsPanelComponent(): void {
    logger.info('Registering action-buttons-panel component');

    const { uiExtensionManager } = firebot.modules;
    if (uiExtensionManager) {
        uiExtensionManager.registerUIExtension({
            id: 'action-buttons-panel-extension',
            providers: {
                components: [{
                    name: 'actionButtonsPanel',
                    bindings: {},
                    template: `
                        <style>
                            .action-buttons-panel-wrapper {
                                width: 100%;
                            }
                            .action-buttons-panel-wrapper:not(:has(.panel-message-container)) {
                                background: #2c3e50;
                                border: 1px solid #29292988;
                                border-radius: 4px;
                            }
                            .panel-message-container {
                                display: flex;
                                padding: 6px;
                                padding-left: 10px;
                                align-items: flex-start;
                                border-bottom: 1px solid #29292988;
                            }
                            .panel-message-icon {
                                font-size: 25px;
                                margin-right: 10px;
                                flex-shrink: 0;
                            }
                            .panel-message-text {
                                margin: auto 0;
                                word-break: break-word;
                                flex: 1;
                            }
                            .action-buttons-panel {
                                display: flex;
                                gap: 10px;
                                padding: 10px;
                                width: 100%;
                                justify-content: flex-start;
                            }
                            .action-buttons-panel.align-center {
                                justify-content: center;
                            }
                            .action-buttons-panel.align-right {
                                justify-content: flex-end;
                            }
                            .action-buttons-panel.with-message {
                                padding-top: 5px;
                                border-top: none;
                            }
                            .action-button {
                                padding: 8px 16px;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                display: inline-flex;
                                align-items: center;
                                gap: 6px;
                                font-size: 14px;
                                transition: opacity 0.2s;
                                white-space: nowrap;
                            }
                            .action-button:hover {
                                opacity: 0.8;
                            }
                            .action-button i {
                                font-size: 16px;
                            }
                        </style>
                        <div class="action-buttons-panel-wrapper" ng-style="backgroundColor && {'background-color': backgroundColor}">
                            <div ng-if="hasMessage" class="panel-message-container">
                                <span ng-if="messageIcon" class="panel-message-icon">
                                    <i ng-class="getIconClass(messageIcon)"></i>
                                </span>
                                <span ng-if="messageText" class="panel-message-text" ng-bind-html="sanitizedMessageHtml"></span>
                            </div>
                            <div class="action-buttons-panel" ng-class="{'with-message': hasMessage}">
                            <div style="flex: 1; display: flex; gap: 10px;">
                                <button ng-repeat="button in buttons | filter:{alignment:'left'} | filter:filterVisible track by button.uuid"
                                        class="action-button"
                                        ng-click="clickButton(button.uuid)"
                                        ng-style="{backgroundColor: button.backgroundColor, color: button.foregroundColor}"
                                        title="{{button.name}}">
                                    <i class="{{button.icon}}" ng-if="button.icon"></i>
                                    <span>{{button.name}}</span>
                                </button>
                            </div>
                            <div style="flex: 0; display: flex; gap: 10px;">
                                <button ng-repeat="button in buttons | filter:{alignment:'center'} | filter:filterVisible track by button.uuid"
                                        class="action-button"
                                        ng-click="clickButton(button.uuid)"
                                        ng-style="{backgroundColor: button.backgroundColor, color: button.foregroundColor}"
                                        title="{{button.name}}">
                                    <i class="{{button.icon}}" ng-if="button.icon"></i>
                                    <span>{{button.name}}</span>
                                </button>
                            </div>
                            <div style="flex: 1; display: flex; gap: 10px; justify-content: flex-end;">
                                <button ng-repeat="button in buttons | filter:{alignment:'right'} | filter:filterVisible track by button.uuid"
                                        class="action-button"
                                        ng-click="clickButton(button.uuid)"
                                        ng-style="{backgroundColor: button.backgroundColor, color: button.foregroundColor}"
                                        title="{{button.name}}">
                                    <i class="{{button.icon}}" ng-if="button.icon"></i>
                                    <span>{{button.name}}</span>
                                </button>
                            </div>
                            </div>
                        </div>
                    `,
                    controller: ($scope: any, backendCommunicator: any, logger: any) => {
                        const ctrl: any = {};
                        const instanceId = Math.random().toString(36).substring(7);
                        ctrl.buttons = [];
                        $scope.buttons = ctrl.buttons;

                        $scope.hasMessage = false;
                        $scope.messageText = '';
                        $scope.messageIcon = '';
                        $scope.backgroundColor = undefined;

                        $scope.getIconClass = function(icon: string) {
                            if (!icon) {
                                return '';
                            }
                            const classes = icon.split(' ');
                            if (classes.length === 1) {
                                return `far ${classes[0]}`;
                            }
                            return classes.join(' ');
                        };

                        $scope.sanitizedMessageHtml = '';

                        const renderMessageHtml = (text: string) => {
                            if (!text) {
                                return '';
                            }
                            try {
                                return backendCommunicator.fireEventSync('action-buttons:render-markdown', text);
                            } catch (error) {
                                logger.error(`[Frontend:${instanceId}] Failed to render message markdown: ${error}`);
                                return text;
                            }
                        };

                        const loadButtonsForPanel = (panelId: string) => {
                            const currentPanelId = panelId;
                            try {
                                const buttons = backendCommunicator.fireEventSync('action-buttons:get-panel-buttons', currentPanelId);

                                if (!buttons || !Array.isArray(buttons)) {
                                    logger.error(`[Frontend:${instanceId}] Received invalid buttons response for panel ${currentPanelId}`);
                                    return;
                                }

                                const buttonsCopy = JSON.parse(JSON.stringify(buttons));

                                $scope.$applyAsync(() => {
                                    const actualPanelId = $scope.$parent?.componentData?.panelId;
                                    if (actualPanelId !== currentPanelId) {
                                        logger.warn(`[Frontend:${instanceId}] Panel ID mismatch! Requested ${currentPanelId} but current panel is ${actualPanelId}. Ignoring.`);
                                        return;
                                    }

                                    ctrl.buttons = buttonsCopy;
                                    $scope.buttons = buttonsCopy;
                                });
                            } catch (error) {
                                logger.error(`[Frontend:${instanceId}] Failed to load buttons for panel ${currentPanelId}: ${error}`);
                            }
                        };

                        const syncComponentData = () => {
                            const data = $scope.$parent?.componentData;
                            if (!data || !data.panelId) {
                                return;
                            }

                            loadButtonsForPanel(data.panelId);

                            $scope.hasMessage = data.hasMessage || false;
                            $scope.messageText = data.messageText || '';
                            $scope.messageIcon = data.messageIcon || '';
                            $scope.backgroundColor = data.backgroundColor;
                            $scope.sanitizedMessageHtml = $scope.messageText ? renderMessageHtml($scope.messageText) : '';
                        };

                        syncComponentData();

                        $scope.$watch(() => $scope.$parent?.componentData?.panelId, (newVal: string, oldVal: string) => {
                            if (newVal && newVal !== oldVal) {
                                loadButtonsForPanel(newVal);
                            }
                        });

                        $scope.$watch(() => $scope.$parent?.componentData?.messageText, (newVal: string, oldVal: string) => {
                            if (newVal !== oldVal) {
                                $scope.messageText = newVal || '';
                                $scope.sanitizedMessageHtml = $scope.messageText ? renderMessageHtml($scope.messageText) : '';
                            }
                        });

                        $scope.$watch(() => $scope.$parent?.componentData?.messageIcon, (newVal: string, oldVal: string) => {
                            if (newVal !== oldVal) {
                                $scope.messageIcon = newVal || '';
                            }
                        });

                        $scope.$watch(() => $scope.$parent?.componentData?.hasMessage, (newVal: boolean, oldVal: boolean) => {
                            if (newVal !== oldVal) {
                                $scope.hasMessage = newVal;
                            }
                        });

                        $scope.$watch(() => $scope.$parent?.componentData?.backgroundColor, (newVal: string, oldVal: string) => {
                            if (newVal !== oldVal) {
                                $scope.backgroundColor = newVal;
                            }
                        });

                        backendCommunicator.on('action-buttons:panel-updated', (panelId: string) => {
                            if (panelId === $scope.$parent?.componentData?.panelId) {
                                logger.debug(`Panel ${panelId} was updated, reloading buttons`);
                                loadButtonsForPanel(panelId);
                            }
                        });

                        $scope.getButtonsByAlignment = function(alignment: string) {
                            if (!$scope.buttons || !Array.isArray($scope.buttons)) {
                                logger.debug(`getButtonsByAlignment('${alignment}'): buttons not ready`);
                                return [];
                            }
                            const filtered = $scope.buttons.filter((b: any) => !b.hidden && b.alignment === alignment);
                            logger.debug(`getButtonsByAlignment('${alignment}'): returned ${filtered.length} buttons`);
                            return filtered;
                        };

                        $scope.getPanelAlignment = function() {
                            if (!$scope.buttons || $scope.buttons.length === 0) {
                                return '';
                            }
                            const alignment = $scope.buttons[0]?.alignment;
                            if (alignment === 'center') {
                                return 'align-center';
                            } else if (alignment === 'right') {
                                return 'align-right';
                            }
                            return '';
                        };

                        $scope.getButtonStyle = function(button: any) {
                            return {
                                backgroundColor: button.backgroundColor,
                                color: button.foregroundColor
                            };
                        };

                        $scope.filterVisible = function(button: any) {
                            return !button.hidden;
                        };

                        $scope.clickButton = async function(uuid: string) {
                            logger.debug(`Sending action-button:click event for UUID: ${uuid}`);
                            try {
                                await backendCommunicator.fireEventAsync('action-button:click', uuid);
                                logger.debug(`Successfully sent click event for UUID: ${uuid}`);
                            } catch (error) {
                                logger.error(`Failed to send click event for UUID: ${uuid}: ${error}`);
                            }
                        };
                    }
                }]
            }
        });
    }
}
