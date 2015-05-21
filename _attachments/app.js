// Generated by CoffeeScript 1.9.0
var Coconut, DefaultView, Router, cloudCouchPassword, cloudCouchUsername,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __hasProp = {}.hasOwnProperty,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Router = (function(_super) {
  __extends(Router, _super);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    "": "default"
  };

  Router.prototype["default"] = function() {
    return (Coconut.defaultView != null ? Coconut.defaultView : Coconut.defaultView = new DefaultView()).render();
  };

  Router.prototype.startApp = function() {
    return Backbone.history.start();
  };

  return Router;

})(Backbone.Router);

DefaultView = (function(_super) {
  __extends(DefaultView, _super);

  function DefaultView() {
    this.replicateDesignDoc = __bind(this.replicateDesignDoc, this);
    this.putDocument = __bind(this.putDocument, this);
    this.putAdminUser = __bind(this.putAdminUser, this);
    this.putConfig = __bind(this.putConfig, this);
    this.putLocalConfig = __bind(this.putLocalConfig, this);
    this.create = __bind(this.create, this);
    return DefaultView.__super__.constructor.apply(this, arguments);
  }

  DefaultView.prototype.el = '#content';

  DefaultView.prototype.events = {
    "click #create": "create",
    "keyup [name='config-title']": "updateDatabaseName",
    "change [name='config-sync-mode']": "toggleHTTPPost"
  };

  DefaultView.prototype.toggleHTTPPost = function() {
    return $("#http-post-target").toggle($("[name='config-sync-mode']:checked").val() === "http-post");
  };

  DefaultView.prototype.updateDatabaseName = function() {
    if ($("[name=database-name]").val() != null) {
      return $("[name=database-name]").val($("[name=config-title]").val().toLowerCase().replace(/\s/g, "-").replace(/[^A-Za-z\-]/g, ""));
    }
  };

  DefaultView.prototype.create = function() {
    var name;
    name = $("[name=database-name]").val();
    return $.couch.db(name).create({
      success: (function(_this) {
        return function() {
          return _this.replicateCoconutCoreDatabase({
            target: name,
            success: function() {
              return _this.putConfig({
                success: function() {
                  return _this.putLocalConfig({
                    success: function() {
                      return _this.putAdminUser({
                        success: function() {}
                      });
                    }
                  });
                }
              });
            }
          });
        };
      })(this),
      error: function(error, response, message) {
        message = "Error: '" + message + "' while creating database '" + name + "'";
        return $("#message").html(message);
      }
    });
  };

  DefaultView.prototype.replicateCoconutCoreDatabase = function(options) {
    var target;
    target = options.target;
    return this.replicateDesignDoc({
      target: target,
      success: function() {
        $("#message").html("Successfully created " + target + ". <br/> <a href='/" + target + "/_design/coconut/index.html'>Configure Coconut: " + target + "</a>");
        return typeof options.success === "function" ? options.success() : void 0;
      },
      error: function(error) {
        var message;
        message = "Error: '" + error + " ' while copying application data to " + name;
        $("#message").html(message);
        console.log(message);
        console.log(error);
        return typeof options.error === "function" ? options.error() : void 0;
      }
    });
  };

  DefaultView.prototype.putLocalConfig = function(options) {
    return this.putDocument(_.extend(options, {
      document: {
        "_id": "coconut.config.local",
        "mode": "cloud"
      }
    }));
  };

  DefaultView.prototype.putConfig = function(options) {
    return this.putDocument(_.extend(options, {
      document: {
        "_id": "coconut.config",
        "title": $("[name=config-title]").val(),
        "cloud": "http://" + document.location.host,
        "cloud_database_name": $("[name=database-name]").val(),
        "cloud_credentials": cloudCouchUsername + ":" + cloudCouchPassword,
        "date_format": "YYYY-MM-DD HH:mm:ss",
        "sync_mode": $('[name=config-sync-mode]:checked').val(),
        "http-post-target": $('[name=config-sync-mode]:checked').val() === "http-post" ? $("[name=config-http-post-target]").val() : void 0,
        "completion_mode": $('[name=completion-mode]:checked').val(),
        "isApplicationDoc": true
      }
    }));
  };

  DefaultView.prototype.putAdminUser = function(options) {
    return this.putDocument(_.extend(options, {
      document: {
        "_id": "user.admin",
        "collection": "user",
        "username": $("[name=admin-username]").val(),
        "password": $("[name=admin-password]").val()
      }
    }));
  };

  DefaultView.prototype.putDocument = function(options) {
    return $.couch.db($("[name=database-name]").val()).saveDoc(options.document, {
      success: (function(_this) {
        return function() {
          return options.success();
        };
      })(this),
      error: function() {
        var message;
        message = "Error: '" + error + "' while creating document " + (JSON.stringify(document));
        $("#message").html(message);
        console.log(message);
        return console.log(error);
      }
    });
  };

  DefaultView.prototype.replicate = function(options) {
    return $.couch.replicate("coconut-factory", options.target, {
      success: function() {
        return options.success();
      },
      error: function() {
        return options.error();
      }
    }, options.replicationArguments);
  };

  DefaultView.prototype.replicateDesignDoc = function(options) {
    return this.replicate(_.extend(options, {
      replicationArguments: {
        doc_ids: ["_design/coconut"]
      }
    }));
  };

  DefaultView.prototype.render = function() {
    return this.$el.html("<style> body{ background-color:lightblue; font-family: sans-serif; font-size: 20pt; color: #95634e; } label{ display:block; margin-top: 20px; color: #95634e; } h1{ text-align:center; color: #95634e; font-size: 60pt; } input{ height: 50px; width: 350px; font-size: 20pt; font-family: sans-serif; background: #ffe88c; color: #578729; } button{ margin-top: 20px; display: block; background: #578729; color: #ffe88c; font-size: 50pt; font-family: sans-serif; } [type=radio]{ width: 10px; } </style> <div style='position:fixed; right:50px; top:00px;'> <h1>Coconut<br/> Factory</h1> <img src='palm-tree-icon.png'/> </div> <label>Name of Coconut Application</label> <input name='config-title' type='text'></input> <!-- <label>Date Format</label> <input name='config-date_format' type='text' value='YYYY-MM-DD HH:mm:ss'></input> --> <label>Admin username</label> <input name='admin-username' type='text' value='admin'></input> <label>Admin password</label> <input name='admin-password' type='text' value='admin'></input> <label>Name of database</label> <input name='database-name' type='text'></input> <!-- Made this for the Philippines - not really necessary --> <div style='display:none'> <label>Send Mode</label> <div> <input id='couchdb-sync' name='config-sync-mode' type='radio' value='couchdb-sync' checked='true'></input> <label style='display:inline' for='couchdb-sync'>CouchDB Sync (recommended)</label> </div> <div> <input id='http-post' name='config-sync-mode' type='radio' value='http-post'></input> <label style='display:inline' for='http-post'>HTTP Post</label> </div> <br/> <div style='display:none' id='http-post-target'> <label>HTTP Post Target</label> <input name='config-http-post-target' type='text' value='http://192.168.1.1/coconut.php'></input> </div> </div> <label>Completion Mode</label> <div> <input id='complete-on-send' name='completion-mode' type='radio' value='on-send' checked='true'></input> <label style='display:inline' for='complete-on-send'>When result is successfully sent</label> </div> <div> <input id='complete-on-check' name='completion-mode' type='radio' value='on-check'></input> <label style='display:inline' for='complete-on-check'>When the user marks complete (forms must include complete checkbox)</label> </div> <br/> TODO: <ul> <li>Select form to form workflow option (coconut needs UI for selecting which values copy over)</li> <li>Allow filtered push of results (pre-populate forms based on who is logged in)</li> </ul> <button id='create' type='button'>Create</button> <div id='message'> </div>");
  };

  return DefaultView;

})(Backbone.View);

cloudCouchUsername = prompt("Enter username");

cloudCouchPassword = prompt("Enter password");

$.couch.login({
  name: cloudCouchUsername,
  password: cloudCouchPassword
});

Coconut = {};

Coconut.router = new Router();

Coconut.router.startApp();

Coconut.debug = function(string) {
  console.log(string);
  return $("#message").append(string + "<br/>");
};

//# sourceMappingURL=app.js.map
