(function() {
  var Color, Palette, THEME_VARIABLES, change, click, _ref;

  Color = require('../lib/color');

  Palette = require('../lib/palette');

  THEME_VARIABLES = require('../lib/uris').THEME_VARIABLES;

  _ref = require('./helpers/events'), change = _ref.change, click = _ref.click;

  describe('PaletteElement', function() {
    var createVar, nextID, palette, paletteElement, pigments, project, workspaceElement, _ref1;
    _ref1 = [0], nextID = _ref1[0], palette = _ref1[1], paletteElement = _ref1[2], workspaceElement = _ref1[3], pigments = _ref1[4], project = _ref1[5];
    createVar = function(name, color, path, line) {
      return {
        name: name,
        color: color,
        path: path,
        line: line,
        id: nextID++
      };
    };
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      atom.config.set('pigments.sourceNames', ['*.styl', '*.less']);
      waitsForPromise(function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          pigments = pkg.mainModule;
          return project = pigments.getProject();
        });
      });
      return waitsForPromise(function() {
        return project.initialize();
      });
    });
    afterEach(function() {
      return project.destroy();
    });
    describe('as a view provider', function() {
      beforeEach(function() {
        palette = new Palette([createVar('red', new Color('#ff0000'), 'file.styl', 0), createVar('green', new Color('#00ff00'), 'file.styl', 1), createVar('blue', new Color('#0000ff'), 'file.styl', 2), createVar('redCopy', new Color('#ff0000'), 'file.styl', 3), createVar('red', new Color('#ff0000'), THEME_VARIABLES, 0)]);
        paletteElement = atom.views.getView(palette);
        return jasmine.attachToDOM(paletteElement);
      });
      it('is associated with the Palette model', function() {
        return expect(paletteElement).toBeDefined();
      });
      return it('does not render the file link when the variable comes from a theme', function() {
        return expect(paletteElement.querySelectorAll('li')[4].querySelector(' [data-variable-id]')).not.toExist();
      });
    });
    describe('when pigments:show-palette commands is triggered', function() {
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'pigments:show-palette');
        waitsFor(function() {
          return paletteElement = workspaceElement.querySelector('pigments-palette');
        });
        return runs(function() {
          palette = paletteElement.getModel();
          return jasmine.attachToDOM(paletteElement);
        });
      });
      it('opens a palette element', function() {
        return expect(paletteElement).toBeDefined();
      });
      it('creates as many list item as there is colors in the project', function() {
        expect(paletteElement.querySelectorAll('li').length).not.toEqual(0);
        return expect(paletteElement.querySelectorAll('li').length).toEqual(palette.variables.length);
      });
      it('binds colors with project variables', function() {
        var li, projectVariables;
        projectVariables = project.getColorVariables();
        li = paletteElement.querySelector('li');
        return expect(li.querySelector('.path').textContent).toEqual(atom.project.relativize(projectVariables[0].path));
      });
      describe('clicking on a result path', function() {
        return it('shows the variable in its file', function() {
          var pathElement;
          spyOn(project, 'showVariableInFile');
          pathElement = paletteElement.querySelector('[data-variable-id]');
          click(pathElement);
          return waitsFor(function() {
            return project.showVariableInFile.callCount > 0;
          });
        });
      });
      describe('when the sortPaletteColors settings is set to color', function() {
        beforeEach(function() {
          return atom.config.set('pigments.sortPaletteColors', 'by color');
        });
        return it('reorders the colors', function() {
          var i, lis, name, sortedColors, _i, _len, _results;
          sortedColors = project.getPalette().sortedByColor();
          lis = paletteElement.querySelectorAll('li');
          _results = [];
          for (i = _i = 0, _len = sortedColors.length; _i < _len; i = ++_i) {
            name = sortedColors[i].name;
            _results.push(expect(lis[i].querySelector('.name').textContent).toEqual(name));
          }
          return _results;
        });
      });
      describe('when the sortPaletteColors settings is set to name', function() {
        beforeEach(function() {
          return atom.config.set('pigments.sortPaletteColors', 'by name');
        });
        return it('reorders the colors', function() {
          var i, lis, name, sortedColors, _i, _len, _results;
          sortedColors = project.getPalette().sortedByName();
          lis = paletteElement.querySelectorAll('li');
          _results = [];
          for (i = _i = 0, _len = sortedColors.length; _i < _len; i = ++_i) {
            name = sortedColors[i].name;
            _results.push(expect(lis[i].querySelector('.name').textContent).toEqual(name));
          }
          return _results;
        });
      });
      describe('when the groupPaletteColors setting is set to file', function() {
        beforeEach(function() {
          return atom.config.set('pigments.groupPaletteColors', 'by file');
        });
        it('renders the list with sublists for each files', function() {
          var ols;
          ols = paletteElement.querySelectorAll('ol ol');
          return expect(ols.length).toEqual(5);
        });
        it('adds a header with the file path for each sublist', function() {
          var ols;
          ols = paletteElement.querySelectorAll('.pigments-color-group-header');
          return expect(ols.length).toEqual(5);
        });
        describe('and the sortPaletteColors is set to name', function() {
          beforeEach(function() {
            return atom.config.set('pigments.sortPaletteColors', 'by name');
          });
          return it('sorts the nested list items', function() {
            var file, i, lis, n, name, ol, ols, palettes, sortedColors, _results;
            palettes = paletteElement.getFilesPalettes();
            ols = paletteElement.querySelectorAll('.pigments-color-group');
            n = 0;
            _results = [];
            for (file in palettes) {
              palette = palettes[file];
              ol = ols[n++];
              lis = ol.querySelectorAll('li');
              sortedColors = palette.sortedByName();
              _results.push((function() {
                var _i, _len, _results1;
                _results1 = [];
                for (i = _i = 0, _len = sortedColors.length; _i < _len; i = ++_i) {
                  name = sortedColors[i].name;
                  _results1.push(expect(lis[i].querySelector('.name').textContent).toEqual(name));
                }
                return _results1;
              })());
            }
            return _results;
          });
        });
        return describe('when the mergeColorDuplicates', function() {
          beforeEach(function() {
            return atom.config.set('pigments.mergeColorDuplicates', true);
          });
          return it('groups identical colors together', function() {
            var lis;
            lis = paletteElement.querySelectorAll('li');
            return expect(lis.length).toEqual(40);
          });
        });
      });
      describe('sorting selector', function() {
        var sortSelect;
        sortSelect = [][0];
        return describe('when changed', function() {
          beforeEach(function() {
            sortSelect = paletteElement.querySelector('#sort-palette-colors');
            sortSelect.querySelector('option[value="by name"]').setAttribute('selected', 'selected');
            return change(sortSelect);
          });
          return it('changes the settings value', function() {
            return expect(atom.config.get('pigments.sortPaletteColors')).toEqual('by name');
          });
        });
      });
      return describe('grouping selector', function() {
        var groupSelect;
        groupSelect = [][0];
        return describe('when changed', function() {
          beforeEach(function() {
            groupSelect = paletteElement.querySelector('#group-palette-colors');
            groupSelect.querySelector('option[value="by file"]').setAttribute('selected', 'selected');
            return change(groupSelect);
          });
          return it('changes the settings value', function() {
            return expect(atom.config.get('pigments.groupPaletteColors')).toEqual('by file');
          });
        });
      });
    });
    describe('when the palette settings differs from defaults', function() {
      beforeEach(function() {
        atom.config.set('pigments.sortPaletteColors', 'by name');
        atom.config.set('pigments.groupPaletteColors', 'by file');
        return atom.config.set('pigments.mergeColorDuplicates', true);
      });
      return describe('when pigments:show-palette commands is triggered', function() {
        beforeEach(function() {
          atom.commands.dispatch(workspaceElement, 'pigments:show-palette');
          waitsFor(function() {
            return paletteElement = workspaceElement.querySelector('pigments-palette');
          });
          return runs(function() {
            return palette = paletteElement.getModel();
          });
        });
        describe('the sorting selector', function() {
          return it('selects the current value', function() {
            var sortSelect;
            sortSelect = paletteElement.querySelector('#sort-palette-colors');
            return expect(sortSelect.querySelector('option[selected]').value).toEqual('by name');
          });
        });
        describe('the grouping selector', function() {
          return it('selects the current value', function() {
            var groupSelect;
            groupSelect = paletteElement.querySelector('#group-palette-colors');
            return expect(groupSelect.querySelector('option[selected]').value).toEqual('by file');
          });
        });
        return it('checks the merge checkbox', function() {
          var mergeCheckBox;
          mergeCheckBox = paletteElement.querySelector('#merge-duplicates');
          return expect(mergeCheckBox.checked).toBeTruthy();
        });
      });
    });
    return describe('when the project variables are modified', function() {
      var initialColorCount, spy, _ref2;
      _ref2 = [], spy = _ref2[0], initialColorCount = _ref2[1];
      beforeEach(function() {
        atom.commands.dispatch(workspaceElement, 'pigments:show-palette');
        waitsFor(function() {
          return paletteElement = workspaceElement.querySelector('pigments-palette');
        });
        runs(function() {
          palette = paletteElement.getModel();
          initialColorCount = palette.getColorsCount();
          spy = jasmine.createSpy('onDidUpdateVariables');
          project.onDidUpdateVariables(spy);
          return atom.config.set('pigments.sourceNames', ['*.styl', '*.less', '*.sass']);
        });
        return waitsFor(function() {
          return spy.callCount > 0;
        });
      });
      return it('updates the palette', function() {
        var lis;
        expect(palette.getColorsCount()).not.toEqual(initialColorCount);
        lis = paletteElement.querySelectorAll('li');
        return expect(lis.length).not.toEqual(initialColorCount);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9zcGVjL3BhbGV0dGUtZWxlbWVudC1zcGVjLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxvREFBQTs7QUFBQSxFQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUixDQUFSLENBQUE7O0FBQUEsRUFDQSxPQUFBLEdBQVUsT0FBQSxDQUFRLGdCQUFSLENBRFYsQ0FBQTs7QUFBQSxFQUVDLGtCQUFtQixPQUFBLENBQVEsYUFBUixFQUFuQixlQUZELENBQUE7O0FBQUEsRUFHQSxPQUFrQixPQUFBLENBQVEsa0JBQVIsQ0FBbEIsRUFBQyxjQUFBLE1BQUQsRUFBUyxhQUFBLEtBSFQsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixTQUFBLEdBQUE7QUFDekIsUUFBQSxzRkFBQTtBQUFBLElBQUEsUUFBeUUsQ0FBQyxDQUFELENBQXpFLEVBQUMsaUJBQUQsRUFBUyxrQkFBVCxFQUFrQix5QkFBbEIsRUFBa0MsMkJBQWxDLEVBQW9ELG1CQUFwRCxFQUE4RCxrQkFBOUQsQ0FBQTtBQUFBLElBRUEsU0FBQSxHQUFZLFNBQUMsSUFBRCxFQUFPLEtBQVAsRUFBYyxJQUFkLEVBQW9CLElBQXBCLEdBQUE7YUFDVjtBQUFBLFFBQUMsTUFBQSxJQUFEO0FBQUEsUUFBTyxPQUFBLEtBQVA7QUFBQSxRQUFjLE1BQUEsSUFBZDtBQUFBLFFBQW9CLE1BQUEsSUFBcEI7QUFBQSxRQUEwQixFQUFBLEVBQUksTUFBQSxFQUE5QjtRQURVO0lBQUEsQ0FGWixDQUFBO0FBQUEsSUFLQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQW5CLENBQUE7QUFBQSxNQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsRUFBd0MsQ0FDdEMsUUFEc0MsRUFFdEMsUUFGc0MsQ0FBeEMsQ0FEQSxDQUFBO0FBQUEsTUFNQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixVQUE5QixDQUF5QyxDQUFDLElBQTFDLENBQStDLFNBQUMsR0FBRCxHQUFBO0FBQ2hFLFVBQUEsUUFBQSxHQUFXLEdBQUcsQ0FBQyxVQUFmLENBQUE7aUJBQ0EsT0FBQSxHQUFVLFFBQVEsQ0FBQyxVQUFULENBQUEsRUFGc0Q7UUFBQSxDQUEvQyxFQUFIO01BQUEsQ0FBaEIsQ0FOQSxDQUFBO2FBVUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFBRyxPQUFPLENBQUMsVUFBUixDQUFBLEVBQUg7TUFBQSxDQUFoQixFQVhTO0lBQUEsQ0FBWCxDQUxBLENBQUE7QUFBQSxJQWtCQSxTQUFBLENBQVUsU0FBQSxHQUFBO2FBQ1IsT0FBTyxDQUFDLE9BQVIsQ0FBQSxFQURRO0lBQUEsQ0FBVixDQWxCQSxDQUFBO0FBQUEsSUFxQkEsUUFBQSxDQUFTLG9CQUFULEVBQStCLFNBQUEsR0FBQTtBQUM3QixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLE9BQUEsR0FBYyxJQUFBLE9BQUEsQ0FBUSxDQUNwQixTQUFBLENBQVUsS0FBVixFQUFxQixJQUFBLEtBQUEsQ0FBTSxTQUFOLENBQXJCLEVBQXVDLFdBQXZDLEVBQW9ELENBQXBELENBRG9CLEVBRXBCLFNBQUEsQ0FBVSxPQUFWLEVBQXVCLElBQUEsS0FBQSxDQUFNLFNBQU4sQ0FBdkIsRUFBeUMsV0FBekMsRUFBc0QsQ0FBdEQsQ0FGb0IsRUFHcEIsU0FBQSxDQUFVLE1BQVYsRUFBc0IsSUFBQSxLQUFBLENBQU0sU0FBTixDQUF0QixFQUF3QyxXQUF4QyxFQUFxRCxDQUFyRCxDQUhvQixFQUlwQixTQUFBLENBQVUsU0FBVixFQUF5QixJQUFBLEtBQUEsQ0FBTSxTQUFOLENBQXpCLEVBQTJDLFdBQTNDLEVBQXdELENBQXhELENBSm9CLEVBS3BCLFNBQUEsQ0FBVSxLQUFWLEVBQXFCLElBQUEsS0FBQSxDQUFNLFNBQU4sQ0FBckIsRUFBdUMsZUFBdkMsRUFBd0QsQ0FBeEQsQ0FMb0IsQ0FBUixDQUFkLENBQUE7QUFBQSxRQVFBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLE9BQW5CLENBUmpCLENBQUE7ZUFTQSxPQUFPLENBQUMsV0FBUixDQUFvQixjQUFwQixFQVZTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQVlBLEVBQUEsQ0FBRyxzQ0FBSCxFQUEyQyxTQUFBLEdBQUE7ZUFDekMsTUFBQSxDQUFPLGNBQVAsQ0FBc0IsQ0FBQyxXQUF2QixDQUFBLEVBRHlDO01BQUEsQ0FBM0MsQ0FaQSxDQUFBO2FBZUEsRUFBQSxDQUFHLG9FQUFILEVBQXlFLFNBQUEsR0FBQTtlQUN2RSxNQUFBLENBQU8sY0FBYyxDQUFDLGdCQUFmLENBQWdDLElBQWhDLENBQXNDLENBQUEsQ0FBQSxDQUFFLENBQUMsYUFBekMsQ0FBdUQscUJBQXZELENBQVAsQ0FBcUYsQ0FBQyxHQUFHLENBQUMsT0FBMUYsQ0FBQSxFQUR1RTtNQUFBLENBQXpFLEVBaEI2QjtJQUFBLENBQS9CLENBckJBLENBQUE7QUFBQSxJQXdDQSxRQUFBLENBQVMsa0RBQVQsRUFBNkQsU0FBQSxHQUFBO0FBQzNELE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyx1QkFBekMsQ0FBQSxDQUFBO0FBQUEsUUFFQSxRQUFBLENBQVMsU0FBQSxHQUFBO2lCQUNQLGNBQUEsR0FBaUIsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0Isa0JBQS9CLEVBRFY7UUFBQSxDQUFULENBRkEsQ0FBQTtlQUtBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE9BQUEsR0FBVSxjQUFjLENBQUMsUUFBZixDQUFBLENBQVYsQ0FBQTtpQkFDQSxPQUFPLENBQUMsV0FBUixDQUFvQixjQUFwQixFQUZHO1FBQUEsQ0FBTCxFQU5TO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQVVBLEVBQUEsQ0FBRyx5QkFBSCxFQUE4QixTQUFBLEdBQUE7ZUFDNUIsTUFBQSxDQUFPLGNBQVAsQ0FBc0IsQ0FBQyxXQUF2QixDQUFBLEVBRDRCO01BQUEsQ0FBOUIsQ0FWQSxDQUFBO0FBQUEsTUFhQSxFQUFBLENBQUcsNkRBQUgsRUFBa0UsU0FBQSxHQUFBO0FBQ2hFLFFBQUEsTUFBQSxDQUFPLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxJQUFoQyxDQUFxQyxDQUFDLE1BQTdDLENBQW9ELENBQUMsR0FBRyxDQUFDLE9BQXpELENBQWlFLENBQWpFLENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxjQUFjLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBaEMsQ0FBcUMsQ0FBQyxNQUE3QyxDQUFvRCxDQUFDLE9BQXJELENBQTZELE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBL0UsRUFGZ0U7TUFBQSxDQUFsRSxDQWJBLENBQUE7QUFBQSxNQWlCQSxFQUFBLENBQUcscUNBQUgsRUFBMEMsU0FBQSxHQUFBO0FBQ3hDLFlBQUEsb0JBQUE7QUFBQSxRQUFBLGdCQUFBLEdBQW1CLE9BQU8sQ0FBQyxpQkFBUixDQUFBLENBQW5CLENBQUE7QUFBQSxRQUVBLEVBQUEsR0FBSyxjQUFjLENBQUMsYUFBZixDQUE2QixJQUE3QixDQUZMLENBQUE7ZUFHQSxNQUFBLENBQU8sRUFBRSxDQUFDLGFBQUgsQ0FBaUIsT0FBakIsQ0FBeUIsQ0FBQyxXQUFqQyxDQUE2QyxDQUFDLE9BQTlDLENBQXNELElBQUksQ0FBQyxPQUFPLENBQUMsVUFBYixDQUF3QixnQkFBaUIsQ0FBQSxDQUFBLENBQUUsQ0FBQyxJQUE1QyxDQUF0RCxFQUp3QztNQUFBLENBQTFDLENBakJBLENBQUE7QUFBQSxNQXVCQSxRQUFBLENBQVMsMkJBQVQsRUFBc0MsU0FBQSxHQUFBO2VBQ3BDLEVBQUEsQ0FBRyxnQ0FBSCxFQUFxQyxTQUFBLEdBQUE7QUFDbkMsY0FBQSxXQUFBO0FBQUEsVUFBQSxLQUFBLENBQU0sT0FBTixFQUFlLG9CQUFmLENBQUEsQ0FBQTtBQUFBLFVBRUEsV0FBQSxHQUFjLGNBQWMsQ0FBQyxhQUFmLENBQTZCLG9CQUE3QixDQUZkLENBQUE7QUFBQSxVQUlBLEtBQUEsQ0FBTSxXQUFOLENBSkEsQ0FBQTtpQkFNQSxRQUFBLENBQVMsU0FBQSxHQUFBO21CQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxTQUEzQixHQUF1QyxFQUExQztVQUFBLENBQVQsRUFQbUM7UUFBQSxDQUFyQyxFQURvQztNQUFBLENBQXRDLENBdkJBLENBQUE7QUFBQSxNQWlDQSxRQUFBLENBQVMscURBQVQsRUFBZ0UsU0FBQSxHQUFBO0FBQzlELFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtpQkFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsNEJBQWhCLEVBQThDLFVBQTlDLEVBRFM7UUFBQSxDQUFYLENBQUEsQ0FBQTtlQUdBLEVBQUEsQ0FBRyxxQkFBSCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsY0FBQSw4Q0FBQTtBQUFBLFVBQUEsWUFBQSxHQUFlLE9BQU8sQ0FBQyxVQUFSLENBQUEsQ0FBb0IsQ0FBQyxhQUFyQixDQUFBLENBQWYsQ0FBQTtBQUFBLFVBQ0EsR0FBQSxHQUFNLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxJQUFoQyxDQUROLENBQUE7QUFHQTtlQUFBLDJEQUFBLEdBQUE7QUFDRSxZQURHLHVCQUFBLElBQ0gsQ0FBQTtBQUFBLDBCQUFBLE1BQUEsQ0FBTyxHQUFJLENBQUEsQ0FBQSxDQUFFLENBQUMsYUFBUCxDQUFxQixPQUFyQixDQUE2QixDQUFDLFdBQXJDLENBQWlELENBQUMsT0FBbEQsQ0FBMEQsSUFBMUQsRUFBQSxDQURGO0FBQUE7MEJBSndCO1FBQUEsQ0FBMUIsRUFKOEQ7TUFBQSxDQUFoRSxDQWpDQSxDQUFBO0FBQUEsTUE0Q0EsUUFBQSxDQUFTLG9EQUFULEVBQStELFNBQUEsR0FBQTtBQUM3RCxRQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7aUJBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxTQUE5QyxFQURTO1FBQUEsQ0FBWCxDQUFBLENBQUE7ZUFHQSxFQUFBLENBQUcscUJBQUgsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLGNBQUEsOENBQUE7QUFBQSxVQUFBLFlBQUEsR0FBZSxPQUFPLENBQUMsVUFBUixDQUFBLENBQW9CLENBQUMsWUFBckIsQ0FBQSxDQUFmLENBQUE7QUFBQSxVQUNBLEdBQUEsR0FBTSxjQUFjLENBQUMsZ0JBQWYsQ0FBZ0MsSUFBaEMsQ0FETixDQUFBO0FBR0E7ZUFBQSwyREFBQSxHQUFBO0FBQ0UsWUFERyx1QkFBQSxJQUNILENBQUE7QUFBQSwwQkFBQSxNQUFBLENBQU8sR0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFDLGFBQVAsQ0FBcUIsT0FBckIsQ0FBNkIsQ0FBQyxXQUFyQyxDQUFpRCxDQUFDLE9BQWxELENBQTBELElBQTFELEVBQUEsQ0FERjtBQUFBOzBCQUp3QjtRQUFBLENBQTFCLEVBSjZEO01BQUEsQ0FBL0QsQ0E1Q0EsQ0FBQTtBQUFBLE1BdURBLFFBQUEsQ0FBUyxvREFBVCxFQUErRCxTQUFBLEdBQUE7QUFDN0QsUUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2lCQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsRUFBK0MsU0FBL0MsRUFEUztRQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsUUFHQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQSxHQUFBO0FBQ2xELGNBQUEsR0FBQTtBQUFBLFVBQUEsR0FBQSxHQUFNLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxPQUFoQyxDQUFOLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxNQUFYLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsQ0FBM0IsRUFGa0Q7UUFBQSxDQUFwRCxDQUhBLENBQUE7QUFBQSxRQU9BLEVBQUEsQ0FBRyxtREFBSCxFQUF3RCxTQUFBLEdBQUE7QUFDdEQsY0FBQSxHQUFBO0FBQUEsVUFBQSxHQUFBLEdBQU0sY0FBYyxDQUFDLGdCQUFmLENBQWdDLDhCQUFoQyxDQUFOLENBQUE7aUJBQ0EsTUFBQSxDQUFPLEdBQUcsQ0FBQyxNQUFYLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsQ0FBM0IsRUFGc0Q7UUFBQSxDQUF4RCxDQVBBLENBQUE7QUFBQSxRQVdBLFFBQUEsQ0FBUywwQ0FBVCxFQUFxRCxTQUFBLEdBQUE7QUFDbkQsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0QkFBaEIsRUFBOEMsU0FBOUMsRUFEUztVQUFBLENBQVgsQ0FBQSxDQUFBO2lCQUdBLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsZ0JBQUEsZ0VBQUE7QUFBQSxZQUFBLFFBQUEsR0FBVyxjQUFjLENBQUMsZ0JBQWYsQ0FBQSxDQUFYLENBQUE7QUFBQSxZQUNBLEdBQUEsR0FBTSxjQUFjLENBQUMsZ0JBQWYsQ0FBZ0MsdUJBQWhDLENBRE4sQ0FBQTtBQUFBLFlBRUEsQ0FBQSxHQUFJLENBRkosQ0FBQTtBQUlBO2lCQUFBLGdCQUFBO3VDQUFBO0FBQ0UsY0FBQSxFQUFBLEdBQUssR0FBSSxDQUFBLENBQUEsRUFBQSxDQUFULENBQUE7QUFBQSxjQUNBLEdBQUEsR0FBTSxFQUFFLENBQUMsZ0JBQUgsQ0FBb0IsSUFBcEIsQ0FETixDQUFBO0FBQUEsY0FFQSxZQUFBLEdBQWUsT0FBTyxDQUFDLFlBQVIsQ0FBQSxDQUZmLENBQUE7QUFBQTs7QUFJQTtxQkFBQSwyREFBQSxHQUFBO0FBQ0Usa0JBREcsdUJBQUEsSUFDSCxDQUFBO0FBQUEsaUNBQUEsTUFBQSxDQUFPLEdBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQyxhQUFQLENBQXFCLE9BQXJCLENBQTZCLENBQUMsV0FBckMsQ0FBaUQsQ0FBQyxPQUFsRCxDQUEwRCxJQUExRCxFQUFBLENBREY7QUFBQTs7bUJBSkEsQ0FERjtBQUFBOzRCQUxnQztVQUFBLENBQWxDLEVBSm1EO1FBQUEsQ0FBckQsQ0FYQSxDQUFBO2VBNEJBLFFBQUEsQ0FBUywrQkFBVCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO21CQUNULElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwrQkFBaEIsRUFBaUQsSUFBakQsRUFEUztVQUFBLENBQVgsQ0FBQSxDQUFBO2lCQUdBLEVBQUEsQ0FBRyxrQ0FBSCxFQUF1QyxTQUFBLEdBQUE7QUFDckMsZ0JBQUEsR0FBQTtBQUFBLFlBQUEsR0FBQSxHQUFNLGNBQWMsQ0FBQyxnQkFBZixDQUFnQyxJQUFoQyxDQUFOLENBQUE7bUJBRUEsTUFBQSxDQUFPLEdBQUcsQ0FBQyxNQUFYLENBQWtCLENBQUMsT0FBbkIsQ0FBMkIsRUFBM0IsRUFIcUM7VUFBQSxDQUF2QyxFQUp3QztRQUFBLENBQTFDLEVBN0I2RDtNQUFBLENBQS9ELENBdkRBLENBQUE7QUFBQSxNQTZGQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO0FBQzNCLFlBQUEsVUFBQTtBQUFBLFFBQUMsYUFBYyxLQUFmLENBQUE7ZUFFQSxRQUFBLENBQVMsY0FBVCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsVUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsWUFBQSxVQUFBLEdBQWEsY0FBYyxDQUFDLGFBQWYsQ0FBNkIsc0JBQTdCLENBQWIsQ0FBQTtBQUFBLFlBQ0EsVUFBVSxDQUFDLGFBQVgsQ0FBeUIseUJBQXpCLENBQW1ELENBQUMsWUFBcEQsQ0FBaUUsVUFBakUsRUFBNkUsVUFBN0UsQ0FEQSxDQUFBO21CQUdBLE1BQUEsQ0FBTyxVQUFQLEVBSlM7VUFBQSxDQUFYLENBQUEsQ0FBQTtpQkFNQSxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO21CQUMvQixNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixDQUFQLENBQXFELENBQUMsT0FBdEQsQ0FBOEQsU0FBOUQsRUFEK0I7VUFBQSxDQUFqQyxFQVB1QjtRQUFBLENBQXpCLEVBSDJCO01BQUEsQ0FBN0IsQ0E3RkEsQ0FBQTthQTBHQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLFlBQUEsV0FBQTtBQUFBLFFBQUMsY0FBZSxLQUFoQixDQUFBO2VBRUEsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLFVBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFlBQUEsV0FBQSxHQUFjLGNBQWMsQ0FBQyxhQUFmLENBQTZCLHVCQUE3QixDQUFkLENBQUE7QUFBQSxZQUNBLFdBQVcsQ0FBQyxhQUFaLENBQTBCLHlCQUExQixDQUFvRCxDQUFDLFlBQXJELENBQWtFLFVBQWxFLEVBQThFLFVBQTlFLENBREEsQ0FBQTttQkFHQSxNQUFBLENBQU8sV0FBUCxFQUpTO1VBQUEsQ0FBWCxDQUFBLENBQUE7aUJBTUEsRUFBQSxDQUFHLDRCQUFILEVBQWlDLFNBQUEsR0FBQTttQkFDL0IsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsQ0FBUCxDQUFzRCxDQUFDLE9BQXZELENBQStELFNBQS9ELEVBRCtCO1VBQUEsQ0FBakMsRUFQdUI7UUFBQSxDQUF6QixFQUg0QjtNQUFBLENBQTlCLEVBM0cyRDtJQUFBLENBQTdELENBeENBLENBQUE7QUFBQSxJQWdLQSxRQUFBLENBQVMsaURBQVQsRUFBNEQsU0FBQSxHQUFBO0FBQzFELE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDRCQUFoQixFQUE4QyxTQUE5QyxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw2QkFBaEIsRUFBK0MsU0FBL0MsQ0FEQSxDQUFBO2VBRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLCtCQUFoQixFQUFpRCxJQUFqRCxFQUhTO01BQUEsQ0FBWCxDQUFBLENBQUE7YUFLQSxRQUFBLENBQVMsa0RBQVQsRUFBNkQsU0FBQSxHQUFBO0FBQzNELFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLGdCQUF2QixFQUF5Qyx1QkFBekMsQ0FBQSxDQUFBO0FBQUEsVUFFQSxRQUFBLENBQVMsU0FBQSxHQUFBO21CQUNQLGNBQUEsR0FBaUIsZ0JBQWdCLENBQUMsYUFBakIsQ0FBK0Isa0JBQS9CLEVBRFY7VUFBQSxDQUFULENBRkEsQ0FBQTtpQkFLQSxJQUFBLENBQUssU0FBQSxHQUFBO21CQUNILE9BQUEsR0FBVSxjQUFjLENBQUMsUUFBZixDQUFBLEVBRFA7VUFBQSxDQUFMLEVBTlM7UUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLFFBU0EsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUEsR0FBQTtpQkFDL0IsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUEsR0FBQTtBQUM5QixnQkFBQSxVQUFBO0FBQUEsWUFBQSxVQUFBLEdBQWEsY0FBYyxDQUFDLGFBQWYsQ0FBNkIsc0JBQTdCLENBQWIsQ0FBQTttQkFDQSxNQUFBLENBQU8sVUFBVSxDQUFDLGFBQVgsQ0FBeUIsa0JBQXpCLENBQTRDLENBQUMsS0FBcEQsQ0FBMEQsQ0FBQyxPQUEzRCxDQUFtRSxTQUFuRSxFQUY4QjtVQUFBLENBQWhDLEVBRCtCO1FBQUEsQ0FBakMsQ0FUQSxDQUFBO0FBQUEsUUFjQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQSxHQUFBO2lCQUNoQyxFQUFBLENBQUcsMkJBQUgsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLGdCQUFBLFdBQUE7QUFBQSxZQUFBLFdBQUEsR0FBYyxjQUFjLENBQUMsYUFBZixDQUE2Qix1QkFBN0IsQ0FBZCxDQUFBO21CQUNBLE1BQUEsQ0FBTyxXQUFXLENBQUMsYUFBWixDQUEwQixrQkFBMUIsQ0FBNkMsQ0FBQyxLQUFyRCxDQUEyRCxDQUFDLE9BQTVELENBQW9FLFNBQXBFLEVBRjhCO1VBQUEsQ0FBaEMsRUFEZ0M7UUFBQSxDQUFsQyxDQWRBLENBQUE7ZUFtQkEsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUEsR0FBQTtBQUM5QixjQUFBLGFBQUE7QUFBQSxVQUFBLGFBQUEsR0FBZ0IsY0FBYyxDQUFDLGFBQWYsQ0FBNkIsbUJBQTdCLENBQWhCLENBQUE7aUJBQ0EsTUFBQSxDQUFPLGFBQWEsQ0FBQyxPQUFyQixDQUE2QixDQUFDLFVBQTlCLENBQUEsRUFGOEI7UUFBQSxDQUFoQyxFQXBCMkQ7TUFBQSxDQUE3RCxFQU4wRDtJQUFBLENBQTVELENBaEtBLENBQUE7V0E4TEEsUUFBQSxDQUFTLHlDQUFULEVBQW9ELFNBQUEsR0FBQTtBQUNsRCxVQUFBLDZCQUFBO0FBQUEsTUFBQSxRQUEyQixFQUEzQixFQUFDLGNBQUQsRUFBTSw0QkFBTixDQUFBO0FBQUEsTUFDQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDLHVCQUF6QyxDQUFBLENBQUE7QUFBQSxRQUVBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7aUJBQ1AsY0FBQSxHQUFpQixnQkFBZ0IsQ0FBQyxhQUFqQixDQUErQixrQkFBL0IsRUFEVjtRQUFBLENBQVQsQ0FGQSxDQUFBO0FBQUEsUUFLQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsVUFBQSxPQUFBLEdBQVUsY0FBYyxDQUFDLFFBQWYsQ0FBQSxDQUFWLENBQUE7QUFBQSxVQUNBLGlCQUFBLEdBQW9CLE9BQU8sQ0FBQyxjQUFSLENBQUEsQ0FEcEIsQ0FBQTtBQUFBLFVBRUEsR0FBQSxHQUFNLE9BQU8sQ0FBQyxTQUFSLENBQWtCLHNCQUFsQixDQUZOLENBQUE7QUFBQSxVQUlBLE9BQU8sQ0FBQyxvQkFBUixDQUE2QixHQUE3QixDQUpBLENBQUE7aUJBTUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNCQUFoQixFQUF3QyxDQUN0QyxRQURzQyxFQUV0QyxRQUZzQyxFQUd0QyxRQUhzQyxDQUF4QyxFQVBHO1FBQUEsQ0FBTCxDQUxBLENBQUE7ZUFrQkEsUUFBQSxDQUFTLFNBQUEsR0FBQTtpQkFBRyxHQUFHLENBQUMsU0FBSixHQUFnQixFQUFuQjtRQUFBLENBQVQsRUFuQlM7TUFBQSxDQUFYLENBREEsQ0FBQTthQXNCQSxFQUFBLENBQUcscUJBQUgsRUFBMEIsU0FBQSxHQUFBO0FBQ3hCLFlBQUEsR0FBQTtBQUFBLFFBQUEsTUFBQSxDQUFPLE9BQU8sQ0FBQyxjQUFSLENBQUEsQ0FBUCxDQUFnQyxDQUFDLEdBQUcsQ0FBQyxPQUFyQyxDQUE2QyxpQkFBN0MsQ0FBQSxDQUFBO0FBQUEsUUFFQSxHQUFBLEdBQU0sY0FBYyxDQUFDLGdCQUFmLENBQWdDLElBQWhDLENBRk4sQ0FBQTtlQUlBLE1BQUEsQ0FBTyxHQUFHLENBQUMsTUFBWCxDQUFrQixDQUFDLEdBQUcsQ0FBQyxPQUF2QixDQUErQixpQkFBL0IsRUFMd0I7TUFBQSxDQUExQixFQXZCa0Q7SUFBQSxDQUFwRCxFQS9MeUI7RUFBQSxDQUEzQixDQUxBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/william/.atom/packages/pigments/spec/palette-element-spec.coffee
