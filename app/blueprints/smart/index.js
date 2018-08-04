module.exports = {
  description() {
    return 'Generates a smart (redux) component';
  },
  fileMapTokens() {
    return {
      __smart__: options => {
        return options.settings.getSetting('smartPath');
      }
    };
  }
};
