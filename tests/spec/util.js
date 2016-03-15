var assert = require('chai').assert;
var util = require('livefyre-map/util');

describe('src/util.js', function () {
  it('getAccessToken', function () {
    assert.equal(util.getAccessToken('dev'), 'pk.eyJ1IjoibGl2ZWZ5cmVkZXYiLCJhIjoiZWY0NWM2ODZmMTk4M2Y1Mzk1NzNmNzI2YjZkYmMyYzgifQ.0gv8fupj_iCRA1eYwlTPiQ');
    assert.equal(util.getAccessToken('qa'), 'pk.eyJ1IjoibGl2ZWZ5cmVkZXYiLCJhIjoiZWY0NWM2ODZmMTk4M2Y1Mzk1NzNmNzI2YjZkYmMyYzgifQ.0gv8fupj_iCRA1eYwlTPiQ');
    assert.equal(util.getAccessToken('staging'), 'pk.eyJ1IjoibGl2ZWZ5cmVkZXYiLCJhIjoiZWY0NWM2ODZmMTk4M2Y1Mzk1NzNmNzI2YjZkYmMyYzgifQ.0gv8fupj_iCRA1eYwlTPiQ');
    assert.equal(util.getAccessToken('production'), 'pk.eyJ1IjoibGl2ZWZ5cmUiLCJhIjoiNm4zY3lzbyJ9.Iu21uK2Du2i7fQlSG9CLfA');
  });

  it('getEnvironment', function () {
    assert.equal(util.getEnvironment('fyre'), 'dev');
    assert.equal(util.getEnvironment('qa-ext.livefyre.com'), 'qa');
    assert.equal(util.getEnvironment('t402.livefyre.com'), 'staging');
    assert.equal(util.getEnvironment('something'), 'production');
  });

  describe('getMapId', function () {
    describe('production', function () {
      it('works if no mapId is provided', function () {
        assert.equal(util.getMapId('production'), 'livefyre.hknm2g26');
      });

      it('converts dev to prod map id', function () {
        assert.equal(util.getMapId('production', 'markdoten.n7lg09ia'), 'livefyre.hknm2g26');
        assert.equal(util.getMapId('production', 'livefyredev.3d29367a'), 'livefyre.hknm2g26');
        assert.equal(util.getMapId('production', 'livefyre.hknm2g26'), 'livefyre.hknm2g26');
        assert.equal(util.getMapId('production', 'jennberney.0ebcb366'), 'livefyre.ml6m9529');
        assert.equal(util.getMapId('production', 'livefyredev.0e3fbdf3'), 'livefyre.ml6m9529');
        assert.equal(util.getMapId('production', 'livefyre.nbb9o5m9'), 'livefyre.ml6m9529');
      });

      it('returns custom map id', function () {
        assert.equal(util.getMapId('production', 'livefyre.hknm2g26'), 'livefyre.hknm2g26');
        assert.equal(util.getMapId('production', 'livefyre.ml6m9529'), 'livefyre.ml6m9529');
        assert.equal(util.getMapId('production', 'customMapId'), 'customMapId');
      });
    });

    describe('development', function () {
      it('works if no mapId is provided', function () {
        assert.equal(util.getMapId('dev'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('qa'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('staging'), 'livefyredev.3d29367a');
      });

      it('converts prod to dev map id', function () {
        assert.equal(util.getMapId('dev', 'livefyre.hknm2g26'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('qa', 'livefyre.hknm2g26'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('staging', 'livefyre.hknm2g26'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('dev', 'livefyre.ml6m9529'), 'livefyredev.0e3fbdf3');
        assert.equal(util.getMapId('qa', 'livefyre.ml6m9529'), 'livefyredev.0e3fbdf3');
        assert.equal(util.getMapId('staging', 'livefyre.ml6m9529'), 'livefyredev.0e3fbdf3');
        assert.equal(util.getMapId('dev', 'livefyre.nbb9o5m9'), 'livefyredev.0e3fbdf3');
        assert.equal(util.getMapId('qa', 'livefyre.nbb9o5m9'), 'livefyredev.0e3fbdf3');
        assert.equal(util.getMapId('staging', 'livefyre.nbb9o5m9'), 'livefyredev.0e3fbdf3');
      });

      it('converts lower than dev map ids to dev map ids', function () {
        assert.equal(util.getMapId('dev', 'markdoten.n7lg09ia'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('qa', 'markdoten.n7lg09ia'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('staging', 'markdoten.n7lg09ia'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('dev', 'jennberney.0ebcb366'), 'livefyredev.0e3fbdf3');
        assert.equal(util.getMapId('qa', 'jennberney.0ebcb366'), 'livefyredev.0e3fbdf3');
        assert.equal(util.getMapId('staging', 'jennberney.0ebcb366'), 'livefyredev.0e3fbdf3');
      });

      it('returns custom map id', function () {
        assert.equal(util.getMapId('dev', 'livefyredev.3d29367a'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('qa', 'livefyredev.3d29367a'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('staging', 'livefyredev.3d29367a'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('dev', 'livefyredev.0e3fbdf3'), 'livefyredev.0e3fbdf3');
        assert.equal(util.getMapId('qa', 'livefyredev.0e3fbdf3'), 'livefyredev.0e3fbdf3');
        assert.equal(util.getMapId('staging', 'livefyredev.0e3fbdf3'), 'livefyredev.0e3fbdf3');
        assert.equal(util.getMapId('dev', 'customMapId'), 'customMapId');
        assert.equal(util.getMapId('qa', 'customMapId'), 'customMapId');
        assert.equal(util.getMapId('staging', 'customMapId'), 'customMapId');
      });
    });
  });
});
