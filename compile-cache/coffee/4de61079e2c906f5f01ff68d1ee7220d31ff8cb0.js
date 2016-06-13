(function() {
  var Color;

  require('./helpers/matchers');

  Color = require('../lib/color');

  describe('Color', function() {
    var color;
    color = [][0];
    beforeEach(function() {
      return color = new Color('#66ff6933');
    });
    describe('created with separated components', function() {
      return it('creates the color with the provided components', function() {
        return expect(new Color(255, 127, 64, 0.5)).toBeColor(255, 127, 64, 0.5);
      });
    });
    describe('created with a hexa rgb string', function() {
      return it('creates the color with the provided components', function() {
        return expect(new Color('#ff6933')).toBeColor(255, 105, 51, 1);
      });
    });
    describe('created with a hexa argb string', function() {
      return it('creates the color with the provided components', function() {
        return expect(new Color('#66ff6933')).toBeColor(255, 105, 51, 0.4);
      });
    });
    describe('created with the name of a svg color', function() {
      return it('creates the color using its name', function() {
        return expect(new Color('orange')).toBeColor('#ffa500');
      });
    });
    describe('::isValid', function() {
      it('returns true when all the color components are valid', function() {
        return expect(new Color).toBeValid();
      });
      it('returns false when one component is NaN', function() {
        expect(new Color(NaN, 0, 0, 1)).not.toBeValid();
        expect(new Color(0, NaN, 0, 1)).not.toBeValid();
        expect(new Color(0, 0, NaN, 1)).not.toBeValid();
        return expect(new Color(0, 0, 1, NaN)).not.toBeValid();
      });
      return it('returns false when the color has the invalid flag', function() {
        color = new Color;
        color.invalid = true;
        return expect(color).not.toBeValid();
      });
    });
    describe('::isLiteral', function() {
      it('returns true when the color does not rely on variables', function() {
        return expect(new Color('orange').isLiteral()).toBeTruthy();
      });
      return it('returns false when the color does rely on variables', function() {
        color = new Color(0, 0, 0, 1);
        color.variables = ['foo'];
        return expect(color.isLiteral()).toBeFalsy();
      });
    });
    describe('::rgb', function() {
      it('returns an array with the color components', function() {
        return expect(color.rgb).toBeComponentArrayCloseTo([color.red, color.green, color.blue]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.rgb = [1, 2, 3];
        return expect(color).toBeColor(1, 2, 3, 0.4);
      });
    });
    describe('::rgba', function() {
      it('returns an array with the color and alpha components', function() {
        return expect(color.rgba).toBeComponentArrayCloseTo([color.red, color.green, color.blue, color.alpha]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.rgba = [1, 2, 3, 0.7];
        return expect(color).toBeColor(1, 2, 3, 0.7);
      });
    });
    describe('::argb', function() {
      it('returns an array with the alpha and color components', function() {
        return expect(color.argb).toBeComponentArrayCloseTo([color.alpha, color.red, color.green, color.blue]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.argb = [0.7, 1, 2, 3];
        return expect(color).toBeColor(1, 2, 3, 0.7);
      });
    });
    describe('::hsv', function() {
      it('returns an array with the hue, saturation and value components', function() {
        return expect(color.hsv).toBeComponentArrayCloseTo([16, 80, 100]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsv = [200, 50, 50];
        return expect(color).toBeColor(64, 106, 128, 0.4);
      });
    });
    describe('::hsva', function() {
      it('returns an array with the hue, saturation, value and alpha components', function() {
        return expect(color.hsva).toBeComponentArrayCloseTo([16, 80, 100, 0.4]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsva = [200, 50, 50, 0.7];
        return expect(color).toBeColor(64, 106, 128, 0.7);
      });
    });
    describe('::hsl', function() {
      it('returns an array with the hue, saturation and luminosity components', function() {
        return expect(color.hsl).toBeComponentArrayCloseTo([16, 100, 60]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsl = [200, 50, 50];
        return expect(color).toBeColor(64, 149, 191, 0.4);
      });
    });
    describe('::hsla', function() {
      it('returns an array with the hue, saturation, luminosity and alpha components', function() {
        return expect(color.hsla).toBeComponentArrayCloseTo([16, 100, 60, 0.4]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hsla = [200, 50, 50, 0.7];
        return expect(color).toBeColor(64, 149, 191, 0.7);
      });
    });
    describe('::hwb', function() {
      it('returns an array with the hue, whiteness and blackness components', function() {
        return expect(color.hwb).toBeComponentArrayCloseTo([16, 20, 0]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hwb = [210, 40, 40];
        return expect(color).toBeColor(102, 128, 153, 0.4);
      });
    });
    describe('::hwba', function() {
      it('returns an array with the hue, whiteness, blackness and alpha components', function() {
        return expect(color.hwba).toBeComponentArrayCloseTo([16, 20, 0, 0.4]);
      });
      return it('sets the color components based on the passed-in values', function() {
        color.hwba = [210, 40, 40, 0.7];
        return expect(color).toBeColor(102, 128, 153, 0.7);
      });
    });
    describe('::hex', function() {
      it('returns the color as a hexadecimal string', function() {
        return expect(color.hex).toEqual('ff6933');
      });
      return it('parses the string and sets the color components accordingly', function() {
        color.hex = '00ff00';
        return expect(color).toBeColor(0, 255, 0, 0.4);
      });
    });
    describe('::hexARGB', function() {
      it('returns the color component as a hexadecimal string', function() {
        return expect(color.hexARGB).toEqual('66ff6933');
      });
      return it('parses the string and sets the color components accordingly', function() {
        color.hexARGB = 'ff00ff00';
        return expect(color).toBeColor(0, 255, 0, 1);
      });
    });
    describe('::hue', function() {
      it('returns the hue component', function() {
        return expect(color.hue).toEqual(color.hsl[0]);
      });
      return it('sets the hue component', function() {
        color.hue = 20;
        return expect(color.hsl).toBeComponentArrayCloseTo([20, 100, 60]);
      });
    });
    describe('::saturation', function() {
      it('returns the saturation component', function() {
        return expect(color.saturation).toEqual(color.hsl[1]);
      });
      return it('sets the saturation component', function() {
        color.saturation = 20;
        return expect(color.hsl).toBeComponentArrayCloseTo([16, 20, 60]);
      });
    });
    describe('::lightness', function() {
      it('returns the lightness component', function() {
        return expect(color.lightness).toEqual(color.hsl[2]);
      });
      return it('sets the lightness component', function() {
        color.lightness = 20;
        return expect(color.hsl).toBeComponentArrayCloseTo([16, 100, 20]);
      });
    });
    describe('::cmyk', function() {
      it('returns an array with the color in CMYK color space', function() {
        color = new Color('#FF7F00');
        return expect(color.cmyk).toBeComponentArrayCloseTo([0, 0.5, 1, 0]);
      });
      return it('sets the color components using cmyk values', function() {
        color.alpha = 1;
        color.cmyk = [0, 0.5, 1, 0];
        return expect(color).toBeColor('#FF7F00');
      });
    });
    describe('::clone', function() {
      return it('returns a copy of the current color', function() {
        expect(color.clone()).toBeColor(color);
        return expect(color.clone()).not.toBe(color);
      });
    });
    describe('::toCSS', function() {
      describe('when the color alpha channel is not 1', function() {
        return it('returns the color as a rgba() color', function() {
          return expect(color.toCSS()).toEqual('rgba(255,105,51,0.4)');
        });
      });
      describe('when the color alpha channel is 1', function() {
        return it('returns the color as a rgb() color', function() {
          color.alpha = 1;
          return expect(color.toCSS()).toEqual('rgb(255,105,51)');
        });
      });
      return describe('when the color have a CSS name', function() {
        return it('only returns the color name', function() {
          color = new Color('orange');
          return expect(color.toCSS()).toEqual('rgb(255,165,0)');
        });
      });
    });
    describe('::interpolate', function() {
      return it('blends the passed-in color linearly based on the passed-in ratio', function() {
        var colorA, colorB, colorC;
        colorA = new Color('#ff0000');
        colorB = new Color('#0000ff');
        colorC = colorA.interpolate(colorB, 0.5);
        return expect(colorC).toBeColor('#7f007f');
      });
    });
    describe('::blend', function() {
      return it('blends the passed-in color based on the passed-in blend function', function() {
        var colorA, colorB, colorC;
        colorA = new Color('#ff0000');
        colorB = new Color('#0000ff');
        colorC = colorA.blend(colorB, function(a, b) {
          return a / 2 + b / 2;
        });
        return expect(colorC).toBeColor('#800080');
      });
    });
    describe('::transparentize', function() {
      return it('returns a new color whose alpha is the passed-in value', function() {
        expect(color.transparentize(1)).toBeColor(255, 105, 51, 1);
        expect(color.transparentize(0.7)).toBeColor(255, 105, 51, 0.7);
        return expect(color.transparentize(0.1)).toBeColor(255, 105, 51, 0.1);
      });
    });
    return describe('::luma', function() {
      return it('returns the luma value of the color', function() {
        return expect(color.luma).toBeCloseTo(0.31, 1);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL2NvbG9yLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLEtBQUE7O0FBQUEsRUFBQSxPQUFBLENBQVEsb0JBQVIsQ0FBQSxDQUFBOztBQUFBLEVBRUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxjQUFSLENBRlIsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsQ0FBUyxPQUFULEVBQWtCLFNBQUEsR0FBQTtBQUNoQixRQUFBLEtBQUE7QUFBQSxJQUFDLFFBQVMsS0FBVixDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNLFdBQU4sRUFESDtJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFLQSxRQUFBLENBQVMsbUNBQVQsRUFBOEMsU0FBQSxHQUFBO2FBQzVDLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBLEdBQUE7ZUFDbkQsTUFBQSxDQUFXLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLEVBQWhCLEVBQW9CLEdBQXBCLENBQVgsQ0FBb0MsQ0FBQyxTQUFyQyxDQUErQyxHQUEvQyxFQUFvRCxHQUFwRCxFQUF5RCxFQUF6RCxFQUE2RCxHQUE3RCxFQURtRDtNQUFBLENBQXJELEVBRDRDO0lBQUEsQ0FBOUMsQ0FMQSxDQUFBO0FBQUEsSUFTQSxRQUFBLENBQVMsZ0NBQVQsRUFBMkMsU0FBQSxHQUFBO2FBQ3pDLEVBQUEsQ0FBRyxnREFBSCxFQUFxRCxTQUFBLEdBQUE7ZUFDbkQsTUFBQSxDQUFXLElBQUEsS0FBQSxDQUFNLFNBQU4sQ0FBWCxDQUE0QixDQUFDLFNBQTdCLENBQXVDLEdBQXZDLEVBQTRDLEdBQTVDLEVBQWlELEVBQWpELEVBQXFELENBQXJELEVBRG1E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

//# sourceURL=/home/william/.atom/packages/pigments/spec/color-spec.coffee
