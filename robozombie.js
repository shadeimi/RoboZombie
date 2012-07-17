(function() {
  var RemoteServer, RoboZombie, fail, pass, xmlrpc, zombie;

  xmlrpc = require('xmlrpc');

  if (!xmlrpc) {
    console.log('Requires node-xmlrpc');
    console.log('npm install xmlrpc');
  }

  zombie = require('zombie');

  if (!zombie) console.log('Requires Zombie.js');

  pass = function(callback) {
    return callback(null, {
      status: 'PASS'
    });
  };

  fail = function(callback) {
    return callback(null, {
      status: 'FAIL'
    });
  };

  RoboZombie = (function() {

    function RoboZombie(browser) {
      this.browser = browser != null ? browser : null;
    }

    RoboZombie.prototype.open_browser_callback = function(callback) {
      var robozombie;
      robozombie = this;
      return function(err, browser, status) {
        robozombie.browser = browser;
        return pass(callback);
      };
    };

    RoboZombie.prototype.Open_Browser = function(params, callback) {
      var url;
      url = params[1][0];
      return zombie.visit(url, {
        debug: true
      }, this.open_browser_callback(callback));
    };

    RoboZombie.prototype.Close_Browser = function(params, callback) {
      return pass(callback);
    };

    RoboZombie.prototype.Input_Text = function(params, callback) {
      var identifier, text;
      identifier = params[1][0];
      text = params[1][1];
      this.browser.fill(identifier, text);
      return pass(callback);
    };

    RoboZombie.prototype.Click_Button = function(params, callback) {
      return this.browser.pressButton(params[1][0], function(err) {
        return pass(callback);
      });
    };

    RoboZombie.prototype.Location_Should_Be = function(params, callback) {
      var location;
      location = params[1][0];
      this.browser.location;
      if (this.browser.location.href.split("?", 1)[0] === location) {
        return pass(callback);
      } else {
        console.log(this.browser.location.href.split("?", 1)[0]);
        console.log(location);
        return fail(callback);
      }
    };

    RoboZombie.prototype.Title_Should_Be = function(params, callback) {
      var title;
      title = params[1][0];
      if (this.browser.text("title") === title) {
        return pass(callback);
      } else {
        return fail(callback);
      }
    };

    return RoboZombie;

  })();

  RemoteServer = (function() {

    function RemoteServer(library) {
      this.library = library;
    }

    RemoteServer.prototype.get_keyword_names = function(params, callback) {
      var name, names, _;
      names = (function() {
        var _ref, _results;
        _ref = this.library;
        _results = [];
        for (name in _ref) {
          _ = _ref[name];
          if (name[0].toUpperCase() === name[0]) {
            _results.push(name.replace(/\_/g, " "));
          }
        }
        return _results;
      }).call(this);
      return callback(null, names);
    };

    RemoteServer.prototype.get_keyword_documentation = function(params, callback) {
      return callback(null, "Doqumantsione");
    };

    RemoteServer.prototype.get_keyword_arguments = function(params, callback) {
      return callback(null, ["*args"]);
    };

    RemoteServer.prototype.run_keyword = function(params, callback) {
      return this.library[params[0].replace(/\s/g, "_")](params, callback);
    };

    RemoteServer.prototype.create_callback = function(name) {
      var remote;
      remote = this;
      return function(err, params, callback) {
        return remote[name](params, callback);
      };
    };

    RemoteServer.prototype.start_remote_server = function() {
      var name, server, _;
      server = xmlrpc.createServer({
        host: 'localhost',
        port: 1337
      });
      for (name in this) {
        _ = this[name];
        if (name !== "start_remote_server" && name !== "library" && name !== "create_callback") {
          console.log("Listening for " + name);
          server.on(name, this.create_callback(name));
        }
      }
      return console.log("Remote server on in port 1337");
    };

    return RemoteServer;

  })();

  new RemoteServer(new RoboZombie()).start_remote_server();

}).call(this);
