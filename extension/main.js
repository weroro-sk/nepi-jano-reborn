var AjaxOptions = /** @class */ (function () {
    function AjaxOptions() {
        this.async = false;
        this.method = 'GET';
        this.callback = null;
        this.headers = null;
        this.custom = null;
    }
    return AjaxOptions;
}());
var Main = /** @class */ (function () {
    function Main() {
        this.uri = this.uriParser();
    }
    /**
     * @param url
     * @param options
     */
    Main.prototype.ajax = function (url, options) {
        var request = new XMLHttpRequest();
        if (options.custom !== null) {
            for (var customProperty in options.custom) {
                if (options.custom.hasOwnProperty(customProperty)) {
                    request[customProperty] = options.custom[customProperty];
                }
            }
        }
        request.open(options.method, url, options.async);
        request.onload = function () {
            if (request.status === 200) {
                if (options.callback !== null) {
                    options.callback(request);
                }
            }
        };
        if (options.headers !== null) {
            for (var headerProperty in options.headers) {
                if (options.headers.hasOwnProperty(headerProperty)) {
                    request.setRequestHeader(headerProperty, options.headers[headerProperty]);
                }
            }
        }
        request.send();
    };
    /**
     * @description Remove element from document
     * @param element
     */
    Main.prototype.removeElement = function (element) {
        if (!!element) {
            element.parentNode.removeChild(element);
        }
    };
    /**
     * @description Remove elements from document by selector
     * @param selector
     * @param scope
     */
    Main.prototype.removeElements = function (selector, scope) {
        if (scope === void 0) { scope = null; }
        if (!!selector === false) {
            return null;
        }
        var d = scope !== null ? scope : document;
        var elements = d.querySelectorAll(selector);
        var numberOfElements = elements.length;
        while (numberOfElements--) {
            this.removeElement(elements[numberOfElements]);
        }
        return scope === null ? document : scope;
    };
    /**
     * @description Create Array from URI
     */
    Main.prototype.uriParser = function () {
        var output = [];
        var uriSplit = document.location.pathname.split('/');
        if (uriSplit.length) {
            output = uriSplit;
        }
        return output;
    };
    /**
     * @description Check for array index exists
     * @param object
     * @param index
     */
    Main.prototype.indexExist = function (object, index) {
        return object !== null && object.hasOwnProperty(index);
    };
    /**
     * @description Get URI item from URI Array
     * @param itemIndex
     */
    Main.prototype.getUriItem = function (itemIndex) {
        return this.indexExist(this.uri, itemIndex) ? this.uri[itemIndex] : '';
    };
    /**
     * @description Get article ID from URL
     */
    Main.prototype.getArticleId = function () {
        return +this.getUriItem(1);
    };
    return Main;
}());
