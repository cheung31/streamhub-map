/** @module MockStream */

define(['streamhub-sdk', 'streamhub-sdk/content/types/livefyre-content'],
function (Hub, LivefyreContent) {

    var MockStream = function(opts) {
        Hub.Stream.call(this, opts);
    };
    $.extend(MockStream.prototype, Hub.Stream.prototype);
    
    /**
     * Start mocking the stream by adding 3 pieces of content
     * to the collection.
     * @return {MockStream} this 
     */
    MockStream.prototype._read = function () {
        for (var i = 0; i < 50; i++) {
            this._push(this._createMockContent());
        }
        this._endRead();
    };
    
    MockStream.prototype._createMockContent = function() {
        this._mockContentId = this._mockContentId || 0;
        var state = {
            event: Date.now()*1000 + this._mockContentId,
            ancestorId: null,
            annotations: {},
            author: this._createMockAuthor(this._mockContentId),
            authorId: this._mockContentId + "@mock.com",
            replaces: null,
            parentId: null,
            source: 5,
            transport: 1,
            type: 0,
            vis: 1,
            content: {
            id: this._mockContentId++,
                bodyHtml: "This is message " + this._mockContentId,
                createdAt: Math.floor(Date.now() / 1000) + this._mockContentId,
                updatedAt: Math.floor(Date.now() / 1000) + this._mockContentId,
            }
        };
        return new LivefyreContent(state);
    };
    
    MockStream.prototype._createMockAuthor = function(id) {
        return {
            avatar: "http://gravatar.com/avatar/e23293c6dfc25b86762b045336233add/?s=50&d=http://d10g4z0y9q0fip.cloudfront.net/a/anon/50.jpg",
            displayName: "Mock " + id,
            id: id + "@mock.com",
            profileUrl: "",
            tags: []
        }
    };
    
    return MockStream;
});