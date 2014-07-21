var packageAttributeBuilder = require('livefyre-package-attribute');
var packageJson = require('json!streamhub-hot-collections/../package.json');

module.exports = packageAttributeBuilder(packageJson);