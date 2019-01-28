///<reference path="main.ts"/>

interface ArrayConstructor {
    from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Array<U>;

    from<T>(arrayLike: ArrayLike<T>): Array<T>;
}

class ArticleJano extends Main {

    private whiteList: string[] = [
        '#text', 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo',
        'blockquote', 'br', 'button', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd',
        'del', 'dfn', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen',
        'label', 'legend', 'li', 'main', 'map', 'mark', 'meter', 'nav', 'object', 'ol', 'optgroup', 'option',
        'output', 'p', 'param', 'pre', 'progress', 'q', 'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'section',
        'select', 'small', 'source', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot',
        'th', 'thead', 'time', 'tr', 'track', 'u', 'ul', 'let', 'video', 'wbr'
    ];

    public constructor() {
        super();
    }

    /**
     * @description Detect Piano article
     */
    private isPianoArticle(): boolean {
        return !!document.querySelector('.js-piano-teaser-standard');
    }

    /**
     * @description Copy only allowed HTML elements and their styles from the remote article
     * @param root
     * @param node
     */
    private sanitizeContent(root: Element, node: HTMLElement): void {
        node.childNodes.forEach(childNode => {
            const child = childNode as HTMLAnchorElement;
            const nodeName = child.nodeName.toLowerCase();
            if (this.whiteList.indexOf(nodeName) >= 0) {
                let element;
                if (nodeName === '#text') {
                    element = document.createTextNode(child.textContent);
                } else {
                    element = document.createElement(nodeName);
                    if (child.className.length) {
                        element.className = child.className;
                    }
                    if (nodeName === 'a') {
                        const match = child.href.match(/^https:\/\/artemis\.sme\.sk\/api\/v2\/article-header\/(\d+).*/);
                        element.href = this.indexExist(match, 1) ? `https://sme.sk/c/${match[1]}/` : child.href;
                    } else if (nodeName === 'iframe') {
                        element.src = (child as any).src.replace(/^\/\//, 'http://');
                    } else {
                        if (nodeName === 'img') {
                            element.src = (child as any).src.replace(/^http:/, 'https:');
                            element.alt = (child as any).alt;
                        }
                    }
                    if (child.childNodes.length) {
                        this.sanitizeContent(element, child);
                    }
                }
                root.appendChild(element);
            }
        });
    };

    /**
     * @description Replace the actual static image block with the real video
     * @param htmlResponse
     * @param ajaxObject
     */
    private articleVideoUpdater(htmlResponse: string, ajaxObject: XMLHttpRequest | any): void {
        const imageMatch = htmlResponse.match(/<image>(http.*)<\/image>/);
        const image = this.indexExist(imageMatch, 1) ? imageMatch[1] : '';
        const locationMatch = htmlResponse.match(/<location>(http.*)<\/location>/);
        const location = this.indexExist(locationMatch, 1) ? locationMatch[1] : '';
        const source = document.createElement('source');
        source.setAttribute('src', location);
        const video = document.createElement('video');
        video.setAttribute('controls', 'controls');
        video.setAttribute('width', '640');
        video.setAttribute('height', '360');
        video.setAttribute('poster', image);
        video.appendChild(source);
        ajaxObject.iosVideo.innerHTML = '';
        ajaxObject.iosVideo.appendChild(video);
    }

    /**
     * @param iosVideo
     * @param url
     */
    private getArticleVideo(iosVideo: Element, url: string): void {
        this.ajax(url, {
            async: true,
            custom: {
                iosVideo: iosVideo
            },
            callback: response => this.articleVideoUpdater(response.responseText, response),
            method: 'GET',
            headers: null
        });
    };

    /**
     * @description Replace static images with real videos
     * @param html
     */
    private getArticleVideos(html: Element): void {
        if (html === null) {
            return;
        }
        const iosVideos = html.querySelectorAll('div.iosvideo');
        if (!!iosVideos === false) {
            return;
        }
        let numberOfVideos = iosVideos.length;
        while (numberOfVideos--) {
            const videoAnchor = iosVideos[numberOfVideos].querySelector('a');
            const iosVideoIdMatch = videoAnchor.href.match(/^https:\/\/artemis\.sme\.sk\/api\/ma\/v\/(\d+)/);
            const iosVideoId = this.indexExist(iosVideoIdMatch, 1) ? +iosVideoIdMatch[1] : 0;
            const articleUrl = `https://www.sme.sk/storm/mmdata_get.asp?id=${iosVideoId}&hd1=1`;
            this.getArticleVideo(iosVideos[numberOfVideos], articleUrl);
        }
    };

    /**
     * @description Get mobile version of the article
     * @param htmlResponse
     */
    private articleHtmlUpdater(htmlResponse: string): void {
        const domParser = new DOMParser();
        const blackList = ['article > br:first-of-type', '.artemis-ad-position', '.premium-banner', '.button-bar'];
        let responseDocument = domParser.parseFromString(htmlResponse, 'text/html');
        blackList.map(selector => {
            responseDocument = this.removeElements(selector, responseDocument);
        });
        const node = responseDocument.querySelector('.is-hidden');
        const perex = document.querySelector('.perex');
        if (node !== null) {
            (node as any).replaceWith(...Array.from(node.childNodes));
        }
        if (perex !== null) {
            responseDocument = this.removeElements('.perex', responseDocument);
        }
        const html = document.querySelector('article');
        if (html !== null) {
            html.innerHTML = '';
            let element = responseDocument.querySelector('.articlewrap') as HTMLElement;
            if (element === null) {
                element = responseDocument.querySelector('article') as HTMLElement;
            }
            this.sanitizeContent(html, element);
        }
        this.getArticleVideos(html);
    }

    /**
     * @param url
     */
    private getArticle(url: string): void {
        this.ajax(url, {
            async: true,
            headers: {
                'User-Agent': ''
            },
            callback: response => {
                this.articleHtmlUpdater(response.responseText);
            },
            method: 'GET',
            custom: null
        });
    };

    /**
     *
     */
    public init(): void {
        if (/\.sme\.sk\/c\/\d+\/.*/.test(document.location.href) && this.isPianoArticle()) {
            const articleId = this.getArticleId();
            const articleUrl = `https://artemis.sme.sk/api/v2/article/${articleId}?mid=10&fa=1&noAdverts=0&nightmode=0`;
            this.getArticle(articleUrl);
        }
    }
}

(new ArticleJano()).init();