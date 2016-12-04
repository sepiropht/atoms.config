
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Languages, _, extend;

  _ = require('lodash');

  extend = null;

  module.exports = Languages = (function() {
    Languages.prototype.languageNames = ["apex", "arduino", "c-sharp", "c", "clojure", "coffeescript", "coldfusion", "cpp", "crystal", "css", "csv", "d", "ejs", "elm", "erb", "erlang", "gherkin", "go", "fortran", "handlebars", "haskell", "html", "jade", "java", "javascript", "json", "jsx", "latex", "less", "lua", "markdown", 'marko', "mustache", "nunjucks", "objective-c", "ocaml", "pawn", "perl", "php", "puppet", "python", "r", "riotjs", "ruby", "rust", "sass", "scss", "spacebars", "sql", "svg", "swig", "tss", "twig", "typescript", "ux_markup", "vala", "vue", "visualforce", "xml", "xtemplate"];


    /*
    Languages
     */

    Languages.prototype.languages = null;


    /*
    Namespaces
     */

    Languages.prototype.namespaces = null;


    /*
    Constructor
     */

    function Languages() {
      this.languages = _.map(this.languageNames, function(name) {
        return require("./" + name);
      });
      this.namespaces = _.map(this.languages, function(language) {
        return language.namespace;
      });
    }


    /*
    Get language for grammar and extension
     */

    Languages.prototype.getLanguages = function(arg) {
      var extension, grammar, name, namespace;
      name = arg.name, namespace = arg.namespace, grammar = arg.grammar, extension = arg.extension;
      return _.union(_.filter(this.languages, function(language) {
        return _.isEqual(language.name, name);
      }), _.filter(this.languages, function(language) {
        return _.isEqual(language.namespace, namespace);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.grammars, grammar);
      }), _.filter(this.languages, function(language) {
        return _.includes(language.extensions, extension);
      }));
    };

    return Languages;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvc2VwaXJvcGh0Ly5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xhbmd1YWdlcy9pbmRleC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFHQTtBQUhBLE1BQUE7O0VBS0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLE1BQUEsR0FBUzs7RUFHVCxNQUFNLENBQUMsT0FBUCxHQUF1Qjt3QkFJckIsYUFBQSxHQUFlLENBQ2IsTUFEYSxFQUViLFNBRmEsRUFHYixTQUhhLEVBSWIsR0FKYSxFQUtiLFNBTGEsRUFNYixjQU5hLEVBT2IsWUFQYSxFQVFiLEtBUmEsRUFTYixTQVRhLEVBVWIsS0FWYSxFQVdiLEtBWGEsRUFZYixHQVphLEVBYWIsS0FiYSxFQWNiLEtBZGEsRUFlYixLQWZhLEVBZ0JiLFFBaEJhLEVBaUJiLFNBakJhLEVBa0JiLElBbEJhLEVBbUJiLFNBbkJhLEVBb0JiLFlBcEJhLEVBcUJiLFNBckJhLEVBc0JiLE1BdEJhLEVBdUJiLE1BdkJhLEVBd0JiLE1BeEJhLEVBeUJiLFlBekJhLEVBMEJiLE1BMUJhLEVBMkJiLEtBM0JhLEVBNEJiLE9BNUJhLEVBNkJiLE1BN0JhLEVBOEJiLEtBOUJhLEVBK0JiLFVBL0JhLEVBZ0NiLE9BaENhLEVBaUNiLFVBakNhLEVBa0NiLFVBbENhLEVBbUNiLGFBbkNhLEVBb0NiLE9BcENhLEVBcUNiLE1BckNhLEVBc0NiLE1BdENhLEVBdUNiLEtBdkNhLEVBd0NiLFFBeENhLEVBeUNiLFFBekNhLEVBMENiLEdBMUNhLEVBMkNiLFFBM0NhLEVBNENiLE1BNUNhLEVBNkNiLE1BN0NhLEVBOENiLE1BOUNhLEVBK0NiLE1BL0NhLEVBZ0RiLFdBaERhLEVBaURiLEtBakRhLEVBa0RiLEtBbERhLEVBbURiLE1BbkRhLEVBb0RiLEtBcERhLEVBcURiLE1BckRhLEVBc0RiLFlBdERhLEVBdURiLFdBdkRhLEVBd0RiLE1BeERhLEVBeURiLEtBekRhLEVBMERiLGFBMURhLEVBMkRiLEtBM0RhLEVBNERiLFdBNURhOzs7QUErRGY7Ozs7d0JBR0EsU0FBQSxHQUFXOzs7QUFFWDs7Ozt3QkFHQSxVQUFBLEdBQVk7OztBQUVaOzs7O0lBR2EsbUJBQUE7TUFDWCxJQUFDLENBQUEsU0FBRCxHQUFhLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLGFBQVAsRUFBc0IsU0FBQyxJQUFEO2VBQ2pDLE9BQUEsQ0FBUSxJQUFBLEdBQUssSUFBYjtNQURpQyxDQUF0QjtNQUdiLElBQUMsQ0FBQSxVQUFELEdBQWMsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFDLENBQUEsU0FBUCxFQUFrQixTQUFDLFFBQUQ7ZUFBYyxRQUFRLENBQUM7TUFBdkIsQ0FBbEI7SUFKSDs7O0FBTWI7Ozs7d0JBR0EsWUFBQSxHQUFjLFNBQUMsR0FBRDtBQUVaLFVBQUE7TUFGYyxpQkFBTSwyQkFBVyx1QkFBUzthQUV4QyxDQUFDLENBQUMsS0FBRixDQUNFLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLFNBQVYsRUFBcUIsU0FBQyxRQUFEO2VBQWMsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxRQUFRLENBQUMsSUFBbkIsRUFBeUIsSUFBekI7TUFBZCxDQUFyQixDQURGLEVBRUUsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixTQUFDLFFBQUQ7ZUFBYyxDQUFDLENBQUMsT0FBRixDQUFVLFFBQVEsQ0FBQyxTQUFuQixFQUE4QixTQUE5QjtNQUFkLENBQXJCLENBRkYsRUFHRSxDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxTQUFWLEVBQXFCLFNBQUMsUUFBRDtlQUFjLENBQUMsQ0FBQyxRQUFGLENBQVcsUUFBUSxDQUFDLFFBQXBCLEVBQThCLE9BQTlCO01BQWQsQ0FBckIsQ0FIRixFQUlFLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLFNBQVYsRUFBcUIsU0FBQyxRQUFEO2VBQWMsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxRQUFRLENBQUMsVUFBcEIsRUFBZ0MsU0FBaEM7TUFBZCxDQUFyQixDQUpGO0lBRlk7Ozs7O0FBbEdoQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuTGFuZ3VhZ2UgU3VwcG9ydCBhbmQgZGVmYXVsdCBvcHRpb25zLlxuIyMjXG5cInVzZSBzdHJpY3RcIlxuIyBMYXp5IGxvYWRlZCBkZXBlbmRlbmNpZXNcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuZXh0ZW5kID0gbnVsbFxuXG4jXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIExhbmd1YWdlc1xuXG4gICMgU3VwcG9ydGVkIHVuaXF1ZSBjb25maWd1cmF0aW9uIGtleXNcbiAgIyBVc2VkIGZvciBkZXRlY3RpbmcgbmVzdGVkIGNvbmZpZ3VyYXRpb25zIGluIC5qc2JlYXV0aWZ5cmNcbiAgbGFuZ3VhZ2VOYW1lczogW1xuICAgIFwiYXBleFwiXG4gICAgXCJhcmR1aW5vXCJcbiAgICBcImMtc2hhcnBcIlxuICAgIFwiY1wiXG4gICAgXCJjbG9qdXJlXCJcbiAgICBcImNvZmZlZXNjcmlwdFwiXG4gICAgXCJjb2xkZnVzaW9uXCJcbiAgICBcImNwcFwiXG4gICAgXCJjcnlzdGFsXCJcbiAgICBcImNzc1wiXG4gICAgXCJjc3ZcIlxuICAgIFwiZFwiXG4gICAgXCJlanNcIlxuICAgIFwiZWxtXCJcbiAgICBcImVyYlwiXG4gICAgXCJlcmxhbmdcIlxuICAgIFwiZ2hlcmtpblwiXG4gICAgXCJnb1wiXG4gICAgXCJmb3J0cmFuXCJcbiAgICBcImhhbmRsZWJhcnNcIlxuICAgIFwiaGFza2VsbFwiXG4gICAgXCJodG1sXCJcbiAgICBcImphZGVcIlxuICAgIFwiamF2YVwiXG4gICAgXCJqYXZhc2NyaXB0XCJcbiAgICBcImpzb25cIlxuICAgIFwianN4XCJcbiAgICBcImxhdGV4XCJcbiAgICBcImxlc3NcIlxuICAgIFwibHVhXCJcbiAgICBcIm1hcmtkb3duXCJcbiAgICAnbWFya28nXG4gICAgXCJtdXN0YWNoZVwiXG4gICAgXCJudW5qdWNrc1wiXG4gICAgXCJvYmplY3RpdmUtY1wiXG4gICAgXCJvY2FtbFwiXG4gICAgXCJwYXduXCJcbiAgICBcInBlcmxcIlxuICAgIFwicGhwXCJcbiAgICBcInB1cHBldFwiXG4gICAgXCJweXRob25cIlxuICAgIFwiclwiXG4gICAgXCJyaW90anNcIlxuICAgIFwicnVieVwiXG4gICAgXCJydXN0XCJcbiAgICBcInNhc3NcIlxuICAgIFwic2Nzc1wiXG4gICAgXCJzcGFjZWJhcnNcIlxuICAgIFwic3FsXCJcbiAgICBcInN2Z1wiXG4gICAgXCJzd2lnXCJcbiAgICBcInRzc1wiXG4gICAgXCJ0d2lnXCJcbiAgICBcInR5cGVzY3JpcHRcIlxuICAgIFwidXhfbWFya3VwXCJcbiAgICBcInZhbGFcIlxuICAgIFwidnVlXCJcbiAgICBcInZpc3VhbGZvcmNlXCJcbiAgICBcInhtbFwiXG4gICAgXCJ4dGVtcGxhdGVcIlxuICBdXG5cbiAgIyMjXG4gIExhbmd1YWdlc1xuICAjIyNcbiAgbGFuZ3VhZ2VzOiBudWxsXG5cbiAgIyMjXG4gIE5hbWVzcGFjZXNcbiAgIyMjXG4gIG5hbWVzcGFjZXM6IG51bGxcblxuICAjIyNcbiAgQ29uc3RydWN0b3JcbiAgIyMjXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBsYW5ndWFnZXMgPSBfLm1hcChAbGFuZ3VhZ2VOYW1lcywgKG5hbWUpIC0+XG4gICAgICByZXF1aXJlKFwiLi8je25hbWV9XCIpXG4gICAgKVxuICAgIEBuYW1lc3BhY2VzID0gXy5tYXAoQGxhbmd1YWdlcywgKGxhbmd1YWdlKSAtPiBsYW5ndWFnZS5uYW1lc3BhY2UpXG5cbiAgIyMjXG4gIEdldCBsYW5ndWFnZSBmb3IgZ3JhbW1hciBhbmQgZXh0ZW5zaW9uXG4gICMjI1xuICBnZXRMYW5ndWFnZXM6ICh7bmFtZSwgbmFtZXNwYWNlLCBncmFtbWFyLCBleHRlbnNpb259KSAtPlxuICAgICMgY29uc29sZS5sb2coJ2dldExhbmd1YWdlcycsIG5hbWUsIG5hbWVzcGFjZSwgZ3JhbW1hciwgZXh0ZW5zaW9uLCBAbGFuZ3VhZ2VzKVxuICAgIF8udW5pb24oXG4gICAgICBfLmZpbHRlcihAbGFuZ3VhZ2VzLCAobGFuZ3VhZ2UpIC0+IF8uaXNFcXVhbChsYW5ndWFnZS5uYW1lLCBuYW1lKSlcbiAgICAgIF8uZmlsdGVyKEBsYW5ndWFnZXMsIChsYW5ndWFnZSkgLT4gXy5pc0VxdWFsKGxhbmd1YWdlLm5hbWVzcGFjZSwgbmFtZXNwYWNlKSlcbiAgICAgIF8uZmlsdGVyKEBsYW5ndWFnZXMsIChsYW5ndWFnZSkgLT4gXy5pbmNsdWRlcyhsYW5ndWFnZS5ncmFtbWFycywgZ3JhbW1hcikpXG4gICAgICBfLmZpbHRlcihAbGFuZ3VhZ2VzLCAobGFuZ3VhZ2UpIC0+IF8uaW5jbHVkZXMobGFuZ3VhZ2UuZXh0ZW5zaW9ucywgZXh0ZW5zaW9uKSlcbiAgICApXG4iXX0=
