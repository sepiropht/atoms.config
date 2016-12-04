(function() {
  var CSON, defaults, engines, filetypes, getConfigFile, packagePath, path, prefix,
    slice = [].slice;

  CSON = require("season");

  path = require("path");

  prefix = "markdown-writer";

  packagePath = atom.packages.resolvePackagePath("markdown-writer");

  getConfigFile = function() {
    var parts;
    parts = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (packagePath) {
      return path.join.apply(path, [packagePath, "lib"].concat(slice.call(parts)));
    } else {
      return path.join.apply(path, [__dirname].concat(slice.call(parts)));
    }
  };

  defaults = CSON.readFileSync(getConfigFile("config.cson"));

  defaults["siteEngine"] = "general";

  defaults["projectConfigFile"] = "_mdwriter.cson";

  defaults["siteLinkPath"] = path.join(atom.getConfigDirPath(), prefix + "-links.cson");

  defaults["grammars"] = ['source.gfm', 'source.gfm.nvatom', 'source.litcoffee', 'source.asciidoc', 'text.md', 'text.plain', 'text.plain.null-grammar'];

  filetypes = {
    'source.asciidoc': CSON.readFileSync(getConfigFile("filetypes", "asciidoc.cson"))
  };

  engines = {
    html: {
      imageTag: "<a href=\"{site}/{slug}.html\" target=\"_blank\">\n  <img class=\"align{align}\" alt=\"{alt}\" src=\"{src}\" width=\"{width}\" height=\"{height}\" />\n</a>"
    },
    jekyll: {
      textStyles: {
        codeblock: {
          before: "{% highlight %}\n",
          after: "\n{% endhighlight %}",
          regexBefore: "{% highlight(?: .+)? %}\n",
          regexAfter: "\n{% endhighlight %}"
        }
      }
    },
    octopress: {
      imageTag: "{% img {align} {src} {width} {height} '{alt}' %}"
    },
    hexo: {
      newPostFileName: "{title}{extension}",
      frontMatter: "layout: \"{layout}\"\ntitle: \"{title}\"\ndate: \"{date}\"\n---"
    }
  };

  module.exports = {
    projectConfigs: {},
    engineNames: function() {
      return Object.keys(engines);
    },
    keyPath: function(key) {
      return prefix + "." + key;
    },
    get: function(key, options) {
      var allow_blank, config, i, len, ref, val;
      if (options == null) {
        options = {};
      }
      allow_blank = options["allow_blank"] != null ? options["allow_blank"] : true;
      ref = ["Project", "User", "Engine", "Filetype", "Default"];
      for (i = 0, len = ref.length; i < len; i++) {
        config = ref[i];
        val = this["get" + config](key);
        if (allow_blank) {
          if (val != null) {
            return val;
          }
        } else {
          if (val) {
            return val;
          }
        }
      }
    },
    set: function(key, val) {
      return atom.config.set(this.keyPath(key), val);
    },
    restoreDefault: function(key) {
      return atom.config.unset(this.keyPath(key));
    },
    getDefault: function(key) {
      return this._valueForKeyPath(defaults, key);
    },
    getFiletype: function(key) {
      var editor, filetypeConfig;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return void 0;
      }
      filetypeConfig = filetypes[editor.getGrammar().scopeName];
      if (filetypeConfig == null) {
        return void 0;
      }
      return this._valueForKeyPath(filetypeConfig, key);
    },
    getEngine: function(key) {
      var engine, engineConfig;
      engine = this.getProject("siteEngine") || this.getUser("siteEngine") || this.getDefault("siteEngine");
      engineConfig = engines[engine];
      if (engineConfig == null) {
        return void 0;
      }
      return this._valueForKeyPath(engineConfig, key);
    },
    getCurrentDefault: function(key) {
      return this.getEngine(key) || this.getDefault(key);
    },
    getUser: function(key) {
      return atom.config.get(this.keyPath(key), {
        sources: [atom.config.getUserConfigPath()]
      });
    },
    getProject: function(key) {
      var config, configFile;
      configFile = this.getProjectConfigFile();
      if (!configFile) {
        return;
      }
      config = this._loadProjectConfig(configFile);
      return this._valueForKeyPath(config, key);
    },
    getSampleConfigFile: function() {
      return getConfigFile("config.cson");
    },
    getProjectConfigFile: function() {
      var fileName, projectPath;
      if (!atom.project || atom.project.getPaths().length < 1) {
        return;
      }
      projectPath = atom.project.getPaths()[0];
      fileName = this.getUser("projectConfigFile") || this.getDefault("projectConfigFile");
      return path.join(projectPath, fileName);
    },
    _loadProjectConfig: function(configFile) {
      var error;
      if (this.projectConfigs[configFile]) {
        return this.projectConfigs[configFile];
      }
      try {
        return this.projectConfigs[configFile] = CSON.readFileSync(configFile) || {};
      } catch (error1) {
        error = error1;
        if (atom.inDevMode() && !/ENOENT/.test(error.message)) {
          console.info("Markdown Writer [config.coffee]: " + error);
        }
        return this.projectConfigs[configFile] = {};
      }
    },
    _valueForKeyPath: function(object, keyPath) {
      var i, key, keys, len;
      keys = keyPath.split(".");
      for (i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        object = object[key];
        if (object == null) {
          return;
        }
      }
      return object;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXdyaXRlci9saWIvY29uZmlnLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNEVBQUE7SUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQUEsR0FBUzs7RUFDVCxXQUFBLEdBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBZCxDQUFpQyxpQkFBakM7O0VBQ2QsYUFBQSxHQUFnQixTQUFBO0FBQ2QsUUFBQTtJQURlO0lBQ2YsSUFBRyxXQUFIO2FBQW9CLElBQUksQ0FBQyxJQUFMLGFBQVUsQ0FBQSxXQUFBLEVBQWEsS0FBTyxTQUFBLFdBQUEsS0FBQSxDQUFBLENBQTlCLEVBQXBCO0tBQUEsTUFBQTthQUNLLElBQUksQ0FBQyxJQUFMLGFBQVUsQ0FBQSxTQUFXLFNBQUEsV0FBQSxLQUFBLENBQUEsQ0FBckIsRUFETDs7RUFEYzs7RUFLaEIsUUFBQSxHQUFXLElBQUksQ0FBQyxZQUFMLENBQWtCLGFBQUEsQ0FBYyxhQUFkLENBQWxCOztFQUdYLFFBQVMsQ0FBQSxZQUFBLENBQVQsR0FBeUI7O0VBR3pCLFFBQVMsQ0FBQSxtQkFBQSxDQUFULEdBQWdDOztFQUdoQyxRQUFTLENBQUEsY0FBQSxDQUFULEdBQTJCLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLGdCQUFMLENBQUEsQ0FBVixFQUFzQyxNQUFELEdBQVEsYUFBN0M7O0VBRTNCLFFBQVMsQ0FBQSxVQUFBLENBQVQsR0FBdUIsQ0FDckIsWUFEcUIsRUFFckIsbUJBRnFCLEVBR3JCLGtCQUhxQixFQUlyQixpQkFKcUIsRUFLckIsU0FMcUIsRUFNckIsWUFOcUIsRUFPckIseUJBUHFCOztFQVd2QixTQUFBLEdBQ0U7SUFBQSxpQkFBQSxFQUFtQixJQUFJLENB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QUMsQ0FBQSxjQUFlLENBQUEsVUFBQSxDQUFoQixHQUE4QixJQUFJLENBQUMsWUFBTCxDQUFrQixVQUFsQixDQUFBLElBQWlDLEdBRmpFO09BQUEsY0FBQTtRQUdNO1FBR0osSUFBRyxJQUFJLENBQUMsU0FBTCxDQUFBLENBQUEsSUFBb0IsQ0FBQyxRQUFRLENBQUMsSUFBVCxDQUFjLEtBQUssQ0FBQyxPQUFwQixDQUF4QjtVQUNFLE9BQU8sQ0FBQyxJQUFSLENBQWEsbUNBQUEsR0FBb0MsS0FBakQsRUFERjs7ZUFHQSxJQUFDLENBQUEsY0FBZSxDQUFBLFVBQUEsQ0FBaEIsR0FBOEIsR0FUaEM7O0lBSGtCLENBdkVwQjtJQXFGQSxnQkFBQSxFQUFrQixTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ2hCLFVBQUE7TUFBQSxJQUFBLEdBQU8sT0FBTyxDQUFDLEtBQVIsQ0FBYyxHQUFkO0FBQ1AsV0FBQSxzQ0FBQTs7UUFDRSxNQUFBLEdBQVMsTUFBTyxDQUFBLEdBQUE7UUFDaEIsSUFBYyxjQUFkO0FBQUEsaUJBQUE7O0FBRkY7YUFHQTtJQUxnQixDQXJGbEI7O0FBOURGIiwic291cmNlc0NvbnRlbnQiOlsiQ1NPTiA9IHJlcXVpcmUgXCJzZWFzb25cIlxucGF0aCA9IHJlcXVpcmUgXCJwYXRoXCJcblxucHJlZml4ID0gXCJtYXJrZG93bi13cml0ZXJcIlxucGFja2FnZVBhdGggPSBhdG9tLnBhY2thZ2VzLnJlc29sdmVQYWNrYWdlUGF0aChcIm1hcmtkb3duLXdyaXRlclwiKVxuZ2V0Q29uZmlnRmlsZSA9IChwYXJ0cy4uLikgLT5cbiAgaWYgcGFja2FnZVBhdGggdGhlbiBwYXRoLmpvaW4ocGFja2FnZVBhdGgsIFwibGliXCIsIHBhcnRzLi4uKVxuICBlbHNlIHBhdGguam9pbihfX2Rpcm5hbWUsIHBhcnRzLi4uKVxuXG4jIGxvYWQgc2FtcGxlIGNvbmZpZyB0byBkZWZhdWx0c1xuZGVmYXVsdHMgPSBDU09OLnJlYWRGaWxlU3luYyhnZXRDb25maWdGaWxlKFwiY29uZmlnLmNzb25cIikpXG5cbiMgc3RhdGljIGVuZ2luZSBvZiB5b3VyIGJsb2csIHNlZSBgQGVuZ2luZXNgXG5kZWZhdWx0c1tcInNpdGVFbmdpbmVcIl0gPSBcImdlbmVyYWxcIlxuIyBwcm9qZWN0IHNwZWNpZmljIGNvbmZpZ3VyYXRpb24gZmlsZSBuYW1lXG4jIGh0dHBzOi8vZ2l0aHViLmNvbS96aHVvY2h1bi9tZC13cml0ZXIvd2lraS9TZXR0aW5ncy1mb3ItaW5kaXZpZHVhbC1wcm9qZWN0c1xuZGVmYXVsdHNbXCJwcm9qZWN0Q29uZmlnRmlsZVwiXSA9IFwiX21kd3JpdGVyLmNzb25cIlxuIyBwYXRoIHRvIGEgY3NvbiBmaWxlIHRoYXQgc3RvcmVzIGxpbmtzIGFkZGVkIGZvciBhdXRvbWF0aWMgbGlua2luZ1xuIyBkZWZhdWx0IHRvIGBtYXJrZG93bi13cml0ZXItbGlua3MuY3NvbmAgZmlsZSB1bmRlciB1c2VyJ3MgY29uZmlnIGRpcmVjdG9yeVxuZGVmYXVsdHNbXCJzaXRlTGlua1BhdGhcIl0gPSBwYXRoLmpvaW4oYXRvbS5nZXRDb25maWdEaXJQYXRoKCksIFwiI3twcmVmaXh9LWxpbmtzLmNzb25cIilcbiMgZmlsZXR5cGVzIG1hcmtkb3duLXdyaXRlciBjb21tYW5kcyBhcHBseVxuZGVmYXVsdHNbXCJncmFtbWFyc1wiXSA9IFtcbiAgJ3NvdXJjZS5nZm0nXG4gICdzb3VyY2UuZ2ZtLm52YXRvbSdcbiAgJ3NvdXJjZS5saXRjb2ZmZWUnXG4gICdzb3VyY2UuYXNjaWlkb2MnXG4gICd0ZXh0Lm1kJ1xuICAndGV4dC5wbGFpbidcbiAgJ3RleHQucGxhaW4ubnVsbC1ncmFtbWFyJ1xuXVxuXG4jIGZpbGV0eXBlIGRlZmF1bHRzXG5maWxldHlwZXMgPVxuICAnc291cmNlLmFzY2lpZG9jJzogQ1NPTi5yZWFkRmlsZVN5bmMoZ2V0Q29uZmlnRmlsZShcImZpbGV0eXBlc1wiLCBcImFzY2lpZG9jLmNzb25cIikpXG5cbiMgZW5naW5lIGRlZmF1bHRzXG5lbmdpbmVzID1cbiAgaHRtbDpcbiAgICBpbWFnZVRhZzogXCJcIlwiXG4gICAgICA8YSBocmVmPVwie3NpdGV9L3tzbHVnfS5odG1sXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgIDxpbWcgY2xhc3M9XCJhbGlnbnthbGlnbn1cIiBhbHQ9XCJ7YWx0fVwiIHNyYz1cIntzcmN9XCIgd2lkdGg9XCJ7d2lkdGh9XCIgaGVpZ2h0PVwie2hlaWdodH1cIiAvPlxuICAgICAgPC9hPlxuICAgICAgXCJcIlwiXG4gIGpla3lsbDpcbiAgICB0ZXh0U3R5bGVzOlxuICAgICAgY29kZWJsb2NrOlxuICAgICAgICBiZWZvcmU6IFwieyUgaGlnaGxpZ2h0ICV9XFxuXCJcbiAgICAgICAgYWZ0ZXI6IFwiXFxueyUgZW5kaGlnaGxpZ2h0ICV9XCJcbiAgICAgICAgcmVnZXhCZWZvcmU6IFwieyUgaGlnaGxpZ2h0KD86IC4rKT8gJX1cXG5cIlxuICAgICAgICByZWdleEFmdGVyOiBcIlxcbnslIGVuZGhpZ2hsaWdodCAlfVwiXG4gIG9jdG9wcmVzczpcbiAgICBpbWFnZVRhZzogXCJ7JSBpbWcge2FsaWdufSB7c3JjfSB7d2lkdGh9IHtoZWlnaHR9ICd7YWx0fScgJX1cIlxuICBoZXhvOlxuICAgIG5ld1Bvc3RGaWxlTmFtZTogXCJ7dGl0bGV9e2V4dGVuc2lvbn1cIlxuICAgIGZyb250TWF0dGVyOiBcIlwiXCJcbiAgICAgIGxheW91dDogXCJ7bGF5b3V0fVwiXG4gICAgICB0aXRsZTogXCJ7dGl0bGV9XCJcbiAgICAgIGRhdGU6IFwie2RhdGV9XCJcbiAgICAgIC0tLVxuICAgICAgXCJcIlwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgcHJvamVjdENvbmZpZ3M6IHt9XG5cbiAgZW5naW5lTmFtZXM6IC0+IE9iamVjdC5rZXlzKGVuZ2luZXMpXG5cbiAga2V5UGF0aDogKGtleSkgLT4gXCIje3ByZWZpeH0uI3trZXl9XCJcblxuICBnZXQ6IChrZXksIG9wdGlvbnMgPSB7fSkgLT5cbiAgICBhbGxvd19ibGFuayA9IGlmIG9wdGlvbnNbXCJhbGxvd19ibGFua1wiXT8gdGhlbiBvcHRpb25zW1wiYWxsb3dfYmxhbmtcIl0gZWxzZSB0cnVlXG5cbiAgICBmb3IgY29uZmlnIGluIFtcIlByb2plY3RcIiwgXCJVc2VyXCIsIFwiRW5naW5lXCIsIFwiRmlsZXR5cGVcIiwgXCJEZWZhdWx0XCJdXG4gICAgICB2YWwgPSBAW1wiZ2V0I3tjb25maWd9XCJdKGtleSlcblxuICAgICAgaWYgYWxsb3dfYmxhbmsgdGhlbiByZXR1cm4gdmFsIGlmIHZhbD9cbiAgICAgIGVsc2UgcmV0dXJuIHZhbCBpZiB2YWxcblxuICBzZXQ6IChrZXksIHZhbCkgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoQGtleVBhdGgoa2V5KSwgdmFsKVxuXG4gIHJlc3RvcmVEZWZhdWx0OiAoa2V5KSAtPlxuICAgIGF0b20uY29uZmlnLnVuc2V0KEBrZXlQYXRoKGtleSkpXG5cbiAgIyBnZXQgY29uZmlnLmRlZmF1bHRzXG4gIGdldERlZmF1bHQ6IChrZXkpIC0+XG4gICAgQF92YWx1ZUZvcktleVBhdGgoZGVmYXVsdHMsIGtleSlcblxuICAjIGdldCBjb25maWcuZmlsZXR5cGVzW2ZpbGV0eXBlXSBiYXNlZCBvbiBjdXJyZW50IGZpbGVcbiAgZ2V0RmlsZXR5cGU6IChrZXkpIC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgcmV0dXJuIHVuZGVmaW5lZCB1bmxlc3MgZWRpdG9yP1xuXG4gICAgZmlsZXR5cGVDb25maWcgPSBmaWxldHlwZXNbZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWVdXG4gICAgcmV0dXJuIHVuZGVmaW5lZCB1bmxlc3MgZmlsZXR5cGVDb25maWc/XG5cbiAgICBAX3ZhbHVlRm9yS2V5UGF0aChmaWxldHlwZUNvbmZpZywga2V5KVxuXG4gICMgZ2V0IGNvbmZpZy5lbmdpbmVzIGJhc2VkIG9uIHNpdGVFbmdpbmUgc2V0XG4gIGdldEVuZ2luZTogKGtleSkgLT5cbiAgICBlbmdpbmUgPSBAZ2V0UHJvamVjdChcInNpdGVFbmdpbmVcIikgfHxcbiAgICAgICAgICAgICBAZ2V0VXNlcihcInNpdGVFbmdpbmVcIikgfHxcbiAgICAgICAgICAgICBAZ2V0RGVmYXVsdChcInNpdGVFbmdpbmVcIilcblxuICAgIGVuZ2luZUNvbmZpZyA9IGVuZ2luZXNbZW5naW5lXVxuICAgIHJldHVybiB1bmRlZmluZWQgdW5sZXNzIGVuZ2luZUNvbmZpZz9cblxuICAgIEBfdmFsdWVGb3JLZXlQYXRoKGVuZ2luZUNvbmZpZywga2V5KVxuXG4gICMgZ2V0IGNvbmZpZyBiYXNlZCBvbiBlbmdpbmUgc2V0IG9yIGdsb2JhbCBkZWZhdWx0c1xuICBnZXRDdXJyZW50RGVmYXVsdDogKGtleSkgLT5cbiAgICBAZ2V0RW5naW5lKGtleSkgfHwgQGdldERlZmF1bHQoa2V5KVxuXG4gICMgZ2V0IGNvbmZpZyBmcm9tIHVzZXIncyBjb25maWcgZmlsZVxuICBnZXRVc2VyOiAoa2V5KSAtPlxuICAgIGF0b20uY29uZmlnLmdldChAa2V5UGF0aChrZXkpLCBzb3VyY2VzOiBbYXRvbS5jb25maWcuZ2V0VXNlckNvbmZpZ1BhdGgoKV0pXG5cbiAgIyBnZXQgcHJvamVjdCBzcGVjaWZpYyBjb25maWcgZnJvbSBwcm9qZWN0J3MgY29uZmlnIGZpbGVcbiAgZ2V0UHJvamVjdDogKGtleSkgLT5cbiAgICBjb25maWdGaWxlID0gQGdldFByb2plY3RDb25maWdGaWxlKClcbiAgICByZXR1cm4gdW5sZXNzIGNvbmZpZ0ZpbGVcblxuICAgIGNvbmZpZyA9IEBfbG9hZFByb2plY3RDb25maWcoY29uZmlnRmlsZSlcbiAgICBAX3ZhbHVlRm9yS2V5UGF0aChjb25maWcsIGtleSlcblxuICBnZXRTYW1wbGVDb25maWdGaWxlOiAtPiBnZXRDb25maWdGaWxlKFwiY29uZmlnLmNzb25cIilcblxuICBnZXRQcm9qZWN0Q29uZmlnRmlsZTogLT5cbiAgICByZXR1cm4gaWYgIWF0b20ucHJvamVjdCB8fCBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKS5sZW5ndGggPCAxXG5cbiAgICBwcm9qZWN0UGF0aCA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdXG4gICAgZmlsZU5hbWUgPSBAZ2V0VXNlcihcInByb2plY3RDb25maWdGaWxlXCIpIHx8IEBnZXREZWZhdWx0KFwicHJvamVjdENvbmZpZ0ZpbGVcIilcbiAgICBwYXRoLmpvaW4ocHJvamVjdFBhdGgsIGZpbGVOYW1lKVxuXG4gIF9sb2FkUHJvamVjdENvbmZpZzogKGNvbmZpZ0ZpbGUpIC0+XG4gICAgcmV0dXJuIEBwcm9qZWN0Q29uZmlnc1tjb25maWdGaWxlXSBpZiBAcHJvamVjdENvbmZpZ3NbY29uZmlnRmlsZV1cblxuICAgIHRyeVxuICAgICAgIyB3aGVuIGNvbmZpZ0ZpbGUgaXMgZW1wdHksIENTT04gcmV0dXJuIHVuZGVmaW5lZCwgZmFsbGJhY2sgdG8ge31cbiAgICAgIEBwcm9qZWN0Q29uZmlnc1tjb25maWdGaWxlXSA9IENTT04ucmVhZEZpbGVTeW5jKGNvbmZpZ0ZpbGUpIHx8IHt9XG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgICMgbG9nIGVycm9yIG1lc3NhZ2UgaW4gZGV2IG1vZGUgZm9yIGVhc2llciB0cm91Ymxlc2hvdHRpbmcsXG4gICAgICAjIGJ1dCBpZ25vcmluZyBmaWxlIG5vdCBleGlzdHMgZXJyb3JcbiAgICAgIGlmIGF0b20uaW5EZXZNb2RlKCkgJiYgIS9FTk9FTlQvLnRlc3QoZXJyb3IubWVzc2FnZSlcbiAgICAgICAgY29uc29sZS5pbmZvKFwiTWFya2Rvd24gV3JpdGVyIFtjb25maWcuY29mZmVlXTogI3tlcnJvcn1cIilcblxuICAgICAgQHByb2plY3RDb25maWdzW2NvbmZpZ0ZpbGVdID0ge31cblxuICBfdmFsdWVGb3JLZXlQYXRoOiAob2JqZWN0LCBrZXlQYXRoKSAtPlxuICAgIGtleXMgPSBrZXlQYXRoLnNwbGl0KFwiLlwiKVxuICAgIGZvciBrZXkgaW4ga2V5c1xuICAgICAgb2JqZWN0ID0gb2JqZWN0W2tleV1cbiAgICAgIHJldHVybiB1bmxlc3Mgb2JqZWN0P1xuICAgIG9iamVjdFxuIl19
