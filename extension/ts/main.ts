class AjaxOptions {
    async: boolean = false;
    method: string = 'GET';
    callback: Function = null;
    headers: any = null;
    custom: any = null;
}

class Main {

    private readonly uri: string[];

    public constructor() {
        this.uri = this.uriParser();
    }

    /**
     * @param url
     * @param options
     */
    protected ajax(url: string, options: AjaxOptions): void {
        const request = new XMLHttpRequest();
        if (options.custom !== null) {
            for (const customProperty in options.custom) {
                if (options.custom.hasOwnProperty(customProperty)) {
                    request[customProperty] = options.custom[customProperty];
                }
            }
        }
        request.open(options.method, url, options.async);
        request.onload = () => {
            if (request.status === 200) {
                if (options.callback !== null) {
                    options.callback(request);
                }
            }
        };
        if (options.headers !== null) {
            for (const headerProperty in options.headers) {
                if (options.headers.hasOwnProperty(headerProperty)) {
                    request.setRequestHeader(headerProperty, options.headers[headerProperty]);
                }
            }
        }
        request.send();
    }

    /**
     * @description Remove element from document
     * @param element
     */
    protected removeElement(element: Node): void {
        if (!!element) {
            element.parentNode.removeChild(element);
        }
    }

    /**
     * @description Remove elements from document by selector
     * @param selector
     * @param scope
     */
    protected removeElements(selector: string, scope = null): Document | HTMLDocument | null {
        if (!!selector === false) {
            return null;
        }
        const d: Document = scope !== null ? scope : document;
        const elements = d.querySelectorAll(selector);
        let numberOfElements = elements.length;
        while (numberOfElements--) {
            this.removeElement(elements[numberOfElements]);
        }
        return scope === null ? document : scope;
    }

    /**
     * @description Create Array from URI
     */
    protected uriParser(): string[] {
        let output: string[] = [];
        const uriSplit: string[] = document.location.pathname.split('/');
        if (uriSplit.length) {
            output = uriSplit;
        }
        return output;
    }

    /**
     * @description Check for array index exists
     * @param object
     * @param index
     */
    protected indexExist(object: any[], index: number): boolean {
        return object !== null && object.hasOwnProperty(index);
    }

    /**
     * @description Get URI item from URI Array
     * @param itemIndex
     */
    protected getUriItem(itemIndex: number): string {
        return this.indexExist(this.uri, itemIndex) ? this.uri[itemIndex] : '';
    }

    /**
     * @description Get article ID from URL
     */
    protected getArticleId(): number {
        return +this.getUriItem(1);
    }
}