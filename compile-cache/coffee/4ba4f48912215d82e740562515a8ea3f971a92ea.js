(function() {
  var findClosingIndex, split, _ref;

  _ref = require('../lib/utils'), findClosingIndex = _ref.findClosingIndex, split = _ref.split;

  describe('.split()', function() {
    var tests;
    tests = [['a,b,c', ['a', 'b', 'c']], ['a,b(),c', ['a', 'b()', 'c']], ['a,b(c)', ['a', 'b(c)']], ['a,(b, c)', ['a', '(b,c)']], ['a,(b, c())', ['a', '(b,c())']], ['a(b, c())', ['a(b,c())']], ['a,)(', ['a']], ['a(,', []], ['(,', []], ['(,(,(,)', []], ['a,(,', ['a']], ['a,((),', ['a']], ['a,()),', ['a', '()']]];
    return tests.forEach(function(_arg) {
      var expected, source;
      source = _arg[0], expected = _arg[1];
      return it("splits " + (jasmine.pp(source)) + " as " + (jasmine.pp(expected)), function() {
        return expect(split(source)).toEqual(expected);
      });
    });
  });

  describe('.findClosingIndex()', function() {
    var tests;
    tests = [['a(', -1], ['a()', 2], ['a(((()', -1]];
    return tests.forEach(function(_arg) {
      var expected, source;
      source = _arg[0], expected = _arg[1];
      return it("returs the index of the closing character", function() {
        return expect(findClosingIndex(source, 2, '(', ')')).toEqual(expected);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL3V0aWxzLXNwZWMuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZCQUFBOztBQUFBLEVBQUEsT0FBNEIsT0FBQSxDQUFRLGNBQVIsQ0FBNUIsRUFBQyx3QkFBQSxnQkFBRCxFQUFtQixhQUFBLEtBQW5CLENBQUE7O0FBQUEsRUFFQSxRQUFBLENBQVMsVUFBVCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsUUFBQSxLQUFBO0FBQUEsSUFBQSxLQUFBLEdBQVEsQ0FDTixDQUFDLE9BQUQsRUFBVSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQUFWLENBRE0sRUFFTixDQUFDLFNBQUQsRUFBWSxDQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsR0FBYixDQUFaLENBRk0sRUFHTixDQUFDLFFBQUQsRUFBVyxDQUFDLEdBQUQsRUFBTSxNQUFOLENBQVgsQ0FITSxFQUlOLENBQUMsVUFBRCxFQUFhLENBQUMsR0FBRCxFQUFNLE9BQU4sQ0FBYixDQUpNLEVBS04sQ0FBQyxZQUFELEVBQWUsQ0FBQyxHQUFELEVBQU0sU0FBTixDQUFmLENBTE0sRUFNTixDQUFDLFdBQUQsRUFBYyxDQUFDLFVBQUQsQ0FBZCxDQU5NLEVBT04sQ0FBQyxNQUFELEVBQVMsQ0FBQyxHQUFELENBQVQsQ0FQTSxFQVFOLENBQUMsS0FBRCxFQUFRLEVBQVIsQ0FSTSxFQVNOLENBQUMsSUFBRCxFQUFPLEVBQVAsQ0FUTSxFQVVOLENBQUMsU0FBRCxFQUFZLEVBQVosQ0FWTSxFQVdOLENBQUMsTUFBRCxFQUFTLENBQUMsR0FBRCxDQUFULENBWE0sRUFZTixDQUFDLFFBQUQsRUFBVyxDQUFDLEdBQUQsQ0FBWCxDQVpNLEVBYU4sQ0FBQyxRQUFELEVBQVcsQ0FBQyxHQUFELEVBQU0sSUFBTixDQUFYLENBYk0sQ0FBUixDQUFBO1dBZ0JBLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBQyxJQUFELEdBQUE7QUFDWixVQUFBLGdCQUFBO0FBQUEsTUFEYyxrQkFBUSxrQkFDdEIsQ0FBQTthQUFBLEVBQUEsQ0FBSSxTQUFBLEdBQVEsQ0FBQyxPQUFPLENBQUMsRUFBUixDQUFXLE1BQVgsQ0FBRCxDQUFSLEdBQTJCLE1BQTNCLEdBQWdDLENBQUMsT0FBTyxDQUFDLEVBQVIsQ0FBVyxRQUFYLENBQUQsQ0FBcEMsRUFBNkQsU0FBQSxHQUFBO2VBQzNELE1BQUEsQ0FBTyxLQUFBLENBQU0sTUFBTixDQUFQLENBQXFCLENBQUMsT0FBdEIsQ0FBOEIsUUFBOUIsRUFEMkQ7TUFBQSxDQUE3RCxFQURZO0lBQUEsQ0FBZCxFQWpCbUI7RUFBQSxDQUFyQixDQUZBLENBQUE7O0FBQUEsRUF1QkEsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUEsR0FBQTtBQUM5QixRQUFBLEtBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxDQUNOLENBQUMsSUFBRCxFQUFPLENBQUEsQ0FBUCxDQURNLEVBRU4sQ0FBQyxLQUFELEVBQVEsQ0FBUixDQUZNLEVBR04sQ0FBQyxRQUFELEVBQVcsQ0FBQSxDQUFYLENBSE0sQ0FBUixDQUFBO1dBTUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLElBQUQsR0FBQTtBQUNaLFVBQUEsZ0JBQUE7QUFBQSxNQURjLGtCQUFRLGtCQUN0QixDQUFBO2FBQUEsRUFBQSxDQUFHLDJDQUFILEVBQWdELFNBQUEsR0FBQTtlQUM5QyxNQUFBLENBQU8sZ0JBQUEsQ0FBaUIsTUFBakIsRUFBeUIsQ0FBekIsRUFBNEIsR0FBNUIsRUFBaUMsR0FBakMsQ0FBUCxDQUE2QyxDQUFDLE9BQTlDLENBQXNELFFBQXRELEVBRDhDO01BQUEsQ0FBaEQsRUFEWTtJQUFBLENBQWQsRUFQOEI7RUFBQSxDQUFoQyxDQXZCQSxDQUFBO0FBQUEiCn0=

//# sourceURL=/home/william/.atom/packages/pigments/spec/utils-spec.coffee
