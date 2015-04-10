/**
jquery-typeahead.js

Copyright (C) 2010 Colin Carter (colin_carter@fmail.co.uk)

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
*/
/**
 * jQuery.fn.typeAhead plugin
 *
 * Searches through the passed search array and selects
 * the first match it finds based on the input field, highlighting the matched text
 *
 * options:{
 *   source: []  // The array source
 *   finish: function(element, value, jQuery Event) // Callback function after element looses focus (blur event)
 *   scope: this // Scope to call the finish function in
  * }
 */
(function ($) {
    $.fn.typeAhead = function (options, value) {
        var emptyFn = function () {
        }, defaults = {
            source: [],
            finish: emptyFn,
            scope: this
        }, BACKSPACE = 8, DELETE = 46, IPHONE_BACKSPACE = 127, iPhone = !!(window.orientation !== undefined), opts;
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
                var keyCode = event.which, backspace = (keyCode === BACKSPACE || (iPhone && keyCode === IPHONE_BACKSPACE)), charVal, suffix, str, strLen;
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
                if (keyCode === BACKSPACE || keyCode === DELETE || (iPhone && keyCode === IPHONE_BACKSPACE)) {
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
