///<reference path="main.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ArticleJano = /** @class */ (function (_super) {
    __extends(ArticleJano, _super);
    function ArticleJano() {
        var _this = _super.call(this) || this;
        _this.whiteList = [
            '#text', 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo',
            'blockquote', 'br', 'button', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd',
            'del', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen',
            'label', 'legend', 'li', 'main', 'map', 'mark', 'meter', 'nav', 'object', 'ol', 'optgroup', 'option',
            'output', 'p', 'param', 'pre', 'progress', 'q', 'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'section',
            'select', 'small', 'source', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot',
            'th', 'thead', 'time', 'tr', 'track', 'u', 'ul', 'let', 'video', 'wbr'
        ];
        return _this;
    }
    /**
     * @description Detect Piano article
     */
    ArticleJano.prototype.isPianoArticle = function () {
        return !!document.querySelector('.js-piano-teaser-standard');
    };
    /**
     * @description Copy only allowed HTML elements and their styles from the remote article
     * @param root
     * @param node
     */
    ArticleJano.prototype.sanitizeContent = function (root, node) {
        var _this = this;
        node.childNodes.forEach(function (childNode) {
            var child = childNode;
            var nodeName = child.nodeName.toLowerCase();
            if (_this.whiteList.indexOf(nodeName) >= 0) {
                var element = void 0;
                if (nodeName === '#text') {
                    element = document.createTextNode(child.textContent);
                }
                else {
                    element = document.createElement(nodeName);
                    if (child.className.length) {
                        element.className = child.className;
                    }
                    if (nodeName === 'a') {
                        var match = child.href.match(/^https:\/\/artemis\.sme\.sk\/api\/v2\/article-header\/(\d+).*/);
                        element.href = _this.indexExist(match, 1) ? "https://sme.sk/c/" + match[1] + "/" : child.href;
                    }
                    else if (nodeName === 'iframe') {
                        element.src = child.src.replace(/^\/\//, 'http://');
                    }
                    else {
                        if (nodeName === 'img') {
                            element.src = child.src.replace(/^http:/, 'https:');
                            element.alt = child.alt;
                        }
                    }
                    if (child.childNodes.length) {
                        _this.sanitizeContent(element, child);
                    }
                }
                root.appendChild(element);
            }
        });
    };
    ;
    /**
     * @description Replace the actual static image block with the real video
     * @param htmlResponse
     * @param ajaxObject
     */
    ArticleJano.prototype.articleVideoUpdater = function (htmlResponse, ajaxObject) {
        var imageMatch = htmlResponse.match(/<image>(http.*)<\/image>/);
        var image = this.indexExist(imageMatch, 1) ? imageMatch[1] : '';
        var locationMatch = htmlResponse.match(/<location>(http.*)<\/location>/);
        var location = this.indexExist(locationMatch, 1) ? locationMatch[1] : '';
        var source = document.createElement('source');
        source.setAttribute('src', location);
        var video = document.createElement('video');
        video.setAttribute('controls', 'controls');
        video.setAttribute('width', '640');
        video.setAttribute('height', '360');
        video.setAttribute('poster', image);
        video.appendChild(source);
        ajaxObject.iosVideo.innerHTML = '';
        ajaxObject.iosVideo.appendChild(video);
    };
    /**
     * @param iosVideo
     * @param url
     */
    ArticleJano.prototype.getArticleVideo = function (iosVideo, url) {
        var _this = this;
        this.ajax(url, {
            async: true,
            custom: {
                iosVideo: iosVideo
            },
            callback: function (response) { return _this.articleVideoUpdater(response.responseText, response); },
            method: 'GET',
            headers: null
        });
    };
    ;
    /**
     * @description Replace static images with real videos
     * @param html
     */
    ArticleJano.prototype.getArticleVideos = function (html) {
        if (html === null) {
            return;
        }
        var iosVideos = html.querySelectorAll('div.iosvideo');
        if (!!iosVideos === false) {
            return;
        }
        var numberOfVideos = iosVideos.length;
        while (numberOfVideos--) {
            var videoAnchor = iosVideos[numberOfVideos].querySelector('a');
            var iosVideoIdMatch = videoAnchor.href.match(/^https:\/\/artemis\.sme\.sk\/api\/ma\/v\/(\d+)/);
            var iosVideoId = this.indexExist(iosVideoIdMatch, 1) ? +iosVideoIdMatch[1] : 0;
            var articleUrl = "https://www.sme.sk/storm/mmdata_get.asp?id=" + iosVideoId + "&hd1=1";
            this.getArticleVideo(iosVideos[numberOfVideos], articleUrl);
        }
    };
    ;
    /**
     * @description Get mobile version of the article
     * @param htmlResponse
     */
    ArticleJano.prototype.articleHtmlUpdater = function (htmlResponse) {
        var _this = this;
        var _a;
        var domParser = new DOMParser();
        var blackList = ['article > br:first-of-type', '.artemis-ad-position', '.premium-banner', '.button-bar'];
        var responseDocument = domParser.parseFromString(htmlResponse, 'text/html');
        blackList.map(function (selector) {
            responseDocument = _this.removeElements(selector, responseDocument);
        });
        var node = responseDocument.querySelector('.is-hidden');
        var perex = document.querySelector('.perex');
        if (node !== null) {
            (_a = node).replaceWith.apply(_a, Array.from(node.childNodes));
        }
        if (perex !== null) {
            responseDocument = this.removeElements('.perex', responseDocument);
        }
        var html = document.querySelector('article');
        if (html !== null) {
            html.innerHTML = '';
            var element = responseDocument.querySelector('.articlewrap');
            if (element === null) {
                element = responseDocument.querySelector('article');
            }
            this.sanitizeContent(html, element);
        }
        this.getArticleVideos(html);
    };
    /**
     * @param url
     */
    ArticleJano.prototype.getArticle = function (url) {
        var _this = this;
        this.ajax(url, {
            async: true,
            headers: {
                'User-Agent': ''
            },
            callback: function (response) {
                _this.articleHtmlUpdater(response.responseText);
            },
            method: 'GET',
            custom: null
        });
    };
    ;
    /**
     *
     */
    ArticleJano.prototype.init = function () {
        if (/\.sme\.sk\/c\/\d+\/.*/.test(document.location.href) && this.isPianoArticle()) {
            var articleId = this.getArticleId();
            var articleUrl = "https://artemis.sme.sk/api/v2/article/" + articleId + "?mid=10&fa=1&noAdverts=0&nightmode=0";
            this.getArticle(articleUrl);
        }
    };
    return ArticleJano;
}(Main));
(new ArticleJano()).init();
