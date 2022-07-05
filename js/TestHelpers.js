

(function(win, helper) {

    /**
    * If element is visible/ in viewport
    * @private
    * @author Based on https://www.javascripttutorial.net/dom/css/check-if-an-element-is-visible-in-the-viewport/
    * @param {Object} element
    * @return {Boolean}
    */
    function _isInViewport(element) {
        let el = element.getBoundingClientRect();
        return (
            (el.top >= 0 || el.bottom >= 0) &&
            (el.left >= 0 || el.right >= 0) &&
            el.bottom <= (win.innerHeight || document.documentElement.clientHeight) &&
            el.right <= (win.innerWidth || document.documentElement.clientWidth)
        );
    }


    /**
    * If is an instance, then select the correct selector
    * @private
    * @param {String} selector
    * @param {Object} $this
    * @return {String}
    */
    function _getSelector(selector, $this) {
        if ($this.selector) {
            return $this.selector;
        }
        return selector;
    }


    /**
    * If is an instance, then select the second var as the value
    * @private
    * @param {String} var1
    * @param {String} var2
    * @param {Object} $this
    * @return {String|Null}
    */
    function _getVar(var1, var2, $this) {
        /* 
        // When it has been instanciated with a selector, 
        // the selector var here becames the "type" 
        */
        var2 = var2 ? var2 : null;
        return $this.isInstance ? var1 : var2;
    }


    /**
    * Get the Element object instance
    * @private
    * @param {String|Object} var1
    * @return {Object}
    */
    function _$(selector) {
        if (typeof(selector) === 'object') {
            return selector;
        } else if (String(selector).includes('//')) {
            return helper.getElementByXpath(selector);
        } else {
            return document.querySelector(selector);
        }
    }


    /**
    * Get The current host url
    * @return {String}
    */
    helper.getHost = function() {
        const PROTOCOL = win.location.protocol.replace(':', '');
	    const HOST = win.location.host;
	    return PROTOCOL + '://' + HOST;
    };


    /**
    * Store values for later use during the session
    * @param {String} id
    * @param {Any} item
    * @return {Any}
    */
     helper.store = function(id, item) {
        return win.sessionStorage.setItem(id, JSON.stringify(item));  
    };


    /**
    * Get stored value from the session
    * @return {Any}
    */
     helper.fetch = function(id) {
        return JSON.parse(win.sessionStorage.getItem(id));  
    };


    /**
    * Get the element xpath string
    * @param {Object} element
    * @author Based on https://stackoverflow.com/questions/2631820/how-do-i-ensure-saved-click-coordinates-can-be-reload-to-the-same-place-even-if/2631931#2631931
    * @example getXpathTo(document.getElementByClass('div.hello'));
    * @return {String}
    */
    helper.getXpathTo = function(element) {
        if (element.id) {
            return "//*[@id='" + element.id + "']";
        }
        if (element===document.body) {
            return '//' + element.tagName;
        }
    
        var ix= 0;
        var siblings= element.parentNode.childNodes;
        for (var i= 0; i<siblings.length; i++) {
            var sibling= siblings[i];
            if (sibling===element) {
                return helper.getXpathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
            }
            if (sibling.nodeType===1 && sibling.tagName===element.tagName) {
                ix++;
            }
        }
    };


    /**
    * Find element by Xpath string
    * @param {String} xpath
    * @example getElementByXpath("//html[1]/body[1]/div[1]")
    * @return {Object}
    */
    helper.getElementByXpath = function(xpath) {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    };

    /**
    * Escape the string to avoid collisions
    * @param {String} string
    * @return {String}
    */
    helper.escape = function(string){
        return String((string).replace(/"/g, '\\"').replace(/'/g, "\\'"));
    };


    /**
    * To get a Select or dropdown Option
    * @param {String} selector Id, class, pseudo
    * @param {String} type Option text, xpath or value, default is text
    * @example getDropdownOption('#hello', 'value');
    * @return {String} Returns the Xpath string
    */
    helper.getDropdownOption = function (selector, type) {
        type = _getVar(selector, type, this);
        selector = _getSelector(selector, this);

        let $element = _$(selector);
        let option = null;

        if ($element) {
            let options = $element.querySelectorAll('option:not([value=""])');
            let random = Math.floor(Math.random() * options.length);
            let aOptions = Array.from(options);
            
            option = helper.getElementAttr(aOptions[random], type);
            console.log( 'option', option );
        }

        return option;
    };


    /**
    * Get an element attribute or value
    * @param {String} selector Id, class, pseudo
    * @param {String} attr Option text, xpath or value, default is text
    * @example getElementAttr('#hello', 'value');
    * @return {String|Null}
    */
     helper.getElementAttr = function(selector, attr) {
        attr = _getVar(selector, attr, this);
        selector = _getSelector(selector, this);

        let $element = _$(selector);
        let result = null;

        switch (attr) {
            case 'path':
                result = helper.getXpathTo($element);
                break;
            case 'value':
                result = $element.value;
                break;
            default:
                result = String($element.innerText).trim();
                break;
        }

        return result;
    };


    /**
    * Get a single element that match the id
    * @param {String} selector Id, class, pseudo
    * @example getElement('#hello');
    * @return {Object}
    */
     helper.getElement = function(selector) {
        return _$(_getSelector(selector, this));
    };


    /**
    * Get an array of Elements by xpath
    * @param {String} selector Id, class, pseudo
    * @example getElements('.hello');
    * @return {Object}
    */
     helper.getElements = function(selector) {
        selector = _getSelector(selector, this);
        let indexArray = [];
        let xpathArray = [];
        
        Array
            .from(document.querySelectorAll(selector))
            .forEach(function (element, index) {
                let xpath = helper.getXpathTo(element);
                xpathArray.push(xpath);
                indexArray.push(index);
            });

        return {
            xpath: xpathArray,
            indexes: indexArray,
        };
    };


    /**
    * Get the amount of elements present in the DOM
    * @param {String} selector Id, class, pseudo
    * @example getCount('.table tr');
    * @return {Number}
    */
     helper.getCount = function(selector) {
        return document.querySelectorAll(_getSelector(selector, this)).length;
    };


    /**
    * Generate random number
    * @return {Int}
    */
    helper.randomNumber = function() {
        return Math.floor(Math.random() * (3000 - 2000 + 1)) + 2000;
    };


    /**
    * Generate random Zipcode
    * @return {Int}
    */
    helper.randomZip = function() {
        return Math.floor(Math.random() * (38888 - 30000 + 1)) + 30000;
    };


    /**
    * Generate random text
    * @param {Int} length Lenght of string
    * @example randomText(50);
    * @return {String}
    */
    helper.randomText = function(length) {
        length = !length ? 10 : length;
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    };


    /**
    * Click all elements that mathch the id
    * @param {String} selector Id, class, pseudo
    * @param {String} hasClass Optional
    * @example clickElements('#hello');
    * @return {Void}
    */
    helper.clickElements = function(selector, hasClass) {
        hasClass = _getVar(selector, hasClass, this);
        selector = _getSelector(selector, this);

        let elements = document.querySelectorAll(selector);
        
        Array.from(elements).forEach(function(element){
            element = _$(element);
            if (
                (hasClass && element.classList.contains(hasClass)) || 
                (!hasClass && _isInViewport(element))
            ) {
                helper.clickElement(element);
            }
            return;
        });

        return this;
    };

    /**
    * Click one elements that matches the id
    * @param {String} selector Id, class, pseudo
    * @example clickElement('#hello');
    * @return {String}
    */
     helper.clickElement = function(selector) {
        selector = _getSelector(selector, this);
        let element = _$(selector);
        
        if (_isInViewport(element)) {
            element.click();
        }

        return this;
    };

    /**
    * Set any element value
    * @param {String} selector Id, class, pseudo
    * @param {String} valueOrType Can be "text", "int" or an actual value (any)
    * @example setValue('element', 'hello');
    * @return {Object} This instance
    */
    helper.setValue = function(selector, valueOrType) {
        valueOrType = _getVar(selector, valueOrType, this);
        selector = _getSelector(selector, this);
        let element = _$(selector);

        switch (valueOrType) {
            case 'text':
                element.value = this.randomText();
                break;
            case 'int':
                element.value = this.randomNumber();
                break;
            default:
                element.value = valueOrType;
                break;
        }

        /* Addresses the issues with dynamic inputs */
        element.dispatchEvent(new Event('change'));
        element.dispatchEvent(new Event('input'));

        return this;
    };


    /**
    * Create an instance with an element Selector (id, class, pseudo...)
    * @param {String|object} selector Selector (id, class, pseudo, object)
    * @return {Object} New Instance of helper
    */
    helper.select = function(selector) {
        if (typeof(selector) !== 'object') {
            selector = helper.escape(selector);
        }
        
        return Object.assign({
            selector: selector,
            isInstance: true,
        }, helper);
    };
    
})(window, (window.__helper = window.__helper || {}));