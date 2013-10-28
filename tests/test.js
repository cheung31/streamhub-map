require([
	'jasmine-html',
	'jasmine-jquery',
	'jquery'],
function (jasmine, jasmineJQuery, $) {
	// Test!
	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 1000;

	var htmlReporter = new jasmine.HtmlReporter();

	jasmineEnv.addReporter(htmlReporter);

	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	};

	var specs = [];

    // Add your tests here
	//specs.push('tests/spec/MyView');
	//specs.push('tests/spec/MyOtherView');

	$(function(){
		require(specs, function(){
			jasmineEnv.execute();
		});
	});
});
