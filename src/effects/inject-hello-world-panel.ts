import { Firebot } from '@crowbartools/firebot-custom-scripts-types';
import { logger, customChatPanelManager } from '../main';

type EffectModel = {};

export const injectHelloWorldPanelEffect: Firebot.EffectType<EffectModel> = {
    definition: {
        id: "action-buttons:inject-hello-world-panel",
        name: "Inject Hello World Panel",
        description: "Injects a hot pink 'Hello world' panel into the chat feed for testing",
        icon: "fad fa-comment-alt-plus",
        categories: ["chat based"]
    },
    optionsTemplate: `
        <eos-container header="Inject Hello World Panel">
            <p>This effect will inject a hot pink panel with "Hello world" text into the chat feed.</p>
            <p style="color: #999; font-size: 12px; margin-top: 10px;">This is a test effect for the custom chat panel injection system.</p>
        </eos-container>
    `,
    onTriggerEvent: async (event) => {
        logger.info("=== EFFECT: Inject Hello World Panel ===");

        const result = {
            success: true,
            execution: {
                stop: false,
                bubbleStop: false
            }
        };

        try {
            logger.info("Attempting to inject helloWorldPanel into chat feed...");

            customChatPanelManager.injectPanel({
                componentName: "helloWorldPanel",
                componentData: {},
                position: "append"
            });

            logger.info("Successfully triggered panel injection via customChatPanelManager.");
            result.success = true;
        } catch (error) {
            logger.error(`Failed to inject hello-world panel: ${error}`);
            if (error instanceof Error) {
                logger.debug(`Error stack: ${error.stack}`);
            }
            result.success = false;
        }

        return result;
    }
};
