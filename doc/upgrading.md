# Upgrading

## Versioning

- A **patch release** changes the last number (e.g. `0.0.3` -> `0.0.4`). These releases may fix bugs or add features, but your existing setup should continue to work just fine.
- A **minor release** changes the middle number (e.g. `0.0.4` -> `0.1.0`). These releases typically make considerable changes but are generally backward-compatible. Your existing setup should continue to work.
- A **major release** changes the first number (e.g. `0.1.5` -> `1.0.0`). These releases correspond to a major milestone and may contain breaking changes.

## Version Compatibility

| Plugin Version | Minimum Firebot Version |
| --- | --- |
| 0.0.1+ | Custom Firebot fork (contact TheStaticMage) |

:warning: This plugin depends on features that do not exist yet in Firebot ([feature request here](https://github.com/crowbartools/Firebot/issues/3347)). I have implemented these features in a custom fork of Firebot to enable this plugin. **This plugin will not work properly on out-of-the-box Firebot.** Be aware that running a custom fork of Firebot comes with risks: no support from anyone, the risk of becoming "stuck" if I disappear and no longer keep this up-to-date, and a much narrower audience to discover potential bugs. If you do not fully understand these risks or are not comfortable digging into the code to investigate and fix problems, you should not use this. The full source is available if you want to build it yourself: <https://github.com/TheStaticMage/Firebot/tree/running-release>. Compiled versions are not distributed.

## Upgrade Procedure

1. From the latest [Release](https://github.com/TheStaticMage/firebot-action-buttons/releases), download `action-buttons-<version>.js`.
2. Place the new `action-buttons-<version>.js` into your Firebot scripts directory (**File** > **Open Data Folder**, then select the "scripts" directory).
3. Go to **Settings** > **Scripts** > **Manage Startup Scripts**, find the plugin in the list, click **Edit** next to it, select the new `action-buttons-<version>.js` file, and click **Save**.
4. Restart Firebot.

Optional: Delete any older versions of this plugin from your Firebot scripts directory to keep it clean.

## Upgrade Notes

- :fire: Compatible with Firebot 5.65; earlier versions are not supported.
- :boom: No breaking changes are expected within the 0.0.x action buttons releases.
- :no_entry_sign: No deprecated features at this time.
