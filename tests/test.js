require([
    'jasmine',
    'jasmine-html',
    'jquery'],
function (jasmine, jasmineHtml, $) {
    // Test!
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    // Copy jasmine globals
    ['spyOn', 'waitsFor', 'waits', 'runs', 'expect'].forEach(function (key) {
        window[key] = function () {
            var spec = jasmine.getEnv().currentSpec;
            return spec[key].apply(spec, arguments);
        };
    });
    ['beforeEach', 'afterEach', 'describe', 'it', 'xit', 'xdescribe'].forEach(function (key) {
        window[key] = jasmineEnv[key].bind(jasmineEnv);
    });

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
    };

    var specs = [];

    // Add your tests here
    specs.push('tests/spec/main');

    $(function(){
        require(specs, function(){
            jasmineEnv.execute();
        });
    });
});
