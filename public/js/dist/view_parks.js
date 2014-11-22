define([ "require", "exports", "module", "jquery", "block-activity-filter", "block-search-box", "slippymap" ], function(require, exports, module, jquery, BlockActivityFilter, BlockSearchBox, Slippymap) {
    "use strict";
    module.exports.blockSearchBox = new Slippymap(".slippymap", {}, function() {}), 
    module.exports.blockSearchBox = new BlockSearchBox(".block-search-box", {}, function() {}), 
    module.exports.blockActivityFilter = new BlockActivityFilter(".block-activity-filter", {}, function() {});
});