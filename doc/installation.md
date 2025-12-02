# Installation

| Plugin Version | Minimum Firebot Version |
| --- | --- |
| 0.0.1+ | Custom Firebot fork (contact TheStaticMage) |

:warning: This plugin depends on features that do not exist yet in Firebot ([feature request here](https://github.com/crowbartools/Firebot/issues/3347)). I have implemented these features in a custom fork of Firebot to enable this plugin. **This plugin will not work properly on out-of-the-box Firebot.** Be aware that running a custom fork of Firebot comes with risks: no support from anyone, the risk of becoming "stuck" if I disappear and no longer keep this up-to-date, and a much narrower audience to discover potential bugs. If you do not fully understand these risks or are not comfortable digging into the code to investigate and fix problems, you should not use this. The full source is available if you want to build it yourself: <https://github.com/TheStaticMage/Firebot/tree/running-release>. Compiled versions are not distributed.

## Installation: Plugin

1. Enable custom scripts in Firebot (**Settings** > **Scripts**) if you have not already done so.
2. From the latest [Release](https://github.com/TheStaticMage/firebot-action-buttons/releases), download `action-buttons-<version>.js` into your Firebot scripts directory (**File** > **Open Data Folder**, then select the "scripts" directory).
3. Go to **Settings** > **Scripts** > **Manage Startup Scripts** > **Add New Script** and add the `action-buttons-<version>.js` script.
4. Restart Firebot. (The plugin will _not_ load until you restart Firebot.)

## Configuration

The Action Buttons plugin is designed to work with the Firebot custom chat panel injection system. Once installed, it will be ready to inject interactive buttons into chat messages. Configuration happens at the script/integration level when you set up your custom workflows to use the action button features.

## Testing (Optional)

- Start Firebot after installation and confirm the plugin loads without errors.
- Trigger a basic workflow to ensure the plugin initializes as expected.
