define([
    'lodash/objects/assign',
    'lib/fastdom-promise',
    'commercial/modules/messenger'
], function (assign, fastdom, messenger) {

    var lengthRegexp = /^((\d+)(%|px|em|ex|ch|rem|vh|vw|vmin|vmax)?)|none|initial|inherit/;
    var defaultUnit = 'px';

    /*
      resizes can be requested in two forms:
      1) a list of specific properties to alter
      2) a defined-style, which will resolve to a default set of properties

      Both can be supplied, in which case the style is first applied and
      any specific properties are applied after.
    */

    var properties = [
         'width', 'height', 'padding', 'margin',
         'paddingBottom', 'paddingTop', 'paddingLeft', 'paddingRight',
         'marginBottom', 'marginTop', 'marginLeft', 'marginRight',
         'maxWidth', 'maxHeight', 'minWidth', 'minHeight'
     ];

     var defined_styles = {
         fabric: {
                   width: '100%',
                   height: '250px',
                   paddingLeft: 0,
                   paddingRight: 0,
                   paddingBottom: 0,
                   maxWidth: 'none',
                   margin: 0
                 }
     };

    messenger.register('resize', function(specs, ret, iframe) {
        return resize(specs, iframe, iframe.closest('.js-ad-slot'));
    });

    return resize;

    function resize(specs, iframe, adSlot) {

      if (!specs) {
          return null;
      }

      var styles = {}

      // extract defined styles
      if ('style' in specs && specs.style in defined_styles) {
        Object.keys(defined_styles[specs.style]).forEach(function (prop) {
          styles[prop] = defined_styles[specs.style][prop]
        });
      }

      // extract specific properties
      Object.keys(specs).forEach(function (prop) {
        if (properties.indexOf(prop) >= 0) {
            styles[prop] = normalise(specs[prop]);
        }
      });

      return fastdom.write(function () {
          assign(adSlot.style, styles);
          assign(iframe.style, styles);
      });
    }

    function normalise(length) {
        var matches = String(length).match(lengthRegexp);
        if (!matches) {
            return null;
        }
        return matches[1] ?
            matches[2] + (matches[3] === undefined ? defaultUnit : matches[3]) :
            matches[0];
    }
});
