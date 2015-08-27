/**
 * Map of environment values to comments env values.
 * @type {Object}
 */
var ENV_MAP = {
  't402.livefyre.com': 'staging',
  'qa-ext.livefyre.com': 'qa',
  'fyre': 'dev'
};

module.exports = {
  getEnvironment: function (env) {
    return ENV_MAP[env] || 'production';
  }
};
