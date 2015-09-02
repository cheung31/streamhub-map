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
        assert.equal(util.getMapId('jennberney.0ebcb366', 'production'), 'livefyre.nbb9o5m9');
      });

      it('returns custom map id', function () {
        assert.equal(util.getMapId('livefyre.hknm2g26', 'production'), 'livefyre.hknm2g26');
        assert.equal(util.getMapId('customMapId', 'production'), 'customMapId');
      });
    });

    describe('development', function () {
      it('converts prod to dev map id', function () {
        assert.equal(util.getMapId('livefyre.hknm2g26', 'dev'), 'markdoten.n7lg09ia');
        assert.equal(util.getMapId('livefyre.hknm2g26', 'qa'), 'markdoten.n7lg09ia');
        assert.equal(util.getMapId('livefyre.hknm2g26', 'staging'), 'markdoten.n7lg09ia');
        assert.equal(util.getMapId('livefyre.nbb9o5m9', 'dev'), 'jennberney.0ebcb366');
        assert.equal(util.getMapId('livefyre.nbb9o5m9', 'qa'), 'jennberney.0ebcb366');
        assert.equal(util.getMapId('livefyre.nbb9o5m9', 'staging'), 'jennberney.0ebcb366');
      });

      it('returns custom map id', function () {
        assert.equal(util.getMapId('markdoten.n7lg09ia', 'dev'), 'markdoten.n7lg09ia');
        assert.equal(util.getMapId('markdoten.n7lg09ia', 'qa'), 'markdoten.n7lg09ia');
        assert.equal(util.getMapId('markdoten.n7lg09ia', 'staging'), 'markdoten.n7lg09ia');
        assert.equal(util.getMapId('jennberney.0ebcb366', 'dev'), 'jennberney.0ebcb366');
        assert.equal(util.getMapId('jennberney.0ebcb366', 'qa'), 'jennberney.0ebcb366');
        assert.equal(util.getMapId('jennberney.0ebcb366', 'staging'), 'jennberney.0ebcb366');
        assert.equal(util.getMapId('customMapId', 'dev'), 'customMapId');
        assert.equal(util.getMapId('customMapId', 'qa'), 'customMapId');
        assert.equal(util.getMapId('customMapId', 'staging'), 'customMapId');
      });
    });
  });
});
