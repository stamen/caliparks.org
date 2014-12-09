define(["require","exports","module"], function(require, exports, module) {

  "use strict";

  module.exports = function StamenBase() {

    var that = this;

    var listeners = {};

    //
    // Subscribes a function to an event called by fire
    //
    that.on = function on(type, callback, data, once) {
      if (!listeners[type]) {
        listeners[type] = [];
      }

      listeners[type].push(arguments);
    };

    //
    // Just like on but it unsubscribes after one fire
    //
    that.once = function once(type, callback, data) {
      return this.on.apply(that, [
          arguments[0],
          arguments[1],
          arguments[2],
          true
      ]);
    };

    //
    // Fire an event and run all subscribers
    //
    that.fire = function fire(type, data) {
      if(listeners[type]) {
        listeners[type].forEach(function(listener) {
          listener[1]({
            listener : listener[2],
            caller   : data
          });
        });

        listeners[type] = listeners[type].filter(function(p) {return !p[3];});
      }
    };

    //
    // Mustache like template parsing. Just one bracket... like this: {hi}
    //
    this.processTemplate = function processTemplate(template, data) {

      Object.keys(data).forEach(function(key) {

        template = template.split("{" + key + "}").join(data[key]);

      });

      return template;

    };

    //
    // These are things not meant for the implementer"s interface
    // but useful to the implementer
    //
    that.utils = {
      //
      // Gets an element by selector. Uses JQuery if available.
      //
      get : function get(selector, root) {
        if (window.$) {
          return ((root) ? $(root).find(selector) : $(selector)).get();
        } else {
          return ((root) ? root : document).querySelectorAll(selector);
        }
      },

      //Lifted from http://davidwalsh.name/javascript-debounce-function
      debounce : function debounce(func, wait, immediate) {
        var timeout;
        return function() {
          var context = this, args = arguments;
          var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
        };
      }
    };

    return this;
  };

});
