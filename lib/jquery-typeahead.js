/// <reference path="./jquery.d.ts" />
(function ($) {
    $.fn.typeAhead = function (options, value) {
        var emptyFn = function () {
        };
        var defaults = {
            source: [],
            finish: emptyFn,
            scope: this
        };
        var BACKSPACE = 8;
        var DELETE = 46;
        var IPHONE_BACKSPACE = 127;
        var opts;
        opts = $.extend({}, defaults, options);
        if (typeof options === 'string') {
            opts[options] = value;
        }
        function selectText(el, start, end) {
            var textRange;
            if (el.setSelectionRange) {
                // Gecko, Webkit
                el.focus();
                el.setSelectionRange(start, end);
            }
            else if (el.createTextRange) {
                // IE
                textRange = el.createTextRange();
                if (textRange) {
                    textRange.collapse(true);
                    textRange.moveStart('character', start);
                    textRange.moveEnd('character', end - start);
                    textRange.select();
                }
            }
        }
        function setCursor(el, pos) {
            var textRange;
            if (el.setSelectionRange) {
                el.setSelectionRange(pos, pos);
            }
            else if (el.createTextRange) {
                textRange = el.createTextRange();
                if (textRange) {
                    textRange.moveEnd('character', pos);
                }
            }
        }
        function searchFor(prefix) {
            var i, len, src = opts.source, srcVal, prefixLen = prefix.length, srcValSub;
            prefix = prefix.toLowerCase();
            for (i = 0, len = src.length; i < len; i++) {
                srcVal = src[i];
                srcValSub = srcVal.substring(0, prefixLen);
                if (prefix === srcValSub.toLowerCase()) {
                    return [srcValSub, srcVal.substring(prefixLen)];
                }
            }
            return -1;
        }
        return this.each(function (i, el) {
            var elVal = el.value; // This is what the user is typing
            // Only on <input type="text"...> elements
            if (el.type !== 'text') {
                throw new Error('Cannot attach to non text elements');
            }
            $(el).bind('blur.typeAhead', function (event) {
                opts.finish.call(opts.scope, el, el.value, event);
                return false;
            });
            $(el).bind('keypress.typeAhead', function (event) {
                var keyCode = event.which, backspace = (keyCode === BACKSPACE), charVal, suffix, str, strLen;
                // Question: Why does a DELETE keyCode (46) == a period (.) in a keypress
                // but is 190 in a keydown and keyup?
                if (!backspace) {
                    charVal = String.fromCharCode(keyCode);
                    // Form our new string based on what they've previously entered and what they've
                    // just typed
                    str = elVal + charVal;
                    strLen = str.length;
                    suffix = searchFor(str);
                    if (suffix !== -1) {
                        // Put it back in the input field
                        el.value = suffix[0] + suffix[1];
                        elVal = suffix[0];
                        // Position the cursor so it's at the end of what the user just typed
                        setCursor(el, strLen);
                        // Select what is just beyond what the user typed
                        selectText(el, strLen, strLen + suffix[1].length);
                        // Prevent the browser from entering the value in the input field
                        event.preventDefault();
                    }
                    else {
                        elVal = el.value;
                    }
                }
            });
            $(el).bind('keyup.typeAhead', function (event) {
                var keyCode = event.which;
                if (keyCode === BACKSPACE || keyCode === DELETE) {
                    // If they've pressed a backspace character reset our saved representation of the users input
                    elVal = el.value;
                }
            });
        });
    };
    $.fn.removeTypeAhead = function () {
        return this.unbind('.typeAhead');
    };
})(jQuery);
