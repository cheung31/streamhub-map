var assert = require('chai').assert;
var util = require('livefyre-map/util');

describe('src/util.js', function() {
  it('getEnvironment', function () {
    assert.equal(util.getEnvironment('fyre'), 'dev');
    assert.equal(util.getEnvironment('qa-ext.livefyre.com'), 'qa');
    assert.equal(util.getEnvironment('t402.livefyre.com'), 'staging');
    assert.equal(util.getEnvironment('something'), 'production');
  });

  describe('getMapId', function () {
    describe('production', function () {
      it('converts dev to prod map id', function () {
        assert.equal(util.getMapId('markdoten.n7lg09ia', 'production'), 'livefyre.hknm2g26');
        assert.equal(util.getMapId('livefyredev.3d29367a', 'production'), 'livefyre.hknm2g26');
        assert.equal(util.getMapId('jennberney.0ebcb366', 'production'), 'livefyre.nbb9o5m9');
        assert.equal(util.getMapId('livefyredev.nbbfhing', 'production'), 'livefyre.nbb9o5m9');
      });

      it('returns custom map id', function () {
        assert.equal(util.getMapId('livefyre.hknm2g26', 'production'), 'livefyre.hknm2g26');
        assert.equal(util.getMapId('livefyre.nbb9o5m9', 'production'), 'livefyre.nbb9o5m9');
        assert.equal(util.getMapId('customMapId', 'production'), 'customMapId');
      });
    });

    describe('development', function () {
      it('converts prod to dev map id', function () {
        assert.equal(util.getMapId('livefyre.hknm2g26', 'dev'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('livefyre.hknm2g26', 'qa'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('livefyre.hknm2g26', 'staging'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('livefyre.nbb9o5m9', 'dev'), 'livefyredev.nbbfhing');
        assert.equal(util.getMapId('livefyre.nbb9o5m9', 'qa'), 'livefyredev.nbbfhing');
        assert.equal(util.getMapId('livefyre.nbb9o5m9', 'staging'), 'livefyredev.nbbfhing');
      });

      it('converts lower than dev map ids to dev map ids', function () {
        assert.equal(util.getMapId('markdoten.n7lg09ia', 'dev'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('markdoten.n7lg09ia', 'qa'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('markdoten.n7lg09ia', 'staging'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('jennberney.0ebcb366', 'dev'), 'livefyredev.nbbfhing');
        assert.equal(util.getMapId('jennberney.0ebcb366', 'qa'), 'livefyredev.nbbfhing');
        assert.equal(util.getMapId('jennberney.0ebcb366', 'staging'), 'livefyredev.nbbfhing');
      });

      it('returns custom map id', function () {
        assert.equal(util.getMapId('livefyredev.3d29367a', 'dev'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('livefyredev.3d29367a', 'qa'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('livefyredev.3d29367a', 'staging'), 'livefyredev.3d29367a');
        assert.equal(util.getMapId('livefyredev.nbbfhing', 'dev'), 'livefyredev.nbbfhing');
        assert.equal(util.getMapId('livefyredev.nbbfhing', 'qa'), 'livefyredev.nbbfhing');
        assert.equal(util.getMapId('livefyredev.nbbfhing', 'staging'), 'livefyredev.nbbfhing');
        assert.equal(util.getMapId('customMapId', 'dev'), 'customMapId');
        assert.equal(util.getMapId('customMapId', 'qa'), 'customMapId');
        assert.equal(util.getMapId('customMapId', 'staging'), 'customMapId');
      });
    });
  });
});
