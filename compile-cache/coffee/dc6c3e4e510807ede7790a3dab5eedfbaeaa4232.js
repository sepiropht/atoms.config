(function() {
  var InsertNl,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    slice = [].slice;

  module.exports = InsertNl = (function() {
    function InsertNl(editor) {
      this.editor = editor;
      this.insertText = bind(this.insertText, this);
      this.adviseBefore(this.editor, 'insertText', this.insertText);
    }

    InsertNl.prototype.insertText = function(text, options) {
      if (!(text === "\n")) {
        return true;
      }
      if (this.editor.hasMultipleCursors()) {
        return true;
      }
      if (!this.insertNewlineBetweenJSXTags()) {
        return false;
      }
      if (!this.insertNewlineAfterStyledComponentsBackTick()) {
        return false;
      }
      return true;
    };

    InsertNl.prototype.insertNewlineBetweenJSXTags = function() {
      var cursorBufferPosition, indentLength;
      cursorBufferPosition = this.editor.getCursorBufferPosition();
      if (!(cursorBufferPosition.column > 0)) {
        return true;
      }
      if ('JSXEndTagStart' !== this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().pop()) {
        return true;
      }
      cursorBufferPosition.column--;
      if ('JSXStartTagEnd' !== this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().pop()) {
        return true;
      }
      indentLength = this.editor.indentationForBufferRow(cursorBufferPosition.row);
      this.editor.insertText("\n\n");
      this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 1, indentLength + 1, {
        preserveLeadingWhitespace: false
      });
      this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 2, indentLength, {
        preserveLeadingWhitespace: false
      });
      this.editor.moveUp();
      this.editor.moveToEndOfLine();
      return false;
    };

    InsertNl.prototype.insertNewlineAfterStyledComponentsBackTick = function() {
      var cursorBufferPosition, indentLength;
      cursorBufferPosition = this.editor.getCursorBufferPosition();
      if (!(cursorBufferPosition.column > 0)) {
        return true;
      }
      if ('string.quoted.template.styled.start.js' !== this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().pop()) {
        return true;
      }
      cursorBufferPosition.column--;
      if ('string.quoted.template.styled.start.js' !== this.editor.scopeDescriptorForBufferPosition(cursorBufferPosition).getScopesArray().pop()) {
        return true;
      }
      indentLength = this.editor.indentationForBufferRow(cursorBufferPosition.row);
      this.editor.insertText("\n\n`");
      this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 1, indentLength + 1, {
        preserveLeadingWhitespace: false
      });
      this.editor.setIndentationForBufferRow(cursorBufferPosition.row + 2, indentLength, {
        preserveLeadingWhitespace: false
      });
      this.editor.moveUp();
      this.editor.moveToEndOfLine();
      return false;
    };

    InsertNl.prototype.adviseBefore = function(object, methodName, advice) {
      var original;
      original = object[methodName];
      return object[methodName] = function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        if (advice.apply(this, args) !== false) {
          return original.apply(this, args);
        }
      };
    };

    return InsertNl;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2xhbmd1YWdlLWJhYmVsL2xpYi9pbnNlcnQtbmwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxRQUFBO0lBQUE7OztFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxrQkFBQyxNQUFEO01BQUMsSUFBQyxDQUFBLFNBQUQ7O01BQ1osSUFBQyxDQUFBLFlBQUQsQ0FBYyxJQUFDLENBQUEsTUFBZixFQUF1QixZQUF2QixFQUFxQyxJQUFDLENBQUEsVUFBdEM7SUFEVzs7dUJBSWIsVUFBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLE9BQVA7TUFDVixJQUFBLENBQW1CLENBQUUsSUFBQSxLQUFRLElBQVYsQ0FBbkI7QUFBQSxlQUFPLEtBQVA7O01BQ0EsSUFBZSxJQUFDLENBQUEsTUFBTSxDQUFDLGtCQUFSLENBQUEsQ0FBZjtBQUFBLGVBQU8sS0FBUDs7TUFFQSxJQUFHLENBQUMsSUFBQyxDQUFBLDJCQUFELENBQUEsQ0FBSjtBQUF3QyxlQUFPLE1BQS9DOztNQUNBLElBQUcsQ0FBQyxJQUFDLENBQUEsMENBQUQsQ0FBQSxDQUFKO0FBQXVELGVBQU8sTUFBOUQ7O2FBQ0E7SUFOVTs7dUJBVVosMkJBQUEsR0FBNkIsU0FBQTtBQUMzQixVQUFBO01BQUEsb0JBQUEsR0FBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBO01BQ3ZCLElBQUEsQ0FBQSxDQUFtQixvQkFBb0IsQ0FBQyxNQUFyQixHQUE4QixDQUFqRCxDQUFBO0FBQUEsZUFBTyxLQUFQOztNQUNBLElBQW1CLGdCQUFBLEtBQW9CLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0NBQVIsQ0FBeUMsb0JBQXpDLENBQThELENBQUMsY0FBL0QsQ0FBQSxDQUErRSxDQUFDLEdBQWhGLENBQUEsQ0FBdkM7QUFBQSxlQUFPLEtBQVA7O01BQ0Esb0JBQW9CLENBQUMsTUFBckI7TUFDQSxJQUFtQixnQkFBQSxLQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLGdDQUFSLENBQXlDLG9CQUF6QyxDQUE4RCxDQUFDLGNBQS9ELENBQUEsQ0FBK0UsQ0FBQyxHQUFoRixDQUFBLENBQXZDO0FBQUEsZUFBTyxLQUFQOztNQUNBLFlBQUEsR0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQWdDLG9CQUFvQixDQUFDLEdBQXJEO01BQ2YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLE1BQW5CO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxvQkFBb0IsQ0FBQyxHQUFyQixHQUF5QixDQUE1RCxFQUErRCxZQUFBLEdBQWEsQ0FBNUUsRUFBK0U7UUFBRSx5QkFBQSxFQUEyQixLQUE3QjtPQUEvRTtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsMEJBQVIsQ0FBbUMsb0JBQW9CLENBQUMsR0FBckIsR0FBeUIsQ0FBNUQsRUFBK0QsWUFBL0QsRUFBNkU7UUFBRSx5QkFBQSxFQUEyQixLQUE3QjtPQUE3RTtNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQUE7YUFDQTtJQVoyQjs7dUJBZ0I3QiwwQ0FBQSxHQUE0QyxTQUFBO0FBQzFDLFVBQUE7TUFBQSxvQkFBQSxHQUF1QixJQUFDLENBQUEsTUFBTSxDQUFDLHVCQUFSLENBQUE7TUFDdkIsSUFBQSxDQUFBLENBQW1CLG9CQUFvQixDQUFDLE1BQXJCLEdBQThCLENBQWpELENBQUE7QUFBQSxlQUFPLEtBQVA7O01BQ0EsSUFBbUIsd0NBQUEsS0FBNEMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQ0FBUixDQUF5QyxvQkFBekMsQ0FBOEQsQ0FBQyxjQUEvRCxDQUFBLENBQStFLENBQUMsR0FBaEYsQ0FBQSxDQUEvRDtBQUFBLGVBQU8sS0FBUDs7TUFDQSxvQkFBb0IsQ0FBQyxNQUFyQjtNQUNBLElBQW1CLHdDQUFBLEtBQTRDLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0NBQVIsQ0FBeUMsb0JBQXpDLENBQThELENBQUMsY0FBL0QsQ0FBQSxDQUErRSxDQUFDLEdBQWhGLENBQUEsQ0FBL0Q7QUFBQSxlQUFPLEtBQVA7O01BQ0EsWUFBQSxHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0Msb0JBQW9CLENBQUMsR0FBckQ7TUFDZixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBbUIsT0FBbkI7TUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLDBCQUFSLENBQW1DLG9CQUFvQixDQUFDLEdBQXJCLEdBQXlCLENBQTVELEVBQStELFlBQUEsR0FBYSxDQUE1RSxFQUErRTtRQUFFLHlCQUFBLEVBQTJCLEtBQTdCO09BQS9FO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxvQkFBb0IsQ0FBQyxHQUFyQixHQUF5QixDQUE1RCxFQUErRCxZQUEvRCxFQUE2RTtRQUFFLHlCQUFBLEVBQTJCLEtBQTdCO09BQTdFO01BQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFSLENBQUE7TUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBQTthQUNBO0lBWjBDOzt1QkFnQjVDLFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLE1BQXJCO0FBQ1osVUFBQTtNQUFBLFFBQUEsR0FBVyxNQUFPLENBQUEsVUFBQTthQUNsQixNQUFPLENBQUEsVUFBQSxDQUFQLEdBQXFCLFNBQUE7QUFDbkIsWUFBQTtRQURvQjtRQUNwQixJQUFPLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBYixFQUFtQixJQUFuQixDQUFBLEtBQTRCLEtBQW5DO2lCQUNFLFFBQVEsQ0FBQyxLQUFULENBQWUsSUFBZixFQUFxQixJQUFyQixFQURGOztNQURtQjtJQUZUOzs7OztBQWhEaEIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBJbnNlcnRObFxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IpIC0+XG4gICAgQGFkdmlzZUJlZm9yZShAZWRpdG9yLCAnaW5zZXJ0VGV4dCcsIEBpbnNlcnRUZXh0KVxuXG4gICMgcGF0Y2hlZCBUZXh0RWRpdG9yOjppbnNlcnRUZXh0XG4gIGluc2VydFRleHQ6ICh0ZXh0LCBvcHRpb25zKSA9PlxuICAgIHJldHVybiB0cnVlIHVubGVzcyAoIHRleHQgaXMgXCJcXG5cIiApXG4gICAgcmV0dXJuIHRydWUgaWYgQGVkaXRvci5oYXNNdWx0aXBsZUN1cnNvcnMoKSAjIGZvciB0aW1lIGJlaW5nXG5cbiAgICBpZiAhQGluc2VydE5ld2xpbmVCZXR3ZWVuSlNYVGFncygpIHRoZW4gcmV0dXJuIGZhbHNlXG4gICAgaWYgIUBpbnNlcnROZXdsaW5lQWZ0ZXJTdHlsZWRDb21wb25lbnRzQmFja1RpY2soKSB0aGVuIHJldHVybiBmYWxzZVxuICAgIHRydWVcblxuICAjIGlmIGEgbmV3TGluZSBpcyBlbnRlcmVkIGJldHdlZW4gYSBKU1ggdGFnIG9wZW4gYW5kIGNsb3NlIG1hcmtlZF8gPGRpdj5fPC9kaXY+XG4gICMgdGhlbiBhZGQgYW5vdGhlciBuZXdMaW5lIGFuZCByZXBvc2l0aW9uIGN1cnNvclxuICBpbnNlcnROZXdsaW5lQmV0d2VlbkpTWFRhZ3M6ICgpIC0+XG4gICAgY3Vyc29yQnVmZmVyUG9zaXRpb24gPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgY3Vyc29yQnVmZmVyUG9zaXRpb24uY29sdW1uID4gMFxuICAgIHJldHVybiB0cnVlIHVubGVzcyAnSlNYRW5kVGFnU3RhcnQnIGlzIEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oY3Vyc29yQnVmZmVyUG9zaXRpb24pLmdldFNjb3Blc0FycmF5KCkucG9wKClcbiAgICBjdXJzb3JCdWZmZXJQb3NpdGlvbi5jb2x1bW4tLVxuICAgIHJldHVybiB0cnVlIHVubGVzcyAnSlNYU3RhcnRUYWdFbmQnIGlzIEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oY3Vyc29yQnVmZmVyUG9zaXRpb24pLmdldFNjb3Blc0FycmF5KCkucG9wKClcbiAgICBpbmRlbnRMZW5ndGggPSBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGN1cnNvckJ1ZmZlclBvc2l0aW9uLnJvdylcbiAgICBAZWRpdG9yLmluc2VydFRleHQoXCJcXG5cXG5cIilcbiAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93IGN1cnNvckJ1ZmZlclBvc2l0aW9uLnJvdysxLCBpbmRlbnRMZW5ndGgrMSwgeyBwcmVzZXJ2ZUxlYWRpbmdXaGl0ZXNwYWNlOiBmYWxzZSB9XG4gICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyBjdXJzb3JCdWZmZXJQb3NpdGlvbi5yb3crMiwgaW5kZW50TGVuZ3RoLCB7IHByZXNlcnZlTGVhZGluZ1doaXRlc3BhY2U6IGZhbHNlIH1cbiAgICBAZWRpdG9yLm1vdmVVcCgpXG4gICAgQGVkaXRvci5tb3ZlVG9FbmRPZkxpbmUoKVxuICAgIGZhbHNlXG5cbiAgIyBpZiBhIG5ld2xpbmUgaXMgZW50ZXJlZCBhZnRlciB0aGUgb3BlbmluZyBzdHlsZWQgY29tcG9uZW50IGJhY2t0aWNrXG4gICMgaW5kZW50IGN1cnNvciBhbmQgYWRkIGEgY2xvc2luZyBiYWNrdGlja1xuICBpbnNlcnROZXdsaW5lQWZ0ZXJTdHlsZWRDb21wb25lbnRzQmFja1RpY2s6ICgpIC0+XG4gICAgY3Vyc29yQnVmZmVyUG9zaXRpb24gPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcbiAgICByZXR1cm4gdHJ1ZSB1bmxlc3MgY3Vyc29yQnVmZmVyUG9zaXRpb24uY29sdW1uID4gMFxuICAgIHJldHVybiB0cnVlIHVubGVzcyAnc3RyaW5nLnF1b3RlZC50ZW1wbGF0ZS5zdHlsZWQuc3RhcnQuanMnIGlzIEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oY3Vyc29yQnVmZmVyUG9zaXRpb24pLmdldFNjb3Blc0FycmF5KCkucG9wKClcbiAgICBjdXJzb3JCdWZmZXJQb3NpdGlvbi5jb2x1bW4tLVxuICAgIHJldHVybiB0cnVlIHVubGVzcyAnc3RyaW5nLnF1b3RlZC50ZW1wbGF0ZS5zdHlsZWQuc3RhcnQuanMnIGlzIEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oY3Vyc29yQnVmZmVyUG9zaXRpb24pLmdldFNjb3Blc0FycmF5KCkucG9wKClcbiAgICBpbmRlbnRMZW5ndGggPSBAZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGN1cnNvckJ1ZmZlclBvc2l0aW9uLnJvdylcbiAgICBAZWRpdG9yLmluc2VydFRleHQoXCJcXG5cXG5gXCIpXG4gICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyBjdXJzb3JCdWZmZXJQb3NpdGlvbi5yb3crMSwgaW5kZW50TGVuZ3RoKzEsIHsgcHJlc2VydmVMZWFkaW5nV2hpdGVzcGFjZTogZmFsc2UgfVxuICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cgY3Vyc29yQnVmZmVyUG9zaXRpb24ucm93KzIsIGluZGVudExlbmd0aCwgeyBwcmVzZXJ2ZUxlYWRpbmdXaGl0ZXNwYWNlOiBmYWxzZSB9XG4gICAgQGVkaXRvci5tb3ZlVXAoKVxuICAgIEBlZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiAgICBmYWxzZVxuXG5cbiAgIyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3VuZGVyc2NvcmUtcGx1cy9ibG9iL21hc3Rlci9zcmMvdW5kZXJzY29yZS1wbHVzLmNvZmZlZVxuICBhZHZpc2VCZWZvcmU6IChvYmplY3QsIG1ldGhvZE5hbWUsIGFkdmljZSkgLT5cbiAgICBvcmlnaW5hbCA9IG9iamVjdFttZXRob2ROYW1lXVxuICAgIG9iamVjdFttZXRob2ROYW1lXSA9IChhcmdzLi4uKSAtPlxuICAgICAgdW5sZXNzIGFkdmljZS5hcHBseSh0aGlzLCBhcmdzKSA9PSBmYWxzZVxuICAgICAgICBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKVxuIl19
