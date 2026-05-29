const { AndroidConfig, withStringsXml } = require('expo/config-plugins');

const DISPLAY_NAME = 'BP Log';
const DISPLAY_NAME_KEY = 'CFBundleDisplayName';

module.exports = function withAndroidDisplayNameString(config) {
  return withStringsXml(config, (config) => {
    const modResults = AndroidConfig.Strings.setStringItem(
      [
        {
          _: DISPLAY_NAME,
          $: {
            name: DISPLAY_NAME_KEY,
          },
        },
      ],
      config.modResults,
    );

    return {
      ...config,
      modResults,
    };
  });
};
