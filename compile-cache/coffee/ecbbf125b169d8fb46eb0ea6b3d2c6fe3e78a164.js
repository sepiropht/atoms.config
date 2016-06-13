(function() {
  module.exports = function() {
    return {
      hexToRgb: function(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
          hex = hex.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
        }
        return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
      },
      hexaToRgb: function(hexa) {
        return this.hexToRgb((hexa.match(/rgba\((\#.+),/))[1]);
      },
      hexToHsl: function(hex) {
        return this.rgbToHsl(this.hexToRgb(hex.replace('#', '')));
      },
      rgbToHex: function(rgb) {
        var _componentToHex;
        _componentToHex = function(component) {
          var _hex;
          _hex = component.toString(16);
          if (_hex.length === 1) {
            return "0" + _hex;
          } else {
            return _hex;
          }
        };
        return [_componentToHex(rgb[0]), _componentToHex(rgb[1]), _componentToHex(rgb[2])].join('');
      },
      rgbToHsl: function(_arg) {
        var b, g, r, _d, _h, _l, _max, _min, _s;
        r = _arg[0], g = _arg[1], b = _arg[2];
        r /= 255;
        g /= 255;
        b /= 255;
        _max = Math.max(r, g, b);
        _min = Math.min(r, g, b);
        _l = (_max + _min) / 2;
        if (_max === _min) {
          return [0, 0, Math.floor(_l * 100)];
        }
        _d = _max - _min;
        _s = _l > 0.5 ? _d / (2 - _max - _min) : _d / (_max + _min);
        switch (_max) {
          case r:
            _h = (g - b) / _d + (g < b ? 6 : 0);
            break;
          case g:
            _h = (b - r) / _d + 2;
            break;
          case b:
            _h = (r - g) / _d + 4;
        }
        _h /= 6;
        return [Math.floor(_h * 360), Math.floor(_s * 100), Math.floor(_l * 100)];
      },
      rgbToHsv: function(_arg) {
        var b, computedH, computedS, computedV, d, g, h, maxRGB, minRGB, r;
        r = _arg[0], g = _arg[1], b = _arg[2];
        computedH = 0;
        computedS = 0;
        computedV = 0;
        if ((r == null) || (g == null) || (b == null) || isNaN(r) || isNaN(g) || isNaN(b)) {
          return;
        }
        if (r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255) {
          return;
        }
        r = r / 255;
        g = g / 255;
        b = b / 255;
        minRGB = Math.min(r, Math.min(g, b));
        maxRGB = Math.max(r, Math.max(g, b));
        if (minRGB === maxRGB) {
          computedV = minRGB;
          return [0, 0, computedV];
        }
        d = (r === minRGB ? g - b : (b === minRGB ? r - g : b - r));
        h = (r === minRGB ? 3 : (b === minRGB ? 1 : 5));
        computedH = 60 * (h - d / (maxRGB - minRGB));
        computedS = (maxRGB - minRGB) / maxRGB;
        computedV = maxRGB;
        return [computedH, computedS, computedV];
      },
      hsvToHsl: function(_arg) {
        var h, s, v;
        h = _arg[0], s = _arg[1], v = _arg[2];
        return [h, s * v / ((h = (2 - s) * v) < 1 ? h : 2 - h), h / 2];
      },
      hsvToRgb: function(_arg) {
        var h, s, v, _f, _i, _p, _q, _result, _t;
        h = _arg[0], s = _arg[1], v = _arg[2];
        h /= 60;
        s /= 100;
        v /= 100;
        if (s === 0) {
          return [Math.round(v * 255), Math.round(v * 255), Math.round(v * 255)];
        }
        _i = Math.floor(h);
        _f = h - _i;
        _p = v * (1 - s);
        _q = v * (1 - s * _f);
        _t = v * (1 - s * (1 - _f));
        _result = (function() {
          switch (_i) {
            case 0:
              return [v, _t, _p];
            case 1:
              return [_q, v, _p];
            case 2:
              return [_p, v, _t];
            case 3:
              return [_p, _q, v];
            case 4:
              return [_t, _p, v];
            case 5:
              return [v, _p, _q];
            default:
              return [v, _t, _p];
          }
        })();
        return [Math.round(_result[0] * 255), Math.round(_result[1] * 255), Math.round(_result[2] * 255)];
      },
      hslToHsv: function(_arg) {
        var h, l, s;
        h = _arg[0], s = _arg[1], l = _arg[2];
        s /= 100;
        l /= 100;
        s *= l < .5 ? l : 1 - l;
        return [h, (2 * s / (l + s)) || 0, l + s];
      },
      hslToRgb: function(input) {
        var h, s, v, _ref;
        _ref = this.hslToHsv(input), h = _ref[0], s = _ref[1], v = _ref[2];
        return this.hsvToRgb([h, s * 100, v * 100]);
      },
      vecToRgb: function(input) {
        return [(input[0] * 255) << 0, (input[1] * 255) << 0, (input[2] * 255) << 0];
      },
      rgbToVec: function(input) {
        return [(input[0] / 255).toFixed(2), (input[1] / 255).toFixed(2), (input[2] / 255).toFixed(2)];
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9jb2xvci1waWNrZXIvbGliL21vZHVsZXMvQ29udmVydC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFJSTtBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQSxHQUFBO1dBTWI7QUFBQSxNQUFBLFFBQUEsRUFBVSxTQUFDLEdBQUQsR0FBQTtBQUNOLFFBQUEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxPQUFKLENBQVksR0FBWixFQUFpQixFQUFqQixDQUFOLENBQUE7QUFDQSxRQUFBLElBQWlELEdBQUcsQ0FBQyxNQUFKLEtBQWMsQ0FBL0Q7QUFBQSxVQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosRUFBeUIsY0FBekIsQ0FBTixDQUFBO1NBREE7QUFHQSxlQUFPLENBQ0gsUUFBQSxDQUFVLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FBVixFQUE0QixFQUE1QixDQURHLEVBRUgsUUFBQSxDQUFVLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FBVixFQUE0QixFQUE1QixDQUZHLEVBR0gsUUFBQSxDQUFVLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FBVixFQUE0QixFQUE1QixDQUhHLENBQVAsQ0FKTTtNQUFBLENBQVY7QUFBQSxNQVlBLFNBQUEsRUFBVyxTQUFDLElBQUQsR0FBQTtBQUNQLGVBQU8sSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFDLElBQUksQ0FBQyxLQUFMLENBQVcsZUFBWCxDQUFELENBQTZCLENBQUEsQ0FBQSxDQUF2QyxDQUFQLENBRE87TUFBQSxDQVpYO0FBQUEsTUFrQkEsUUFBQSxFQUFVLFNBQUMsR0FBRCxHQUFBO0FBQ04sZUFBTyxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxRQUFELENBQVUsR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUFaLEVBQWlCLEVBQWpCLENBQVYsQ0FBVixDQUFQLENBRE07TUFBQSxDQWxCVjtBQUFBLE1Bd0JBLFFBQUEsRUFBVSxTQUFDLEdBQUQsR0FBQTtBQUNOLFlBQUEsZUFBQTtBQUFBLFFBQUEsZUFBQSxHQUFrQixTQUFDLFNBQUQsR0FBQTtBQUNkLGNBQUEsSUFBQTtBQUFBLFVBQUEsSUFBQSxHQUFPLFNBQVMsQ0FBQyxRQUFWLENBQW1CLEVBQW5CLENBQVAsQ0FBQTtBQUNPLFVBQUEsSUFBRyxJQUFJLENBQUMsTUFBTCxLQUFlLENBQWxCO21CQUEwQixHQUFBLEdBQWhELEtBQXNCO1dBQUEsTUFBQTttQkFBMkMsS0FBM0M7V0FGTztRQUFBLENBQWxCLENBQUE7QUFJQSxlQUFPLENBQ0YsZUFBQSxDQUFnQixHQUFJLENBQUEsQ0FBQSxDQUFwQixDQURFLEVBRUYsZUFBQSxDQUFnQixHQUFJLENBQUEsQ0FBQSxDQUFwQixDQUZFLEVBR0YsZUFBQSxDQUFnQixHQUFJLENBQUEsQ0FBQSxDQUFwQixDQUhFLENBSU4sQ0FBQyxJQUpLLENBSUEsRUFKQSxDQUFQLENBTE07TUFBQSxDQXhCVjtBQUFBLE1Bc0NBLFFBQUEsRUFBVSxTQUFDLElBQUQsR0FBQTtBQUNOLFlBQUEsbUNBQUE7QUFBQSxRQURRLGFBQUcsYUFBRyxXQUNkLENBQUE7QUFBQSxRQUFBLENBQUEsSUFBSyxHQUFMLENBQUE7QUFBQSxRQUNBLENBQUEsSUFBSyxHQURMLENBQUE7QUFBQSxRQUVBLENBQUEsSUFBSyxHQUZMLENBQUE7QUFBQSxRQUlBLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsQ0FBZixDQUpQLENBQUE7QUFBQSxRQUtBLElBQUEsR0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsQ0FBZixDQUxQLENBQUE7QUFBQSxRQU9BLEVBQUEsR0FBSyxDQUFDLElBQUEsR0FBTyxJQUFSLENBQUEsR0FBZ0IsQ0FQckIsQ0FBQTtBQVNBLFFBQUEsSUFBRyxJQUFBLEtBQVEsSUFBWDtBQUFxQixpQkFBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFBLEdBQUssR0FBaEIsQ0FBUCxDQUFQLENBQXJCO1NBVEE7QUFBQSxRQVdBLEVBQUEsR0FBSyxJQUFBLEdBQU8sSUFYWixDQUFBO0FBQUEsUUFZQSxFQUFBLEdBQVEsRUFBQSxHQUFLLEdBQVIsR0FBaUIsRUFBQSxHQUFLLENBQUMsQ0FBQSxHQUFJLElBQUosR0FBVyxJQUFaLENBQXRCLEdBQTZDLEVBQUEsR0FBSyxDQUFDLElBQUEsR0FBTyxJQUFSLENBWnZELENBQUE7QUFjQSxnQkFBTyxJQUFQO0FBQUEsZUFDUyxDQURUO0FBQ2dCLFlBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQSxHQUFJLENBQUwsQ0FBQSxHQUFVLEVBQVYsR0FBZSxDQUFJLENBQUEsR0FBSSxDQUFQLEdBQWMsQ0FBZCxHQUFxQixDQUF0QixDQUFwQixDQURoQjtBQUNTO0FBRFQsZUFFUyxDQUZUO0FBRWdCLFlBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQSxHQUFJLENBQUwsQ0FBQSxHQUFVLEVBQVYsR0FBZSxDQUFwQixDQUZoQjtBQUVTO0FBRlQsZUFHUyxDQUhUO0FBR2dCLFlBQUEsRUFBQSxHQUFLLENBQUMsQ0FBQSxHQUFJLENBQUwsQ0FBQSxHQUFVLEVBQVYsR0FBZSxDQUFwQixDQUhoQjtBQUFBLFNBZEE7QUFBQSxRQW1CQSxFQUFBLElBQU0sQ0FuQk4sQ0FBQTtBQXFCQSxlQUFPLENBQ0gsSUFBSSxDQUFDLEtBQUwsQ0FBVyxFQUFBLEdBQUssR0FBaEIsQ0FERyxFQUVILElBQUksQ0FBQyxLQUFMLENBQVcsRUFBQSxHQUFLLEdBQWhCLENBRkcsRUFHSCxJQUFJLENBQUMsS0FBTCxDQUFXLEVBQUEsR0FBSyxHQUFoQixDQUhHLENBQVAsQ0F0Qk07TUFBQSxDQXRDVjtBQUFBLE1Bb0VBLFFBQUEsRUFBVSxTQUFDLElBQUQsR0FBQTtBQUNOLFlBQUEsOERBQUE7QUFBQSxRQURRLGFBQUcsYUFBRyxXQUNkLENBQUE7QUFBQSxRQUFBLFNBQUEsR0FBWSxDQUFaLENBQUE7QUFBQSxRQUNBLFNBQUEsR0FBWSxDQURaLENBQUE7QUFBQSxRQUVBLFNBQUEsR0FBWSxDQUZaLENBQUE7QUFJQSxRQUFBLElBQU8sV0FBSixJQUFjLFdBQWQsSUFBd0IsV0FBeEIsSUFBOEIsS0FBQSxDQUFNLENBQU4sQ0FBOUIsSUFBMEMsS0FBQSxDQUFNLENBQU4sQ0FBMUMsSUFBc0QsS0FBQSxDQUFNLENBQU4sQ0FBekQ7QUFDSSxnQkFBQSxDQURKO1NBSkE7QUFNQSxRQUFBLElBQUcsQ0FBQSxHQUFJLENBQUosSUFBUyxDQUFBLEdBQUksQ0FBYixJQUFrQixDQUFBLEdBQUksQ0FBdEIsSUFBMkIsQ0FBQSxHQUFJLEdBQS9CLElBQXNDLENBQUEsR0FBSSxHQUExQyxJQUFpRCxDQUFBLEdBQUksR0FBeEQ7QUFDSSxnQkFBQSxDQURKO1NBTkE7QUFBQSxRQVNBLENBQUEsR0FBSSxDQUFBLEdBQUksR0FUUixDQUFBO0FBQUEsUUFVQSxDQUFBLEdBQUksQ0FBQSxHQUFJLEdBVlIsQ0FBQTtBQUFBLFFBV0EsQ0FBQSxHQUFJLENBQUEsR0FBSSxHQVhSLENBQUE7QUFBQSxRQWFBLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFaLENBQVosQ0FiVCxDQUFBO0FBQUEsUUFjQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBWixDQUFaLENBZFQsQ0FBQTtBQWlCQSxRQUFBLElBQUcsTUFBQSxLQUFVLE1BQWI7QUFDSSxVQUFBLFNBQUEsR0FBWSxNQUFaLENBQUE7QUFFQSxpQkFBTyxDQUNILENBREcsRUFFSCxDQUZHLEVBR0gsU0FIRyxDQUFQLENBSEo7U0FqQkE7QUFBQSxRQTBCQSxDQUFBLEdBQUksQ0FBSyxDQUFBLEtBQUssTUFBVCxHQUFzQixDQUFBLEdBQUksQ0FBMUIsR0FBa0MsQ0FBSyxDQUFBLEtBQUssTUFBVCxHQUFzQixDQUFBLEdBQUksQ0FBMUIsR0FBaUMsQ0FBQSxHQUFJLENBQXRDLENBQW5DLENBMUJKLENBQUE7QUFBQSxRQTJCQSxDQUFBLEdBQUksQ0FBSyxDQUFBLEtBQUssTUFBVCxHQUFzQixDQUF0QixHQUE4QixDQUFLLENBQUEsS0FBSyxNQUFULEdBQXNCLENBQXRCLEdBQTZCLENBQTlCLENBQS9CLENBM0JKLENBQUE7QUFBQSxRQTZCQSxTQUFBLEdBQVksRUFBQSxHQUFLLENBQUMsQ0FBQSxHQUFJLENBQUEsR0FBSSxDQUFDLE1BQUEsR0FBUyxNQUFWLENBQVQsQ0E3QmpCLENBQUE7QUFBQSxRQThCQSxTQUFBLEdBQVksQ0FBQyxNQUFBLEdBQVMsTUFBVixDQUFBLEdBQW9CLE1BOUJoQyxDQUFBO0FBQUEsUUErQkEsU0FBQSxHQUFZLE1BL0JaLENBQUE7QUFpQ0EsZUFBTyxDQUNILFNBREcsRUFFSCxTQUZHLEVBR0gsU0FIRyxDQUFQLENBbENNO01BQUEsQ0FwRVY7QUFBQSxNQThHQSxRQUFBLEVBQVUsU0FBQyxJQUFELEdBQUE7QUFBZSxZQUFBLE9BQUE7QUFBQSxRQUFiLGFBQUcsYUFBRyxXQUFPLENBQUE7ZUFBQSxDQUNyQixDQURxQixFQUVyQixDQUFBLEdBQUksQ0FBSixHQUFRLENBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLEdBQVUsQ0FBZixDQUFBLEdBQW9CLENBQXZCLEdBQThCLENBQTlCLEdBQXFDLENBQUEsR0FBSSxDQUExQyxDQUZhLEVBR3JCLENBQUEsR0FBSSxDQUhpQixFQUFmO01BQUEsQ0E5R1Y7QUFBQSxNQXNIQSxRQUFBLEVBQVUsU0FBQyxJQUFELEdBQUE7QUFDTixZQUFBLG9DQUFBO0FBQUEsUUFEUSxhQUFHLGFBQUcsV0FDZCxDQUFBO0FBQUEsUUFBQSxDQUFBLElBQUssRUFBTCxDQUFBO0FBQUEsUUFDQSxDQUFBLElBQUssR0FETCxDQUFBO0FBQUEsUUFFQSxDQUFBLElBQUssR0FGTCxDQUFBO0FBS0EsUUFBQSxJQUFHLENBQUEsS0FBSyxDQUFSO0FBQWUsaUJBQU8sQ0FDbEIsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFBLEdBQUksR0FBZixDQURrQixFQUVsQixJQUFJLENBQUMsS0FBTCxDQUFXLENBQUEsR0FBSSxHQUFmLENBRmtCLEVBR2xCLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQSxHQUFJLEdBQWYsQ0FIa0IsQ0FBUCxDQUFmO1NBTEE7QUFBQSxRQVVBLEVBQUEsR0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVgsQ0FWTCxDQUFBO0FBQUEsUUFXQSxFQUFBLEdBQUssQ0FBQSxHQUFJLEVBWFQsQ0FBQTtBQUFBLFFBWUEsRUFBQSxHQUFLLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFMLENBWlQsQ0FBQTtBQUFBLFFBYUEsRUFBQSxHQUFLLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFBLEdBQUksRUFBVCxDQWJULENBQUE7QUFBQSxRQWNBLEVBQUEsR0FBSyxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFJLEVBQUwsQ0FBVCxDQWRULENBQUE7QUFBQSxRQWdCQSxPQUFBO0FBQVUsa0JBQU8sRUFBUDtBQUFBLGlCQUNELENBREM7cUJBQ00sQ0FBQyxDQUFELEVBQUksRUFBSixFQUFRLEVBQVIsRUFETjtBQUFBLGlCQUVELENBRkM7cUJBRU0sQ0FBQyxFQUFELEVBQUssQ0FBTCxFQUFRLEVBQVIsRUFGTjtBQUFBLGlCQUdELENBSEM7cUJBR00sQ0FBQyxFQUFELEVBQUssQ0FBTCxFQUFRLEVBQVIsRUFITjtBQUFBLGlCQUlELENBSkM7cUJBSU0sQ0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLENBQVQsRUFKTjtBQUFBLGlCQUtELENBTEM7cUJBS00sQ0FBQyxFQUFELEVBQUssRUFBTCxFQUFTLENBQVQsRUFMTjtBQUFBLGlCQU1ELENBTkM7cUJBTU0sQ0FBQyxDQUFELEVBQUksRUFBSixFQUFRLEVBQVIsRUFOTjtBQUFBO3FCQU9ELENBQUMsQ0FBRCxFQUFJLEVBQUosRUFBUSxFQUFSLEVBUEM7QUFBQTtZQWhCVixDQUFBO0FBeUJBLGVBQU8sQ0FDSCxJQUFJLENBQUMsS0FBTCxDQUFXLE9BQVEsQ0FBQSxDQUFBLENBQVIsR0FBYSxHQUF4QixDQURHLEVBRUgsSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQWEsR0FBeEIsQ0FGRyxFQUdILElBQUksQ0FBQyxLQUFMLENBQVcsT0FBUSxDQUFBLENBQUEsQ0FBUixHQUFhLEdBQXhCLENBSEcsQ0FBUCxDQTFCTTtNQUFBLENBdEhWO0FBQUEsTUF3SkEsUUFBQSxFQUFVLFNBQUMsSUFBRCxHQUFBO0FBQ04sWUFBQSxPQUFBO0FBQUEsUUFEUSxhQUFHLGFBQUcsV0FDZCxDQUFBO0FBQUEsUUFBQSxDQUFBLElBQUssR0FBTCxDQUFBO0FBQUEsUUFDQSxDQUFBLElBQUssR0FETCxDQUFBO0FBQUEsUUFHQSxDQUFBLElBQVEsQ0FBQSxHQUFJLEVBQVAsR0FBZSxDQUFmLEdBQXNCLENBQUEsR0FBSSxDQUgvQixDQUFBO0FBS0EsZUFBTyxDQUNILENBREcsRUFFSCxDQUFDLENBQUEsR0FBSSxDQUFKLEdBQVEsQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFULENBQUEsSUFBcUIsQ0FGbEIsRUFHSCxDQUFBLEdBQUksQ0FIRCxDQUFQLENBTk07TUFBQSxDQXhKVjtBQUFBLE1Bc0tBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUNOLFlBQUEsYUFBQTtBQUFBLFFBQUEsT0FBWSxJQUFDLENBQUEsUUFBRCxDQUFVLEtBQVYsQ0FBWixFQUFDLFdBQUQsRUFBSSxXQUFKLEVBQU8sV0FBUCxDQUFBO0FBQ0EsZUFBTyxJQUFDLENBQUEsUUFBRCxDQUFVLENBQUMsQ0FBRCxFQUFLLENBQUEsR0FBSSxHQUFULEVBQWdCLENBQUEsR0FBSSxHQUFwQixDQUFWLENBQVAsQ0FGTTtNQUFBLENBdEtWO0FBQUEsTUE2S0EsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQVcsZUFBTyxDQUN4QixDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxHQUFaLENBQUEsSUFBb0IsQ0FESSxFQUV4QixDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxHQUFaLENBQUEsSUFBb0IsQ0FGSSxFQUd4QixDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxHQUFaLENBQUEsSUFBb0IsQ0FISSxDQUFQLENBQVg7TUFBQSxDQTdLVjtBQUFBLE1BcUxBLFFBQUEsRUFBVSxTQUFDLEtBQUQsR0FBQTtBQUFXLGVBQU8sQ0FDeEIsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFOLEdBQVcsR0FBWixDQUFnQixDQUFDLE9BQWpCLENBQXlCLENBQXpCLENBRHdCLEVBRXhCLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXLEdBQVosQ0FBZ0IsQ0FBQyxPQUFqQixDQUF5QixDQUF6QixDQUZ3QixFQUd4QixDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxHQUFaLENBQWdCLENBQUMsT0FBakIsQ0FBeUIsQ0FBekIsQ0FId0IsQ0FBUCxDQUFYO01BQUEsQ0FyTFY7TUFOYTtFQUFBLENBQWpCLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/william/.atom/packages/color-picker/lib/modules/Convert.coffee
