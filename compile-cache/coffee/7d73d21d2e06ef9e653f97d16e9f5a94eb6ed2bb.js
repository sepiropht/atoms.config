(function() {
  var AtomicChrome, CompositeDisposable, Server, WSHandler, WS_PORT;

  CompositeDisposable = require('atom').CompositeDisposable;

  Server = require('ws').Server;

  WSHandler = require('./ws-handler');

  WS_PORT = 64292;

  module.exports = AtomicChrome = {
    activate: function(state) {
      this.wss = new Server({
        port: WS_PORT
      });
      this.wss.on('connection', function(ws) {
        return new WSHandler(ws);
      });
      return this.wss.on('error', function(err) {
        if (err.code !== 'EADDRINUSE') {
          return console.error(err);
        }
      });
    },
    deactivate: function() {
      return this.wss.close();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvd2lsbGlhbS8uYXRvbS9wYWNrYWdlcy9hdG9taWMtY2hyb21lL2xpYi9hdG9taWMtY2hyb21lLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSw2REFBQTs7QUFBQSxFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUixFQUF2QixtQkFBRCxDQUFBOztBQUFBLEVBQ0MsU0FBdUIsT0FBQSxDQUFRLElBQVIsRUFBdkIsTUFERCxDQUFBOztBQUFBLEVBR0EsU0FBQSxHQUF3QixPQUFBLENBQVEsY0FBUixDQUh4QixDQUFBOztBQUFBLEVBS0EsT0FBQSxHQUFVLEtBTFYsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFlBQUEsR0FDZjtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsR0FBRCxHQUFXLElBQUEsTUFBQSxDQUFPO0FBQUEsUUFBQyxJQUFBLEVBQU0sT0FBUDtPQUFQLENBQVgsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsWUFBUixFQUFzQixTQUFDLEVBQUQsR0FBQTtlQUNoQixJQUFBLFNBQUEsQ0FBVSxFQUFWLEVBRGdCO01BQUEsQ0FBdEIsQ0FGQSxDQUFBO2FBSUEsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFpQixTQUFDLEdBQUQsR0FBQTtBQUNmLFFBQUEsSUFBMEIsR0FBRyxDQUFDLElBQUosS0FBWSxZQUF0QztpQkFBQSxPQUFPLENBQUMsS0FBUixDQUFjLEdBQWQsRUFBQTtTQURlO01BQUEsQ0FBakIsRUFMUTtJQUFBLENBQVY7QUFBQSxJQVFBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBQSxFQURVO0lBQUEsQ0FSWjtHQVJGLENBQUE7QUFBQSIKfQ==

//# sourceURL=/home/william/.atom/packages/atomic-chrome/lib/atomic-chrome.coffee
