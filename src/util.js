/**
 * Environment map.
 * @type {Object}
 */
var ENV = {
  PRODUCTION: 'production',
  STAGING: 'staging',
  QA: 'qa',
  DEV: 'dev'
};

/**
 * Map of environment values to comments env values.
 * @type {Object}
 */
var ENV_MAP = {
  't402.livefyre.com': ENV.STAGING,
  'qa-ext.livefyre.com': ENV.QA,
  'fyre': ENV.DEV
};

var MAP_IDS = {
  LIGHT: 'markdoten.n7lg09ia',
  DARK: 'jennberney.0ebcb366',
  LIGHT_DEV: 'livefyredev.3d29367a',
  DARK_DEV: 'livefyredev.nbbfhing',
  LIGHT_PROD: 'livefyre.hknm2g26',
  DARK_PROD: 'livefyre.nbb9o5m9'
};

/**
 * Map of dev map ids to production map ids.
 * @type {Object}
 */
var DEV_TO_PROD_MAP = {};
DEV_TO_PROD_MAP[MAP_IDS.LIGHT] = MAP_IDS.LIGHT_PROD;
DEV_TO_PROD_MAP[MAP_IDS.LIGHT_DEV] = MAP_IDS.LIGHT_PROD;
DEV_TO_PROD_MAP[MAP_IDS.DARK] = MAP_IDS.DARK_PROD;
DEV_TO_PROD_MAP[MAP_IDS.DARK_DEV] = MAP_IDS.DARK_PROD;

/**
 * Map of production map ids to dev map ids.
 * @type {Object}
 */
var PROD_TO_DEV_MAP = {};
PROD_TO_DEV_MAP[MAP_IDS.LIGHT] = MAP_IDS.LIGHT_DEV;
PROD_TO_DEV_MAP[MAP_IDS.LIGHT_PROD] = MAP_IDS.LIGHT_DEV;
PROD_TO_DEV_MAP[MAP_IDS.DARK] = MAP_IDS.DARK_DEV;
PROD_TO_DEV_MAP[MAP_IDS.DARK_PROD] = MAP_IDS.DARK_DEV;

module.exports = {
  /**
   * Get an environment value that is more useful than the ones that are sent
   * in the collection object. If there is no environment provided, it defaults
   * to production.
   * @param {string} env
   * @return {string}
   */
  getEnvironment: function (env) {
    return ENV_MAP[env] || ENV.PRODUCTION;
  },

  /**
   * Get a map id based on the current map id and the environment that it is
   * being loaded in. This switches between environments if it needs to so
   * that only production map ids are used on production.
   * @param {string} mapId
   * @param {string} env
   * @return {string}
   */
  getMapId: function (mapId, env) {
    if (env === ENV.PRODUCTION) {
      return DEV_TO_PROD_MAP[mapId] || mapId;
    }
    return PROD_TO_DEV_MAP[mapId] || mapId;
  }
};
