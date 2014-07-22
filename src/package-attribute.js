var packageAttributeBuilder = require('livefyre-package-attribute');
var packageJson = require('json!streamhub-map/../package.json');

module.exports = packageAttributeBuilder(packageJson);