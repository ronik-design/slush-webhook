'use strict';

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const clonedeep = require('lodash.clonedeep');

const loadConfig = function (configPath) {
  const filepath = path.resolve(configPath);
  const rawConfig = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'));
  const config = clonedeep(rawConfig);

  config.base = config.base || path.resolve('.');
  config.source = path.resolve(config.base, config.source);
  config.destination = path.resolve(config.base, config.destination);
  config.build = path.resolve(config.base, config.build);

  return config;
};

module.exports = loadConfig;
