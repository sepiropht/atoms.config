(function() {
  var Emitter, TodoModel, _, maxLength, path;

  path = require('path');

  Emitter = require('atom').Emitter;

  _ = require('underscore-plus');

  maxLength = 120;

  module.exports = TodoModel = (function() {
    function TodoModel(match, arg) {
      var plain;
      plain = (arg != null ? arg : []).plain;
      if (plain) {
        return _.extend(this, match);
      }
      this.handleScanMatch(match);
    }

    TodoModel.prototype.getAllKeys = function() {
      return atom.config.get('todo-show.showInTable') || ['Text'];
    };

    TodoModel.prototype.get = function(key) {
      var value;
      if (key == null) {
        key = '';
      }
      if ((value = this[key.toLowerCase()]) || value === '') {
        return value;
      }
      return this.text || 'No details';
    };

    TodoModel.prototype.getMarkdown = function(key) {
      var value;
      if (key == null) {
        key = '';
      }
      if (!(value = this[key.toLowerCase()])) {
        return '';
      }
      switch (key) {
        case 'All':
        case 'Text':
          return " " + value;
        case 'Type':
        case 'Project':
          return " __" + value + "__";
        case 'Range':
        case 'Line':
          return " _:" + value + "_";
        case 'Regex':
          return " _'" + value + "'_";
        case 'Path':
        case 'File':
          return " [" + value + "](" + value + ")";
        case 'Tags':
        case 'Id':
          return " _" + value + "_";
      }
    };

    TodoModel.prototype.getMarkdownArray = function(keys) {
      var i, key, len, ref, results;
      ref = keys || this.getAllKeys();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        results.push(this.getMarkdown(key));
      }
      return results;
    };

    TodoModel.prototype.keyIsNumber = function(key) {
      return key === 'Range' || key === 'Line';
    };

    TodoModel.prototype.contains = function(string) {
      var i, item, key, len, ref;
      if (string == null) {
        string = '';
      }
      ref = this.getAllKeys();
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        if (!(item = this.get(key))) {
          break;
        }
        if (item.toLowerCase().indexOf(string.toLowerCase()) !== -1) {
          return true;
        }
      }
      return false;
    };

    TodoModel.prototype.handleScanMatch = function(match) {
      var _matchText, loc, matchText, matches, pos, project, ref, ref1, ref2, relativePath, tag;
      matchText = match.text || match.all || '';
      while ((_matchText = (ref = match.regexp) != null ? ref.exec(matchText) : void 0)) {
        if (!match.type) {
          match.type = _matchText[1];
        }
        matchText = _matchText.pop();
      }
      if (matchText.indexOf('(') === 0) {
        if (matches = matchText.match(/\((.*?)\):?(.*)/)) {
          matchText = matches.pop();
          match.id = matches.pop();
        }
      }
      matchText = this.stripCommentEnd(matchText);
      match.tags = ((function() {
        var results;
        results = [];
        while ((tag = /\s*#(\w+)[,.]?$/.exec(matchText))) {
          if (tag.length !== 2) {
            break;
          }
          matchText = matchText.slice(0, -tag.shift().length);
          results.push(tag.shift());
        }
        return results;
      })()).sort().join(', ');
      if (!matchText && match.all && (pos = (ref1 = match.position) != null ? (ref2 = ref1[0]) != null ? ref2[1] : void 0 : void 0)) {
        matchText = match.all.substr(0, pos);
        matchText = this.stripCommentStart(matchText);
      }
      if (matchText.length >= maxLength) {
        matchText = (matchText.substr(0, maxLength - 3)) + "...";
      }
      if (!(match.position && match.position.length > 0)) {
        match.position = [[0, 0]];
      }
      if (match.position.serialize) {
        match.range = match.position.serialize().toString();
      } else {
        match.range = match.position.toString();
      }
      relativePath = atom.project.relativizePath(match.loc);
      match.path = relativePath[1] || '';
      if ((loc = path.basename(match.loc)) !== 'undefined') {
        match.file = loc;
      } else {
        match.file = 'untitled';
      }
      if ((project = path.basename(relativePath[0])) !== 'null') {
        match.project = project;
      } else {
        match.project = '';
      }
      match.text = matchText || "No details";
      match.line = (parseInt(match.range.split(',')[0]) + 1).toString();
      match.regex = match.regex.replace('${TODOS}', match.type);
      match.id = match.id || '';
      return _.extend(this, match);
    };

    TodoModel.prototype.stripCommentStart = function(text) {
      var startRegex;
      if (text == null) {
        text = '';
      }
      startRegex = /(\/\*|<\?|<!--|<#|{-|\[\[|\/\/|#)\s*$/;
      return text.replace(startRegex, '').trim();
    };

    TodoModel.prototype.stripCommentEnd = function(text) {
      var endRegex;
      if (text == null) {
        text = '';
      }
      endRegex = /(\*\/}?|\?>|-->|#>|-}|\]\])\s*$/;
      return text.replace(endRegex, '').trim();
    };

    return TodoModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL3RvZG8tc2hvdy9saWIvdG9kby1tb2RlbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFTixVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUNaLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosU0FBQSxHQUFZOztFQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxtQkFBQyxLQUFELEVBQVEsR0FBUjtBQUNYLFVBQUE7TUFEb0IsdUJBQUQsTUFBVTtNQUM3QixJQUFnQyxLQUFoQztBQUFBLGVBQU8sQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFULEVBQWUsS0FBZixFQUFQOztNQUNBLElBQUMsQ0FBQSxlQUFELENBQWlCLEtBQWpCO0lBRlc7O3dCQUliLFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixDQUFBLElBQTRDLENBQUMsTUFBRDtJQURsQzs7d0JBR1osR0FBQSxHQUFLLFNBQUMsR0FBRDtBQUNILFVBQUE7O1FBREksTUFBTTs7TUFDVixJQUFnQixDQUFDLEtBQUEsR0FBUSxJQUFFLENBQUEsR0FBRyxDQUFDLFdBQUosQ0FBQSxDQUFBLENBQVgsQ0FBQSxJQUFrQyxLQUFBLEtBQVMsRUFBM0Q7QUFBQSxlQUFPLE1BQVA7O2FBQ0EsSUFBQyxDQUFBLElBQUQsSUFBUztJQUZOOzt3QkFJTCxXQUFBLEdBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTs7UUFEWSxNQUFNOztNQUNsQixJQUFBLENBQWlCLENBQUEsS0FBQSxHQUFRLElBQUUsQ0FBQSxHQUFHLENBQUMsV0FBSixDQUFBLENBQUEsQ0FBVixDQUFqQjtBQUFBLGVBQU8sR0FBUDs7QUFDQSxjQUFPLEdBQVA7QUFBQSxhQUNPLEtBRFA7QUFB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Q0FBQyxPQUFOLEdBQWdCLEdBSGxCOztNQUtBLEtBQUssQ0FBQyxJQUFOLEdBQWEsU0FBQSxJQUFhO01BQzFCLEtBQUssQ0FBQyxJQUFOLEdBQWEsQ0FBQyxRQUFBLENBQVMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFaLENBQWtCLEdBQWxCLENBQXVCLENBQUEsQ0FBQSxDQUFoQyxDQUFBLEdBQXNDLENBQXZDLENBQXlDLENBQUMsUUFBMUMsQ0FBQTtNQUNiLEtBQUssQ0FBQyxLQUFOLEdBQWMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFaLENBQW9CLFVBQXBCLEVBQWdDLEtBQUssQ0FBQyxJQUF0QztNQUNkLEtBQUssQ0FBQyxFQUFOLEdBQVcsS0FBSyxDQUFDLEVBQU4sSUFBWTthQUV2QixDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBZSxLQUFmO0lBN0RlOzt3QkErRGpCLGlCQUFBLEdBQW1CLFNBQUMsSUFBRDtBQUNqQixVQUFBOztRQURrQixPQUFPOztNQUN6QixVQUFBLEdBQWE7YUFDYixJQUFJLENBQUMsT0FBTCxDQUFhLFVBQWIsRUFBeUIsRUFBekIsQ0FBNEIsQ0FBQyxJQUE3QixDQUFBO0lBRmlCOzt3QkFJbkIsZUFBQSxHQUFpQixTQUFDLElBQUQ7QUFDZixVQUFBOztRQURnQixPQUFPOztNQUN2QixRQUFBLEdBQVc7YUFDWCxJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsRUFBdUIsRUFBdkIsQ0FBMEIsQ0FBQyxJQUEzQixDQUFBO0lBRmU7Ozs7O0FBOUduQiIsInNvdXJjZXNDb250ZW50IjpbInBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG57RW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxubWF4TGVuZ3RoID0gMTIwXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFRvZG9Nb2RlbFxuICBjb25zdHJ1Y3RvcjogKG1hdGNoLCB7cGxhaW59ID0gW10pIC0+XG4gICAgcmV0dXJuIF8uZXh0ZW5kKHRoaXMsIG1hdGNoKSBpZiBwbGFpblxuICAgIEBoYW5kbGVTY2FuTWF0Y2ggbWF0Y2hcblxuICBnZXRBbGxLZXlzOiAtPlxuICAgIGF0b20uY29uZmlnLmdldCgndG9kby1zaG93LnNob3dJblRhYmxlJykgb3IgWydUZXh0J11cblxuICBnZXQ6IChrZXkgPSAnJykgLT5cbiAgICByZXR1cm4gdmFsdWUgaWYgKHZhbHVlID0gQFtrZXkudG9Mb3dlckNhc2UoKV0pIG9yIHZhbHVlIGlzICcnXG4gICAgQHRleHQgb3IgJ05vIGRldGFpbHMnXG5cbiAgZ2V0TWFya2Rvd246IChrZXkgPSAnJykgLT5cbiAgICByZXR1cm4gJycgdW5sZXNzIHZhbHVlID0gQFtrZXkudG9Mb3dlckNhc2UoKV1cbiAgICBzd2l0Y2gga2V5XG4gICAgICB3aGVuICdBbGwnLCAnVGV4dCcgdGhlbiBcIiAje3ZhbHVlfVwiXG4gICAgICB3aGVuICdUeXBlJywgJ1Byb2plY3QnIHRoZW4gXCIgX18je3ZhbHVlfV9fXCJcbiAgICAgIHdoZW4gJ1JhbmdlJywgJ0xpbmUnIHRoZW4gXCIgXzoje3ZhbHVlfV9cIlxuICAgICAgd2hlbiAnUmVnZXgnIHRoZW4gXCIgXycje3ZhbHVlfSdfXCJcbiAgICAgIHdoZW4gJ1BhdGgnLCAnRmlsZScgdGhlbiBcIiBbI3t2YWx1ZX1dKCN7dmFsdWV9KVwiXG4gICAgICB3aGVuICdUYWdzJywgJ0lkJyB0aGVuIFwiIF8je3ZhbHVlfV9cIlxuXG4gIGdldE1hcmtkb3duQXJyYXk6IChrZXlzKSAtPlxuICAgIGZvciBrZXkgaW4ga2V5cyBvciBAZ2V0QWxsS2V5cygpXG4gICAgICBAZ2V0TWFya2Rvd24oa2V5KVxuXG4gIGtleUlzTnVtYmVyOiAoa2V5KSAtPlxuICAgIGtleSBpbiBbJ1JhbmdlJywgJ0xpbmUnXVxuXG4gIGNvbnRhaW5zOiAoc3RyaW5nID0gJycpIC0+XG4gICAgZm9yIGtleSBpbiBAZ2V0QWxsS2V5cygpXG4gICAgICBicmVhayB1bmxlc3MgaXRlbSA9IEBnZXQoa2V5KVxuICAgICAgcmV0dXJuIHRydWUgaWYgaXRlbS50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc3RyaW5nLnRvTG93ZXJDYXNlKCkpIGlzbnQgLTFcbiAgICBmYWxzZVxuXG4gIGhhbmRsZVNjYW5NYXRjaDogKG1hdGNoKSAtPlxuICAgIG1hdGNoVGV4dCA9IG1hdGNoLnRleHQgb3IgbWF0Y2guYWxsIG9yICcnXG5cbiAgICAjIFN0cmlwIG91dCB0aGUgcmVnZXggdG9rZW4gZnJvbSB0aGUgZm91bmQgYW5ub3RhdGlvblxuICAgICMgbm90IGFsbCBvYmplY3RzIHdpbGwgaGF2ZSBhbiBleGVjIG1hdGNoXG4gICAgd2hpbGUgKF9tYXRjaFRleHQgPSBtYXRjaC5yZWdleHA/LmV4ZWMobWF0Y2hUZXh0KSlcbiAgICAgICMgRmluZCBtYXRjaCB0eXBlXG4gICAgICBtYXRjaC50eXBlID0gX21hdGNoVGV4dFsxXSB1bmxlc3MgbWF0Y2gudHlwZVxuICAgICAgIyBFeHRyYWN0IHRvZG8gdGV4dFxuICAgICAgbWF0Y2hUZXh0ID0gX21hdGNoVGV4dC5wb3AoKVxuXG4gICAgIyBFeHRyYWN0IGdvb2dsZSBzdHlsZSBndWlkZSB0b2RvIGlkXG4gICAgaWYgbWF0Y2hUZXh0LmluZGV4T2YoJygnKSBpcyAwXG4gICAgICBpZiBtYXRjaGVzID0gbWF0Y2hUZXh0Lm1hdGNoKC9cXCgoLio/KVxcKTo/KC4qKS8pXG4gICAgICAgIG1hdGNoVGV4dCA9IG1hdGNoZXMucG9wKClcbiAgICAgICAgbWF0Y2guaWQgPSBtYXRjaGVzLnBvcCgpXG5cbiAgICBtYXRjaFRleHQgPSBAc3RyaXBDb21tZW50RW5kKG1hdGNoVGV4dClcblxuICAgICMgRXh0cmFjdCB0b2RvIHRhZ3NcbiAgICBtYXRjaC50YWdzID0gKHdoaWxlICh0YWcgPSAvXFxzKiMoXFx3KylbLC5dPyQvLmV4ZWMobWF0Y2hUZXh0KSlcbiAgICAgIGJyZWFrIGlmIHRhZy5sZW5ndGggaXNudCAyXG4gICAgICBtYXRjaFRleHQgPSBtYXRjaFRleHQuc2xpY2UoMCwgLXRhZy5zaGlmdCgpLmxlbmd0aClcbiAgICAgIHRhZy5zaGlmdCgpXG4gICAgKS5zb3J0KCkuam9pbignLCAnKVxuXG4gICAgIyBVc2UgdGV4dCBiZWZvcmUgdG9kbyBpZiBubyBjb250ZW50IGFmdGVyXG4gICAgaWYgbm90IG1hdGNoVGV4dCBhbmQgbWF0Y2guYWxsIGFuZCBwb3MgPSBtYXRjaC5wb3NpdGlvbj9bMF0/WzFdXG4gICAgICBtYXRjaFRleHQgPSBtYXRjaC5hbGwuc3Vic3RyKDAsIHBvcylcbiAgICAgIG1hdGNoVGV4dCA9IEBzdHJpcENvbW1lbnRTdGFydChtYXRjaFRleHQpXG5cbiAgICAjIFRydW5jYXRlIGxvbmcgbWF0Y2ggc3RyaW5nc1xuICAgIGlmIG1hdGNoVGV4dC5sZW5ndGggPj0gbWF4TGVuZ3RoXG4gICAgICBtYXRjaFRleHQgPSBcIiN7bWF0Y2hUZXh0LnN1YnN0cigwLCBtYXhMZW5ndGggLSAzKX0uLi5cIlxuXG4gICAgIyBNYWtlIHN1cmUgcmFuZ2UgaXMgc2VyaWFsaXplZCB0byBwcm9kdWNlIGNvcnJlY3QgcmVuZGVyZWQgZm9ybWF0XG4gICAgbWF0Y2gucG9zaXRpb24gPSBbWzAsMF1dIHVubGVzcyBtYXRjaC5wb3NpdGlvbiBhbmQgbWF0Y2gucG9zaXRpb24ubGVuZ3RoID4gMFxuICAgIGlmIG1hdGNoLnBvc2l0aW9uLnNlcmlhbGl6ZVxuICAgICAgbWF0Y2gucmFuZ2UgPSBtYXRjaC5wb3NpdGlvbi5zZXJpYWxpemUoKS50b1N0cmluZygpXG4gICAgZWxzZVxuICAgICAgbWF0Y2gucmFuZ2UgPSBtYXRjaC5wb3NpdGlvbi50b1N0cmluZygpXG5cbiAgICAjIEV4dHJhY3QgcGF0aHMgYW5kIHByb2plY3RcbiAgICByZWxhdGl2ZVBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgobWF0Y2gubG9jKVxuICAgIG1hdGNoLnBhdGggPSByZWxhdGl2ZVBhdGhbMV0gb3IgJydcblxuICAgIGlmIChsb2MgPSBwYXRoLmJhc2VuYW1lKG1hdGNoLmxvYykpIGlzbnQgJ3VuZGVmaW5lZCdcbiAgICAgIG1hdGNoLmZpbGUgPSBsb2NcbiAgICBlbHNlXG4gICAgICBtYXRjaC5maWxlID0gJ3VudGl0bGVkJ1xuXG4gICAgaWYgKHByb2plY3QgPSBwYXRoLmJhc2VuYW1lKHJlbGF0aXZlUGF0aFswXSkpIGlzbnQgJ251bGwnXG4gICAgICBtYXRjaC5wcm9qZWN0ID0gcHJvamVjdFxuICAgIGVsc2VcbiAgICAgIG1hdGNoLnByb2plY3QgPSAnJ1xuXG4gICAgbWF0Y2gudGV4dCA9IG1hdGNoVGV4dCBvciBcIk5vIGRldGFpbHNcIlxuICAgIG1hdGNoLmxpbmUgPSAocGFyc2VJbnQobWF0Y2gucmFuZ2Uuc3BsaXQoJywnKVswXSkgKyAxKS50b1N0cmluZygpXG4gICAgbWF0Y2gucmVnZXggPSBtYXRjaC5yZWdleC5yZXBsYWNlKCcke1RPRE9TfScsIG1hdGNoLnR5cGUpXG4gICAgbWF0Y2guaWQgPSBtYXRjaC5pZCBvciAnJ1xuXG4gICAgXy5leHRlbmQodGhpcywgbWF0Y2gpXG5cbiAgc3RyaXBDb21tZW50U3RhcnQ6ICh0ZXh0ID0gJycpIC0+XG4gICAgc3RhcnRSZWdleCA9IC8oXFwvXFwqfDxcXD98PCEtLXw8I3x7LXxcXFtcXFt8XFwvXFwvfCMpXFxzKiQvXG4gICAgdGV4dC5yZXBsYWNlKHN0YXJ0UmVnZXgsICcnKS50cmltKClcblxuICBzdHJpcENvbW1lbnRFbmQ6ICh0ZXh0ID0gJycpIC0+XG4gICAgZW5kUmVnZXggPSAvKFxcKlxcL30/fFxcPz58LS0+fCM+fC19fFxcXVxcXSlcXHMqJC9cbiAgICB0ZXh0LnJlcGxhY2UoZW5kUmVnZXgsICcnKS50cmltKClcbiJdfQ==
