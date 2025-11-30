import { firebot, logger } from '../main';
import { injectHelloWorldPanelEffect } from './inject-hello-world-panel';

export function registerEffects(): void {
    const { effectManager } = firebot.modules;

    logger.info("Registering action-buttons effects...");

    effectManager.registerEffect(injectHelloWorldPanelEffect);
    logger.debug("Registered: Inject Hello World Panel effect");

    logger.info("Action Buttons effects registered successfully.");
}
