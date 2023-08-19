const { setWeb3Provider } = require('./src/config/web3');
const { setSingletonsConfig } = require('./src/config/singletons');

const { deprecate } = require('util');

const setEnvironment = deprecate((environment) => setSingletonsConfig({ abstraction: environment }),
  'The \'environment\' configuration option is deprecated, use \'singletons.abstraction\' instead.'
);

let configLoaded = false;

function configure (config) {
  if (!config) {
    // If there is a config already loaded keep it
    if (!configLoaded) {
      defaultConfigure();
      configLoaded = true;
    }
  } else {
    customConfigure(config);
    configLoaded = true;
  }
};

function defaultConfigure () {
  setWeb3Provider.default();
  setSingletonsConfig.default();
}

function customConfigure (config) {
  defaultConfigure();

  if ('provider' in config) {
    // The provider may be either an URL to an HTTP endpoint, or a complete provider object
    setWeb3Provider(config.provider);
  }

  if ('singletons' in config) {
    setSingletonsConfig(config.singletons);
  } else if ('environment' in config) {
    setEnvironment(config.environment);
  }
}

module.exports = configure;
