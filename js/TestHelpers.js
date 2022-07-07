/**
Released under MIT and CC (https://creativecommons.org/licenses/by/4.0/) licenses
Copyright 2022 Carroll Bradford Inc. [https://dogood.carrollbradford.io/]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * @class __helper
 * @description Adds all the helper methods to the DOM and access via __helper.methodName();
 * @example __helper.select('.hello').setValue('int') --> an element with class .hello (input) will be set with a random int. for functions and manipulation see global.
 * @see https://github.com/carrollbradford/Selenium--TestHelper
 *
 */
(function (win, helper) {
  /**
   * If element is visible/ in viewport
   * @private
   * @author Based on https://www.javascripttutorial.net/dom/css/check-if-an-element-is-visible-in-the-viewport/
   * @param {object} element
   * @return {boolean}
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
   * @param {string} selector
   * @param {object} $this
   * @return {string}
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
   * @param {string} var1
   * @param {string} var2
   * @param {object} $this
   * @return {string|null}
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
   * @param {string|object} var1
   * @return {object}
   */
  function _$(selector) {
    if (typeof selector === "object") {
      return selector;
    } else if (string(selector).includes("//")) {
      return helper.getElementByXpath(selector);
    } else {
      return document.querySelector(selector);
    }
  }

  /**
   * Get The current host url
   * @function getHost
   * @return {string}
   */
  helper.getHost = function () {
    const PROTOCOL = win.location.protocol.replace(":", "");
    const HOST = win.location.host;
    return PROTOCOL + "://" + HOST;
  };

  /**
   * Store values for later use during the session
   * @function store
   * @example __helper.store(id, item)
   * @param {string} id
   * @param {Any} item
   * @return {Any}
   */
  helper.store = function (id, item) {
    return win.sessionStorage.setItem(id, JSON.stringify(item));
  };

  /**
   * Get stored value from the session
   * @example __helper.fetch(id)
   * @function fetch
   * @return {Any}
   */
  helper.fetch = function (id) {
    return JSON.parse(win.sessionStorage.getItem(id));
  };

  /**
   * Get the element xpath string
   * @function getXpathTo
   * @example __helper.getXpathTo(DOMElement)
   * @param {object} element
   * @author Based on https://stackoverflow.com/questions/2631820/how-do-i-ensure-saved-click-coordinates-can-be-reload-to-the-same-place-even-if/2631931#2631931
   * @example getXpathTo(document.getElementByClass('div.hello'));
   * @return {string}
   */
  helper.getXpathTo = function (element) {
    if (element.id) {
      return "//*[@id='" + element.id + "']";
    }
    if (element === document.body) {
      return "//" + element.tagName;
    }

    var ix = 0;
    var siblings = element.parentNode.childNodes;
    for (var i = 0; i < siblings.length; i++) {
      var sibling = siblings[i];
      if (sibling === element) {
        return (
          helper.getXpathTo(element.parentNode) +
          "/" +
          element.tagName +
          "[" +
          (ix + 1) +
          "]"
        );
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
  };

  /**
   * Find element by Xpath string
   * @function getElementByXpath
   * @param {string} xpath
   * @example getElementByXpath("//html[1]/body[1]/div[1]")
   * @return {object}
   */
  helper.getElementByXpath = function (xpath) {
    return document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  };

  /**
   * Escape the string to avoid collisions
   * @function escape
   * @example __helper.escape(string)
   * @param {string} string
   * @return {string}
   */
  helper.escape = function (string) {
    return String(string.replace(/"/g, '\\"').replace(/'/g, "\\'"));
  };

  /**
   * To get a Select or dropdown Option
   * @function getDropdownOption
   * @param {string} selector Id, class, pseudo
   * @param {string} type Option text, xpath or value, default is text
   * @example __helper.getDropdownOption('#hello', 'value') ||  __helper.select(class|selector|id).getDropdownOption('value');
   * @return {string} Returns the Xpath string
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
      console.log("option", option);
    }

    return option;
  };

  /**
   * Get an element attribute or value
   * @function getElementAttr
   * @example __helper.getElementAttr('#hello', 'value') ||  __helper.select(class|selector|id).getElementAttr('value');
   * @param {string} selector Id, class, pseudo
   * @param {string} attr Option text, xpath or value, default is text
   * @return {string|null}
   */
  helper.getElementAttr = function (selector, attr) {
    attr = _getVar(selector, attr, this);
    selector = _getSelector(selector, this);

    let $element = _$(selector);
    let result = null;

    switch (attr) {
      case "path":
        result = helper.getXpathTo($element);
        break;
      case "value":
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
   * @function getElement
   * @example __helper.getElement('#hello') ||  __helper.select(class|selector|id).getElement();
   * @param {string} selector Id, class, pseudo
   * @return {object}
   */
  helper.getElement = function (selector) {
    return _$(_getSelector(selector, this));
  };

  /**
   * Get an array of Elements by xpath
   * @function getElements
   * @example __helper.getElements('.hello') ||  __helper.select(class|selector|id).getElements();
   * @param {string} selector Id, class, pseudo
   * @return {object}
   */
  helper.getElements = function (selector) {
    selector = _getSelector(selector, this);
    let indexArray = [];
    let xpathArray = [];

    Array.from(document.querySelectorAll(selector)).forEach(function (
      element,
      index
    ) {
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
   * @function getCount
   * @example __helper.getCount('.hello')
   * @param {string} selector Id, class, pseudo
   * @return {number}
   */
  helper.getCount = function (selector) {
    return document.querySelectorAll(_getSelector(selector, this)).length;
  };

  /**
   * Generate random number
   * @function randomNumber
   * @return {Int}
   */
  helper.randomNumber = function () {
    return Math.floor(Math.random() * (3000 - 2000 + 1)) + 2000;
  };

  /**
   * Generate random Zipcode
   * @function randomZip
   * @return {Int}
   */
  helper.randomZip = function () {
    return Math.floor(Math.random() * (38888 - 30000 + 1)) + 30000;
  };

  /**
   * Generate random text
   * @function randomText
   * @example __helper.randomText(50)
   * @param {Int} length Lenght of string
   * @example randomText(50);
   * @return {string}
   */
  helper.randomText = function (length) {
    length = !length ? 10 : length;
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  };

  /**
   * Click all elements that mathch the id
   * @function clickElements
   * @example __helper.clickElements('.hello') ||  __helper.select(class|selector|id).clickElements();
   * @param {string} selector Id, class, pseudo
   * @param {string} hasClass Optional
   * @return {Void}
   */
  helper.clickElements = function (selector, hasClass) {
    hasClass = _getVar(selector, hasClass, this);
    selector = _getSelector(selector, this);

    let elements = document.querySelectorAll(selector);

    Array.from(elements).forEach(function (element) {
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
   * @function clickElement
   * @example __helper.clickElement('.hello') ||  __helper.select(class|selector|id).clickElement();
   * @param {string} selector Id, class, pseudo
   * @return {string}
   */
  helper.clickElement = function (selector) {
    selector = _getSelector(selector, this);
    let element = _$(selector);

    if (_isInViewport(element)) {
      element.click();
    }

    return this;
  };

  /**
   * Set any element value
   * @function setValue
   * @example __helper.setValue('element', 'hello') ||  __helper.select(class|selector|id).setValue(value);
   * @param {string} selector Id, class, pseudo
   * @param {string} valueOrType Can be "text", "int" or an actual value (any)
   * @example setValue('element', 'hello');
   * @return {object} This instance
   */
  helper.setValue = function (selector, valueOrType) {
    valueOrType = _getVar(selector, valueOrType, this);
    selector = _getSelector(selector, this);
    let element = _$(selector);

    switch (valueOrType) {
      case "text":
        element.value = this.randomText();
        break;
      case "int":
        element.value = this.randomNumber();
        break;
      default:
        element.value = valueOrType;
        break;
    }

    /* Addresses the issues with dynamic inputs */
    element.dispatchEvent(new Event("change"));
    element.dispatchEvent(new Event("input"));

    return this;
  };

  /**
   * Create an instance with an element Selector (id, class, pseudo...) and chain it with selected methods
   * @function select
   * @example __helper.select('element')
   * @param {string|object} selector Selector (id, class, pseudo, object)
   * @return {object} New Instance of helper
   */
  helper.select = function (selector) {
    if (typeof selector !== "object") {
      selector = helper.escape(selector);
    }

    return Object.assign(
      {
        selector: selector,
        isInstance: true,
      },
      helper
    );
  };
})(window, (window.__helper = window.__helper || {}));
