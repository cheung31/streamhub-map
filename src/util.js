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
  DARK_DEV: 'livefyredev.0e3fbdf3',
  DARK_PROD: 'livefyre.ml6m9529',
  LIGHT_DEV: 'livefyredev.3d29367a',
  LIGHT_PROD: 'livefyre.hknm2g26'
};

var ENV_MAP_IDS = {
  DARK: [
    'jennberney.0ebcb366',
    'livefyredev.0e3fbdf3',
    'livefyre.ml6m9529',
    'livefyre.nbb9o5m9'
  ],
  LIGHT: [
    'markdoten.n7lg09ia',
    'livefyredev.3d29367a',
    'livefyre.hknm2g26'
  ]
};

module.exports = {
  /**
   * Get an access token based on the environment.
   * @param {string} env
   * @return {string}
   */
  getAccessToken: function (env) {
    if (env === ENV.PRODUCTION) {
      return 'pk.eyJ1IjoibGl2ZWZ5cmUiLCJhIjoiNm4zY3lzbyJ9.Iu21uK2Du2i7fQlSG9CLfA';
    }
    return 'pk.eyJ1IjoibGl2ZWZ5cmVkZXYiLCJhIjoiZWY0NWM2ODZmMTk4M2Y1Mzk1NzNmNzI2YjZkYmMyYzgifQ.0gv8fupj_iCRA1eYwlTPiQ';
  },

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
   * @param {string} env
   * @param {string=} opt_mapId
   * @return {string}
   */
  getMapId: function (env, opt_mapId) {
    var isProd = env === ENV.PRODUCTION;
    var mapTheme;
    var theme;

    // If the mapId isn't set, use light as the default.
    if (!opt_mapId) {
      return MAP_IDS['LIGHT_' + (isProd ? 'PROD' : 'DEV')];
    }

    // Loop through all themes (light and dark) within the environment-specific
    // map-id map and look for the provided `mapId` value within each array. If
    // its present, grab the theme so that we can use the theme with the current
    // environment to pick the correct map id.
    for (theme in ENV_MAP_IDS) {
      if (!ENV_MAP_IDS.hasOwnProperty(theme)) {
        continue;
      }
      if (ENV_MAP_IDS[theme].indexOf(opt_mapId) > -1) {
        mapTheme = theme;
        break;
      }
    }

    // `mapId` was not found within the env maps, so return the provided `mapId`.
    if (!mapTheme) {
      return opt_mapId;
    }

    // Use the theme and environment to craft a map key to fetch the correct
    // environment and theme specific mapId value.
    return MAP_IDS[mapTheme + '_' + (isProd ? 'PROD' : 'DEV')];
  }
};
