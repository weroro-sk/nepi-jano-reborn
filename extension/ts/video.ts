///<reference path="main.ts"/>
class VideoJano extends Main {

    public constructor() {
        super();
    }

    /**
     * @description Detect Piano video
     */
    private isPianoVideo(): boolean {
        return !!document.querySelector('.tvpiano');
    }

    /**
     * @description Get video resolution from URL
     */
    private isHD(): number {
        return +(this.getUriItem(0).toLowerCase() === 'vhd');
    }

    /**
     * @description Recreate unblocked version of Piano video
     * @param htmlResponse
     */
    private createVideo(htmlResponse: string): void {
        const imageMatch = htmlResponse.match(/<image>(http.*)<\/image>/);
        const image = this.indexExist(imageMatch, 1) ? imageMatch[1] : '';
        const locationMatch = htmlResponse.match(/<location>(http.*)<\/location>/);
        const location = this.indexExist(locationMatch, 1) ? locationMatch[1] : '';
        const html = document.querySelector('div.video');
        if (html !== null) {
            const source = document.createElement('source');
            source.setAttribute('src', location);
            const video = document.createElement('video');
            video.setAttribute('controls', 'controls');
            video.setAttribute('poster', image);
            video.appendChild(source);
            while (html.firstChild) {
                html.removeChild(html.firstChild);
            }
            html.appendChild(video);
            this.removeElement(document.querySelector('div.sme_piano_art_promo'));
            (document.querySelector('.v-podcast-box') as HTMLElement).style.marginTop = '25px';
        }
    }

    /**
     * @param url
     */
    private getVideo(url: string): void {
        this.ajax(url, {
            async: true,
            callback: response => this.createVideo(response.responseText),
            method: 'GET',
            headers: null,
            custom: null
        })
    }

    /**
     *
     */
    public init(): void {
        if (/tv\.sme\.sk\/v(hd)?\/\d+\/.*/.test(document.location.href) && this.isPianoVideo()) {
            const videoUrl = `https://www.sme.sk/storm/mmdata_get.asp?id=${this.getArticleId()}&hd1=${this.isHD()}`;
            this.getVideo(videoUrl);
        }
    }
}

(new VideoJano()).init();