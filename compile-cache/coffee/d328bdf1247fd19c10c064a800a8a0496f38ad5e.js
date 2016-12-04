(function() {
  var attributePattern, firstCharsEqual, fs, path, tagPattern, trailingWhitespace;

  fs = require('fs');

  path = require('path');

  trailingWhitespace = /\s$/;

  attributePattern = /\s+([a-zA-Z][-a-zA-Z]*)\s*=\s*$/;

  tagPattern = /<([a-zA-Z][-a-zA-Z]*)(?:\s|$)/;

  module.exports = {
    selector: '.text.html',
    disableForSelector: '.text.html .comment',
    filterSuggestions: true,
    getSuggestions: function(request) {
      var prefix;
      prefix = request.prefix;
      if (this.isAttributeValueStartWithNoPrefix(request)) {
        return this.getAttributeValueCompletions(request);
      } else if (this.isAttributeValueStartWithPrefix(request)) {
        return this.getAttributeValueCompletions(request, prefix);
      } else if (this.isAttributeStartWithNoPrefix(request)) {
        return this.getAttributeNameCompletions(request);
      } else if (this.isAttributeStartWithPrefix(request)) {
        return this.getAttributeNameCompletions(request, prefix);
      } else if (this.isTagStartWithNoPrefix(request)) {
        return this.getTagNameCompletions();
      } else if (this.isTagStartTagWithPrefix(request)) {
        return this.getTagNameCompletions(prefix);
      } else {
        return [];
      }
    },
    onDidInsertSuggestion: function(arg) {
      var editor, suggestion;
      editor = arg.editor, suggestion = arg.suggestion;
      if (suggestion.type === 'attribute') {
        return setTimeout(this.triggerAutocomplete.bind(this, editor), 1);
      }
    },
    triggerAutocomplete: function(editor) {
      return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate', {
        activatedManually: false
      });
    },
    isTagStartWithNoPrefix: function(arg) {
      var prefix, scopeDescriptor, scopes;
      prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
      scopes = scopeDescriptor.getScopesArray();
      if (prefix === '<' && scopes.length === 1) {
        return scopes[0] === 'text.html.basic';
      } else if (prefix === '<' && scopes.length === 2) {
        return scopes[0] === 'text.html.basic' && scopes[1] === 'meta.scope.outside-tag.html';
      } else {
        return false;
      }
    },
    isTagStartTagWithPrefix: function(arg) {
      var prefix, scopeDescriptor;
      prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
      if (!prefix) {
        return false;
      }
      if (trailingWhitespace.test(prefix)) {
        return false;
      }
      return this.hasTagScope(scopeDescriptor.getScopesArray());
    },
    isAttributeStartWithNoPrefix: function(arg) {
      var prefix, scopeDescriptor;
      prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
      if (!trailingWhitespace.test(prefix)) {
        return false;
      }
      return this.hasTagScope(scopeDescriptor.getScopesArray());
    },
    isAttributeStartWithPrefix: function(arg) {
      var prefix, scopeDescriptor, scopes;
      prefix = arg.prefix, scopeDescriptor = arg.scopeDescriptor;
      if (!prefix) {
        return false;
      }
      if (trailingWhitespace.test(prefix)) {
        return false;
      }
      scopes = scopeDescriptor.getScopesArray();
      if (scopes.indexOf('entity.other.attribute-name.html') !== -1) {
        return true;
      }
      if (!this.hasTagScope(scopes)) {
        return false;
      }
      return scopes.indexOf('punctuation.definition.tag.html') !== -1 || scopes.indexOf('punctuation.definition.tag.end.html') !== -1;
    },
    isAttributeValueStartWithNoPrefix: function(arg) {
      var lastPrefixCharacter, prefix, scopeDescriptor, scopes;
      scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      lastPrefixCharacter = prefix[prefix.length - 1];
      if (lastPrefixCharacter !== '"' && lastPrefixCharacter !== "'") {
        return false;
      }
      scopes = scopeDescriptor.getScopesArray();
      return this.hasStringScope(scopes) && this.hasTagScope(scopes);
    },
    isAttributeValueStartWithPrefix: function(arg) {
      var lastPrefixCharacter, prefix, scopeDescriptor, scopes;
      scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      lastPrefixCharacter = prefix[prefix.length - 1];
      if (lastPrefixCharacter === '"' || lastPrefixCharacter === "'") {
        return false;
      }
      scopes = scopeDescriptor.getScopesArray();
      return this.hasStringScope(scopes) && this.hasTagScope(scopes);
    },
    hasTagScope: function(scopes) {
      return scopes.indexOf('meta.tag.any.html') !== -1 || scopes.indexOf('meta.tag.other.html') !== -1 || scopes.indexOf('meta.tag.block.any.html') !== -1 || scopes.indexOf('meta.tag.inline.any.html') !== -1 || scopes.indexOf('meta.tag.structure.any.html') !== -1;
    },
    hasStringScope: function(scopes) {
      return scopes.indexOf('string.quoted.double.html') !== -1 || scopes.indexOf('string.quoted.single.html') !== -1;
    },
    getTagNameCompletions: function(prefix) {
      var attributes, completions, ref, tag;
      completions = [];
      ref = this.completions.tags;
      for (tag in ref) {
        attributes = ref[tag];
        if (!prefix || firstCharsEqual(tag, prefix)) {
          completions.push(this.buildTagCompletion(tag));
        }
      }
      return completions;
    },
    buildTagCompletion: function(tag) {
      return {
        text: tag,
        type: 'tag',
        description: "HTML <" + tag + "> tag",
        descriptionMoreURL: this.getTagDocsURL(tag)
      };
    },
    getAttributeNameCompletions: function(arg, prefix) {
      var attribute, bufferPosition, completions, editor, i, len, options, ref, tag, tagAttributes;
      editor = arg.editor, bufferPosition = arg.bufferPosition;
      completions = [];
      tag = this.getPreviousTag(editor, bufferPosition);
      tagAttributes = this.getTagAttributes(tag);
      for (i = 0, len = tagAttributes.length; i < len; i++) {
        attribute = tagAttributes[i];
        if (!prefix || firstCharsEqual(attribute, prefix)) {
          completions.push(this.buildAttributeCompletion(attribute, tag));
        }
      }
      ref = this.completions.attributes;
      for (attribute in ref) {
        options = ref[attribute];
        if (!prefix || firstCharsEqual(attribute, prefix)) {
          if (options.global) {
            completions.push(this.buildAttributeCompletion(attribute));
          }
        }
      }
      return completions;
    },
    buildAttributeCompletion: function(attribute, tag) {
      if (tag != null) {
        return {
          snippet: attribute + "=\"$1\"$0",
          displayText: attribute,
          type: 'attribute',
          rightLabel: "<" + tag + ">",
          description: attribute + " attribute local to <" + tag + "> tags",
          descriptionMoreURL: this.getLocalAttributeDocsURL(attribute, tag)
        };
      } else {
        return {
          snippet: attribute + "=\"$1\"$0",
          displayText: attribute,
          type: 'attribute',
          description: "Global " + attribute + " attribute",
          descriptionMoreURL: this.getGlobalAttributeDocsURL(attribute)
        };
      }
    },
    getAttributeValueCompletions: function(arg, prefix) {
      var attribute, bufferPosition, editor, i, len, results, tag, value, values;
      editor = arg.editor, bufferPosition = arg.bufferPosition;
      tag = this.getPreviousTag(editor, bufferPosition);
      attribute = this.getPreviousAttribute(editor, bufferPosition);
      values = this.getAttributeValues(attribute);
      results = [];
      for (i = 0, len = values.length; i < len; i++) {
        value = values[i];
        if (!prefix || firstCharsEqual(value, prefix)) {
          results.push(this.buildAttributeValueCompletion(tag, attribute, value));
        }
      }
      return results;
    },
    buildAttributeValueCompletion: function(tag, attribute, value) {
      if (this.completions.attributes[attribute].global) {
        return {
          text: value,
          type: 'value',
          description: value + " value for global " + attribute + " attribute",
          descriptionMoreURL: this.getGlobalAttributeDocsURL(attribute)
        };
      } else {
        return {
          text: value,
          type: 'value',
          description: value + " value for " + attribute + " attribute local to <" + tag + ">",
          descriptionMoreURL: this.getLocalAttributeDocsURL(attribute, tag)
        };
      }
    },
    loadCompletions: function() {
      this.completions = {};
      return fs.readFile(path.resolve(__dirname, '..', 'completions.json'), (function(_this) {
        return function(error, content) {
          if (error == null) {
            _this.completions = JSON.parse(content);
          }
        };
      })(this));
    },
    getPreviousTag: function(editor, bufferPosition) {
      var ref, row, tag;
      row = bufferPosition.row;
      while (row >= 0) {
        tag = (ref = tagPattern.exec(editor.lineTextForBufferRow(row))) != null ? ref[1] : void 0;
        if (tag) {
          return tag;
        }
        row--;
      }
    },
    getPreviousAttribute: function(editor, bufferPosition) {
      var line, quoteIndex, ref, ref1;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]).trim();
      quoteIndex = line.length - 1;
      while (line[quoteIndex] && !((ref = line[quoteIndex]) === '"' || ref === "'")) {
        quoteIndex--;
      }
      line = line.substring(0, quoteIndex);
      return (ref1 = attributePattern.exec(line)) != null ? ref1[1] : void 0;
    },
    getAttributeValues: function(attribute) {
      var ref;
      attribute = this.completions.attributes[attribute];
      return (ref = attribute != null ? attribute.attribOption : void 0) != null ? ref : [];
    },
    getTagAttributes: function(tag) {
      var ref, ref1;
      return (ref = (ref1 = this.completions.tags[tag]) != null ? ref1.attributes : void 0) != null ? ref : [];
    },
    getTagDocsURL: function(tag) {
      return "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/" + tag;
    },
    getLocalAttributeDocsURL: function(attribute, tag) {
      return (this.getTagDocsURL(tag)) + "#attr-" + attribute;
    },
    getGlobalAttributeDocsURL: function(attribute) {
      return "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/" + attribute;
    }
  };

  firstCharsEqual = function(str1, str2) {
    return str1[0].toLowerCase() === str2[0].toLowerCase();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1pb25pYzItZnJhbWV3b3JrL2xpYi9wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsa0JBQUEsR0FBcUI7O0VBQ3JCLGdCQUFBLEdBQW1COztFQUNuQixVQUFBLEdBQWE7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxZQUFWO0lBQ0Esa0JBQUEsRUFBb0IscUJBRHBCO0lBRUEsaUJBQUEsRUFBbUIsSUFGbkI7SUFJQSxjQUFBLEVBQWdCLFNBQUMsT0FBRDtBQUNkLFVBQUE7TUFBQyxTQUFVO01BQ1gsSUFBRyxJQUFDLENBQUEsaUNBQUQsQ0FBbUMsT0FBbkMsQ0FBSDtlQUNFLElBQUMsQ0FBQSw0QkFBRCxDQUE4QixPQUE5QixFQURGO09BQUEsTUFFSyxJQUFHLElBQUMsQ0FBQSwrQkFBRCxDQUFpQyxPQUFqQyxDQUFIO2VBQ0gsSUFBQyxDQUFBLDRCQUFELENBQThCLE9BQTlCLEVBQXVDLE1BQXZDLEVBREc7T0FBQSxNQUVBLElBQUcsSUFBQyxDQUFBLDRCQUFELENBQThCLE9BQTlCLENBQUg7ZUFDSCxJQUFDLENBQUEsMkJBQUQsQ0FBNkIsT0FBN0IsRUFERztPQUFBLE1BRUEsSUFBRyxJQUFDLENBQUEsMEJBQUQsQ0FBNEIsT0FBNUIsQ0FBSDtlQUNILElBQUMsQ0FBQSwyQkFBRCxDQUE2QixPQUE3QixFQUFzQyxNQUF0QyxFQURHO09BQUEsTUFFQSxJQUFHLElBQUMsQ0FBQSxzQkFBRCxDQUF3QixPQUF4QixDQUFIO2VBQ0gsSUFBQyxDQUFBLHFCQUFELENBQUEsRUFERztPQUFBLE1BRUEsSUFBRyxJQUFDLENBQUEsdUJBQUQs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QUExTGxCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG50cmFpbGluZ1doaXRlc3BhY2UgPSAvXFxzJC9cbmF0dHJpYnV0ZVBhdHRlcm4gPSAvXFxzKyhbYS16QS1aXVstYS16QS1aXSopXFxzKj1cXHMqJC9cbnRhZ1BhdHRlcm4gPSAvPChbYS16QS1aXVstYS16QS1aXSopKD86XFxzfCQpL1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHNlbGVjdG9yOiAnLnRleHQuaHRtbCdcbiAgZGlzYWJsZUZvclNlbGVjdG9yOiAnLnRleHQuaHRtbCAuY29tbWVudCdcbiAgZmlsdGVyU3VnZ2VzdGlvbnM6IHRydWVcblxuICBnZXRTdWdnZXN0aW9uczogKHJlcXVlc3QpIC0+XG4gICAge3ByZWZpeH0gPSByZXF1ZXN0XG4gICAgaWYgQGlzQXR0cmlidXRlVmFsdWVTdGFydFdpdGhOb1ByZWZpeChyZXF1ZXN0KVxuICAgICAgQGdldEF0dHJpYnV0ZVZhbHVlQ29tcGxldGlvbnMocmVxdWVzdClcbiAgICBlbHNlIGlmIEBpc0F0dHJpYnV0ZVZhbHVlU3RhcnRXaXRoUHJlZml4KHJlcXVlc3QpXG4gICAgICBAZ2V0QXR0cmlidXRlVmFsdWVDb21wbGV0aW9ucyhyZXF1ZXN0LCBwcmVmaXgpXG4gICAgZWxzZSBpZiBAaXNBdHRyaWJ1dGVTdGFydFdpdGhOb1ByZWZpeChyZXF1ZXN0KVxuICAgICAgQGdldEF0dHJpYnV0ZU5hbWVDb21wbGV0aW9ucyhyZXF1ZXN0KVxuICAgIGVsc2UgaWYgQGlzQXR0cmlidXRlU3RhcnRXaXRoUHJlZml4KHJlcXVlc3QpXG4gICAgICBAZ2V0QXR0cmlidXRlTmFtZUNvbXBsZXRpb25zKHJlcXVlc3QsIHByZWZpeClcbiAgICBlbHNlIGlmIEBpc1RhZ1N0YXJ0V2l0aE5vUHJlZml4KHJlcXVlc3QpXG4gICAgICBAZ2V0VGFnTmFtZUNvbXBsZXRpb25zKClcbiAgICBlbHNlIGlmIEBpc1RhZ1N0YXJ0VGFnV2l0aFByZWZpeChyZXF1ZXN0KVxuICAgICAgQGdldFRhZ05hbWVDb21wbGV0aW9ucyhwcmVmaXgpXG4gICAgZWxzZVxuICAgICAgW11cblxuICBvbkRpZEluc2VydFN1Z2dlc3Rpb246ICh7ZWRpdG9yLCBzdWdnZXN0aW9ufSkgLT5cbiAgICBzZXRUaW1lb3V0KEB0cmlnZ2VyQXV0b2NvbXBsZXRlLmJpbmQodGhpcywgZWRpdG9yKSwgMSkgaWYgc3VnZ2VzdGlvbi50eXBlIGlzICdhdHRyaWJ1dGUnXG5cbiAgdHJpZ2dlckF1dG9jb21wbGV0ZTogKGVkaXRvcikgLT5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLCAnYXV0b2NvbXBsZXRlLXBsdXM6YWN0aXZhdGUnLCBhY3RpdmF0ZWRNYW51YWxseTogZmFsc2UpXG5cbiAgaXNUYWdTdGFydFdpdGhOb1ByZWZpeDogKHtwcmVmaXgsIHNjb3BlRGVzY3JpcHRvcn0pIC0+XG4gICAgc2NvcGVzID0gc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KClcbiAgICBpZiBwcmVmaXggaXMgJzwnIGFuZCBzY29wZXMubGVuZ3RoIGlzIDFcbiAgICAgIHNjb3Blc1swXSBpcyAndGV4dC5odG1sLmJhc2ljJ1xuICAgIGVsc2UgaWYgcHJlZml4IGlzICc8JyBhbmQgc2NvcGVzLmxlbmd0aCBpcyAyXG4gICAgICBzY29wZXNbMF0gaXMgJ3RleHQuaHRtbC5iYXNpYycgYW5kIHNjb3Blc1sxXSBpcyAnbWV0YS5zY29wZS5vdXRzaWRlLXRhZy5odG1sJ1xuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiAgaXNUYWdTdGFydFRhZ1dpdGhQcmVmaXg6ICh7cHJlZml4LCBzY29wZURlc2NyaXB0b3J9KSAtPlxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgcHJlZml4XG4gICAgcmV0dXJuIGZhbHNlIGlmIHRyYWlsaW5nV2hpdGVzcGFjZS50ZXN0KHByZWZpeClcbiAgICBAaGFzVGFnU2NvcGUoc2NvcGVEZXNjcmlwdG9yLmdldFNjb3Blc0FycmF5KCkpXG5cbiAgaXNBdHRyaWJ1dGVTdGFydFdpdGhOb1ByZWZpeDogKHtwcmVmaXgsIHNjb3BlRGVzY3JpcHRvcn0pIC0+XG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyB0cmFpbGluZ1doaXRlc3BhY2UudGVzdChwcmVmaXgpXG4gICAgQGhhc1RhZ1Njb3BlKHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpKVxuXG4gIGlzQXR0cmlidXRlU3RhcnRXaXRoUHJlZml4OiAoe3ByZWZpeCwgc2NvcGVEZXNjcmlwdG9yfSkgLT5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIHByZWZpeFxuICAgIHJldHVybiBmYWxzZSBpZiB0cmFpbGluZ1doaXRlc3BhY2UudGVzdChwcmVmaXgpXG5cbiAgICBzY29wZXMgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIHJldHVybiB0cnVlIGlmIHNjb3Blcy5pbmRleE9mKCdlbnRpdHkub3RoZXIuYXR0cmlidXRlLW5hbWUuaHRtbCcpIGlzbnQgLTFcbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIEBoYXNUYWdTY29wZShzY29wZXMpXG5cbiAgICBzY29wZXMuaW5kZXhPZigncHVuY3R1YXRpb24uZGVmaW5pdGlvbi50YWcuaHRtbCcpIGlzbnQgLTEgb3JcbiAgICAgIHNjb3Blcy5pbmRleE9mKCdwdW5jdHVhdGlvbi5kZWZpbml0aW9uLnRhZy5lbmQuaHRtbCcpIGlzbnQgLTFcblxuICBpc0F0dHJpYnV0ZVZhbHVlU3RhcnRXaXRoTm9QcmVmaXg6ICh7c2NvcGVEZXNjcmlwdG9yLCBwcmVmaXh9KSAtPlxuICAgIGxhc3RQcmVmaXhDaGFyYWN0ZXIgPSBwcmVmaXhbcHJlZml4Lmxlbmd0aCAtIDFdXG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBsYXN0UHJlZml4Q2hhcmFjdGVyIGluIFsnXCInLCBcIidcIl1cbiAgICBzY29wZXMgPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIEBoYXNTdHJpbmdTY29wZShzY29wZXMpIGFuZCBAaGFzVGFnU2NvcGUoc2NvcGVzKVxuXG4gIGlzQXR0cmlidXRlVmFsdWVTdGFydFdpdGhQcmVmaXg6ICh7c2NvcGVEZXNjcmlwdG9yLCBwcmVmaXh9KSAtPlxuICAgIGxhc3RQcmVmaXhDaGFyYWN0ZXIgPSBwcmVmaXhbcHJlZml4Lmxlbmd0aCAtIDFdXG4gICAgcmV0dXJuIGZhbHNlIGlmIGxhc3RQcmVmaXhDaGFyYWN0ZXIgaW4gWydcIicsIFwiJ1wiXVxuICAgIHNjb3BlcyA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpXG4gICAgQGhhc1N0cmluZ1Njb3BlKHNjb3BlcykgYW5kIEBoYXNUYWdTY29wZShzY29wZXMpXG5cbiAgaGFzVGFnU2NvcGU6IChzY29wZXMpIC0+XG4gICAgc2NvcGVzLmluZGV4T2YoJ21ldGEudGFnLmFueS5odG1sJykgaXNudCAtMSBvclxuICAgICAgc2NvcGVzLmluZGV4T2YoJ21ldGEudGFnLm90aGVyLmh0bWwnKSBpc250IC0xIG9yXG4gICAgICBzY29wZXMuaW5kZXhPZignbWV0YS50YWcuYmxvY2suYW55Lmh0bWwnKSBpc250IC0xIG9yXG4gICAgICBzY29wZXMuaW5kZXhPZignbWV0YS50YWcuaW5saW5lLmFueS5odG1sJykgaXNudCAtMSBvclxuICAgICAgc2NvcGVzLmluZGV4T2YoJ21ldGEudGFnLnN0cnVjdHVyZS5hbnkuaHRtbCcpIGlzbnQgLTFcblxuICBoYXNTdHJpbmdTY29wZTogKHNjb3BlcykgLT5cbiAgICBzY29wZXMuaW5kZXhPZignc3RyaW5nLnF1b3RlZC5kb3VibGUuaHRtbCcpIGlzbnQgLTEgb3JcbiAgICAgIHNjb3Blcy5pbmRleE9mKCdzdHJpbmcucXVvdGVkLnNpbmdsZS5odG1sJykgaXNudCAtMVxuXG4gIGdldFRhZ05hbWVDb21wbGV0aW9uczogKHByZWZpeCkgLT5cbiAgICBjb21wbGV0aW9ucyA9IFtdXG4gICAgZm9yIHRhZywgYXR0cmlidXRlcyBvZiBAY29tcGxldGlvbnMudGFncyB3aGVuIG5vdCBwcmVmaXggb3IgZmlyc3RDaGFyc0VxdWFsKHRhZywgcHJlZml4KVxuICAgICAgY29tcGxldGlvbnMucHVzaChAYnVpbGRUYWdDb21wbGV0aW9uKHRhZykpXG4gICAgY29tcGxldGlvbnNcblxuICBidWlsZFRhZ0NvbXBsZXRpb246ICh0YWcpIC0+XG4gICAgdGV4dDogdGFnXG4gICAgdHlwZTogJ3RhZydcbiAgICBkZXNjcmlwdGlvbjogXCJIVE1MIDwje3RhZ30+IHRhZ1wiXG4gICAgZGVzY3JpcHRpb25Nb3JlVVJMOiBAZ2V0VGFnRG9jc1VSTCh0YWcpXG5cbiAgZ2V0QXR0cmlidXRlTmFtZUNvbXBsZXRpb25zOiAoe2VkaXRvciwgYnVmZmVyUG9zaXRpb259LCBwcmVmaXgpIC0+XG4gICAgY29tcGxldGlvbnMgPSBbXVxuICAgIHRhZyA9IEBnZXRQcmV2aW91c1RhZyhlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgIHRhZ0F0dHJpYnV0ZXMgPSBAZ2V0VGFnQXR0cmlidXRlcyh0YWcpXG5cbiAgICBmb3IgYXR0cmlidXRlIGluIHRhZ0F0dHJpYnV0ZXMgd2hlbiBub3QgcHJlZml4IG9yIGZpcnN0Q2hhcnNFcXVhbChhdHRyaWJ1dGUsIHByZWZpeClcbiAgICAgIGNvbXBsZXRpb25zLnB1c2goQGJ1aWxkQXR0cmlidXRlQ29tcGxldGlvbihhdHRyaWJ1dGUsIHRhZykpXG5cbiAgICBmb3IgYXR0cmlidXRlLCBvcHRpb25zIG9mIEBjb21wbGV0aW9ucy5hdHRyaWJ1dGVzIHdoZW4gbm90IHByZWZpeCBvciBmaXJzdENoYXJzRXF1YWwoYXR0cmlidXRlLCBwcmVmaXgpXG4gICAgICBjb21wbGV0aW9ucy5wdXNoKEBidWlsZEF0dHJpYnV0ZUNvbXBsZXRpb24oYXR0cmlidXRlKSkgaWYgb3B0aW9ucy5nbG9iYWxcblxuICAgIGNvbXBsZXRpb25zXG5cbiAgYnVpbGRBdHRyaWJ1dGVDb21wbGV0aW9uOiAoYXR0cmlidXRlLCB0YWcpIC0+XG4gICAgaWYgdGFnP1xuICAgICAgc25pcHBldDogXCIje2F0dHJpYnV0ZX09XFxcIiQxXFxcIiQwXCJcbiAgICAgIGRpc3BsYXlUZXh0OiBhdHRyaWJ1dGVcbiAgICAgIHR5cGU6ICdhdHRyaWJ1dGUnXG4gICAgICByaWdodExhYmVsOiBcIjwje3RhZ30+XCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIiN7YXR0cmlidXRlfSBhdHRyaWJ1dGUgbG9jYWwgdG8gPCN7dGFnfT4gdGFnc1wiXG4gICAgICBkZXNjcmlwdGlvbk1vcmVVUkw6IEBnZXRMb2NhbEF0dHJpYnV0ZURvY3NVUkwoYXR0cmlidXRlLCB0YWcpXG4gICAgZWxzZVxuICAgICAgc25pcHBldDogXCIje2F0dHJpYnV0ZX09XFxcIiQxXFxcIiQwXCJcbiAgICAgIGRpc3BsYXlUZXh0OiBhdHRyaWJ1dGVcbiAgICAgIHR5cGU6ICdhdHRyaWJ1dGUnXG4gICAgICBkZXNjcmlwdGlvbjogXCJHbG9iYWwgI3thdHRyaWJ1dGV9IGF0dHJpYnV0ZVwiXG4gICAgICBkZXNjcmlwdGlvbk1vcmVVUkw6IEBnZXRHbG9iYWxBdHRyaWJ1dGVEb2NzVVJMKGF0dHJpYnV0ZSlcblxuICBnZXRBdHRyaWJ1dGVWYWx1ZUNvbXBsZXRpb25zOiAoe2VkaXRvciwgYnVmZmVyUG9zaXRpb259LCBwcmVmaXgpIC0+XG4gICAgdGFnID0gQGdldFByZXZpb3VzVGFnKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgYXR0cmlidXRlID0gQGdldFByZXZpb3VzQXR0cmlidXRlKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgdmFsdWVzID0gQGdldEF0dHJpYnV0ZVZhbHVlcyhhdHRyaWJ1dGUpXG4gICAgZm9yIHZhbHVlIGluIHZhbHVlcyB3aGVuIG5vdCBwcmVmaXggb3IgZmlyc3RDaGFyc0VxdWFsKHZhbHVlLCBwcmVmaXgpXG4gICAgICBAYnVpbGRBdHRyaWJ1dGVWYWx1ZUNvbXBsZXRpb24odGFnLCBhdHRyaWJ1dGUsIHZhbHVlKVxuXG4gIGJ1aWxkQXR0cmlidXRlVmFsdWVDb21wbGV0aW9uOiAodGFnLCBhdHRyaWJ1dGUsIHZhbHVlKSAtPlxuICAgIGlmIEBjb21wbGV0aW9ucy5hdHRyaWJ1dGVzW2F0dHJpYnV0ZV0uZ2xvYmFsXG4gICAgICB0ZXh0OiB2YWx1ZVxuICAgICAgdHlwZTogJ3ZhbHVlJ1xuICAgICAgZGVzY3JpcHRpb246IFwiI3t2YWx1ZX0gdmFsdWUgZm9yIGdsb2JhbCAje2F0dHJpYnV0ZX0gYXR0cmlidXRlXCJcbiAgICAgIGRlc2NyaXB0aW9uTW9yZVVSTDogQGdldEdsb2JhbEF0dHJpYnV0ZURvY3NVUkwoYXR0cmlidXRlKVxuICAgIGVsc2VcbiAgICAgIHRleHQ6IHZhbHVlXG4gICAgICB0eXBlOiAndmFsdWUnXG4gICAgICBkZXNjcmlwdGlvbjogXCIje3ZhbHVlfSB2YWx1ZSBmb3IgI3thdHRyaWJ1dGV9IGF0dHJpYnV0ZSBsb2NhbCB0byA8I3t0YWd9PlwiXG4gICAgICBkZXNjcmlwdGlvbk1vcmVVUkw6IEBnZXRMb2NhbEF0dHJpYnV0ZURvY3NVUkwoYXR0cmlidXRlLCB0YWcpXG5cbiAgbG9hZENvbXBsZXRpb25zOiAtPlxuICAgIEBjb21wbGV0aW9ucyA9IHt9XG4gICAgZnMucmVhZEZpbGUgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJ2NvbXBsZXRpb25zLmpzb24nKSwgKGVycm9yLCBjb250ZW50KSA9PlxuICAgICAgQGNvbXBsZXRpb25zID0gSlNPTi5wYXJzZShjb250ZW50KSB1bmxlc3MgZXJyb3I/XG4gICAgICByZXR1cm5cblxuICBnZXRQcmV2aW91c1RhZzogKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pIC0+XG4gICAge3Jvd30gPSBidWZmZXJQb3NpdGlvblxuICAgIHdoaWxlIHJvdyA+PSAwXG4gICAgICB0YWcgPSB0YWdQYXR0ZXJuLmV4ZWMoZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpP1sxXVxuICAgICAgcmV0dXJuIHRhZyBpZiB0YWdcbiAgICAgIHJvdy0tXG4gICAgcmV0dXJuXG5cbiAgZ2V0UHJldmlvdXNBdHRyaWJ1dGU6IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pLnRyaW0oKVxuXG4gICAgIyBSZW1vdmUgZXZlcnl0aGluZyB1bnRpbCB0aGUgb3BlbmluZyBxdW90ZVxuICAgIHF1b3RlSW5kZXggPSBsaW5lLmxlbmd0aCAtIDFcbiAgICBxdW90ZUluZGV4LS0gd2hpbGUgbGluZVtxdW90ZUluZGV4XSBhbmQgbm90IChsaW5lW3F1b3RlSW5kZXhdIGluIFsnXCInLCBcIidcIl0pXG4gICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKDAsIHF1b3RlSW5kZXgpXG5cbiAgICBhdHRyaWJ1dGVQYXR0ZXJuLmV4ZWMobGluZSk/WzFdXG5cbiAgZ2V0QXR0cmlidXRlVmFsdWVzOiAoYXR0cmlidXRlKSAtPlxuICAgIGF0dHJpYnV0ZSA9IEBjb21wbGV0aW9ucy5hdHRyaWJ1dGVzW2F0dHJpYnV0ZV1cbiAgICBhdHRyaWJ1dGU/LmF0dHJpYk9wdGlvbiA/IFtdXG5cbiAgZ2V0VGFnQXR0cmlidXRlczogKHRhZykgLT5cbiAgICBAY29tcGxldGlvbnMudGFnc1t0YWddPy5hdHRyaWJ1dGVzID8gW11cblxuICBnZXRUYWdEb2NzVVJMOiAodGFnKSAtPlxuICAgIFwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRNTC9FbGVtZW50LyN7dGFnfVwiXG5cbiAgZ2V0TG9jYWxBdHRyaWJ1dGVEb2NzVVJMOiAoYXR0cmlidXRlLCB0YWcpIC0+XG4gICAgXCIje0BnZXRUYWdEb2NzVVJMKHRhZyl9I2F0dHItI3thdHRyaWJ1dGV9XCJcblxuICBnZXRHbG9iYWxBdHRyaWJ1dGVEb2NzVVJMOiAoYXR0cmlidXRlKSAtPlxuICAgIFwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRNTC9HbG9iYWxfYXR0cmlidXRlcy8je2F0dHJpYnV0ZX1cIlxuXG5maXJzdENoYXJzRXF1YWwgPSAoc3RyMSwgc3RyMikgLT5cbiAgc3RyMVswXS50b0xvd2VyQ2FzZSgpIGlzIHN0cjJbMF0udG9Mb3dlckNhc2UoKVxuIl19
