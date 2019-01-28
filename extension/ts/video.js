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
///<reference path="main.ts"/>
var VideoJano = /** @class */ (function (_super) {
    __extends(VideoJano, _super);
    function VideoJano() {
        return _super.call(this) || this;
    }
    /**
     * @description Detect Piano video
     */
    VideoJano.prototype.isPianoVideo = function () {
        return !!document.querySelector('.tvpiano');
    };
    /**
     * @description Get video resolution from URL
     */
    VideoJano.prototype.isHD = function () {
        return +(this.getUriItem(0).toLowerCase() === 'vhd');
    };
    /**
     * @description Recreate unblocked version of Piano video
     * @param htmlResponse
     */
    VideoJano.prototype.createVideo = function (htmlResponse) {
        var imageMatch = htmlResponse.match(/<image>(http.*)<\/image>/);
        var image = this.indexExist(imageMatch, 1) ? imageMatch[1] : '';
        var locationMatch = htmlResponse.match(/<location>(http.*)<\/location>/);
        var location = this.indexExist(locationMatch, 1) ? locationMatch[1] : '';
        var html = document.querySelector('div.video');
        if (html !== null) {
            var source = document.createElement('source');
            source.setAttribute('src', location);
            var video = document.createElement('video');
            video.setAttribute('controls', 'controls');
            video.setAttribute('poster', image);
            video.appendChild(source);
            while (html.firstChild) {
                html.removeChild(html.firstChild);
            }
            html.appendChild(video);
            this.removeElement(document.querySelector('div.sme_piano_art_promo'));
            document.querySelector('.v-podcast-box').style.marginTop = '25px';
        }
    };
    /**
     * @param url
     */
    VideoJano.prototype.getVideo = function (url) {
        var _this = this;
        this.ajax(url, {
            async: true,
            callback: function (response) { return _this.createVideo(response.responseText); },
            method: 'GET',
            headers: null,
            custom: null
        });
    };
    /**
     *
     */
    VideoJano.prototype.init = function () {
        if (/tv\.sme\.sk\/v(hd)?\/\d+\/.*/.test(document.location.href) && this.isPianoVideo()) {
            var videoUrl = "https://www.sme.sk/storm/mmdata_get.asp?id=" + this.getArticleId() + "&hd1=" + this.isHD();
            this.getVideo(videoUrl);
        }
    };
    return VideoJano;
}(Main));
(new VideoJano()).init();
