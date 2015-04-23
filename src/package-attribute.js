var packageAttributeBuilder = require('livefyre-package-attribute');
var packageJson = require('json!livefyre-map/../package.json');

module.exports = packageAttributeBuilder(packageJson);
