class Router extends Backbone.Router
  routes:
    "": "default"

  default: ->
    (Coconut.defaultView ?= new DefaultView()).render()

  startApp: ->
    Backbone.history.start()


class DefaultView extends Backbone.View
  el: '#content'

  events:
    "click #create": "create"
    "keyup [name='config-title']": "updateDatabaseName"
    "change [name='config-sync-mode']": "toggleHTTPPost"

  toggleHTTPPost: ->
    $("#http-post-target").toggle($("[name='config-sync-mode']:checked").val() is "http-post")
    
  updateDatabaseName: ->
    if $("[name=database-name]").val()?
      $("[name=database-name]").val $("[name=config-title]").val().toLowerCase().replace(/\s/g,"-").replace(/[^A-Za-z\-]/g,"")

  create: =>
    name = $("[name=database-name]").val()
    $.couch.db(name).create
      success: =>
        @replicateCoconutCoreDatabase
          target: name
          success: =>
            @putConfig
              success: =>
                @putLocalConfig
                  success: =>
                    @putAdminUser
                      success: =>

      error: (error,response, message) ->
        message = "Error: '#{message}' while creating database '#{name}'"
        $("#message").html message

  replicateCoconutCoreDatabase:(options)  ->
    target = options.target
    @replicateDesignDoc
      target: target
      success: ->
        $("#message").html "
          Successfully created #{target}. <br/>
          <a href='/#{target}/_design/coconut/index.html'>Configure Coconut: #{target}</a>
        "
        options.success?()
      error: (error) ->
        message = "Error: '#{error} ' while copying application data to #{name}"
        $("#message").html message
        console.log message
        console.log error
        options.error?()

  putLocalConfig: (options) =>
    @putDocument _.extend options,
      document:
        "_id": "coconut.config.local"
        "mode": "cloud"

  putConfig: (options) =>
    @putDocument _.extend options,
      document:
        "_id": "coconut.config"
        "title": $("[name=config-title]").val()
        "cloud": "http://#{document.location.host}"
        "cloud_database_name": $("[name=database-name]").val()
        "local_couchdb_admin_username": $("[name=admin-username]").val()
        "local_couchdb_admin_password": $("[name=admin-password]").val()
        "cloud_credentials": "#{$("[name=admin-username]").val()}:#{$("[name=admin-password]").val()}"
        "date_format": "YYYY-MM-DD HH:mm:ss"
        "sync_mode": $('[name=config-sync-mode]:checked').val()
        "http-post-target": $("[name=config-http-post-target]").val() if $('[name=config-sync-mode]:checked').val() is "http-post"
        "completion_mode": $('[name=completion-mode]:checked').val()
        "isApplicationDoc": true

  putAdminUser: (options) =>
    @putDocument _.extend options,
      document:
        "_id": "user.admin"
        "collection": "user"
        "username": $("[name=admin-username]").val()
        "password": $("[name=admin-password]").val()

  putDocument: (options) =>
    $.couch.db($("[name=database-name]").val()).saveDoc options.document,
      success: =>
        options.success()
      error: ->
        message = "Error: '#{error}' while creating document #{JSON.stringify(document)}"
        $("#message").html message
        console.log message
        console.log error

  replicate: (options) ->
    $.couch.replicate(
      "coconut-factory",
      options.target,
        success: ->
          options.success()
        error: ->
          options.error()
      ,
        options.replicationArguments
    )

  replicateDesignDoc: (options) =>
    @replicate _.extend options,
      replicationArguments:
        doc_ids: ["_design/coconut"]

  render: ->
    @$el.html "
      <style>
        body{
          background-color:lightblue;
          font-family: sans-serif;
          font-size: 20pt;
          color: #95634e;
        }
        label{
          display:block;
          margin-top: 20px;
          color: #95634e;
        }
        h1{
          text-align:center;
          color: #95634e;
          font-size: 60pt;
        }
        input{
          height: 50px;
          width: 350px;
          font-size: 20pt;
          font-family: sans-serif;
          background: #ffe88c;
          color: #578729;
        }
        button{
          margin-top: 20px;
          display: block;
          background: #578729;
          color: #ffe88c;
          font-size: 50pt;
          font-family: sans-serif;
        }

        [type=radio]{
          width: 10px;
        }
      </style>
      <div style='position:fixed; right:50px; top:00px;'>
        <h1>Coconut<br/>
        Factory</h1>
        <img src='palm-tree-icon.png'/>
      </div>
      <label>Name of Coconut Application</label>
      <input name='config-title' type='text'></input>
      <!--
      <label>Date Format</label>
      <input name='config-date_format' type='text' value='YYYY-MM-DD HH:mm:ss'></input>
      -->
      <label>Admin username</label>
      <input name='admin-username' type='text' value='admin'></input>
      <label>Admin password</label>
      <input name='admin-password' type='text' value='admin'></input>
      <label>Name of database</label>
      <input name='database-name' type='text'></input>
      <!-- Made this for the Philippines - not really necessary -->
      <div style='display:none'>
        <label>Send Mode</label>
          <div>
            <input id='couchdb-sync' name='config-sync-mode' type='radio' value='couchdb-sync' checked='true'></input>
            <label style='display:inline' for='couchdb-sync'>CouchDB Sync (recommended)</label>
          </div>
          <div>
            <input id='http-post' name='config-sync-mode' type='radio' value='http-post'></input>
            <label style='display:inline' for='http-post'>HTTP Post</label>
          </div>
        <br/>
        <div style='display:none' id='http-post-target'>
          <label>HTTP Post Target</label>
          <input name='config-http-post-target' type='text' value='http://192.168.1.1/coconut.php'></input>
        </div>
      </div>
      <label>Completion Mode</label>
        <div>
          <input id='complete-on-send' name='completion-mode' type='radio' value='on-send' checked='true'></input>
          <label style='display:inline' for='complete-on-send'>When result is successfully sent</label>
        </div>
        <div>
          <input id='complete-on-check' name='completion-mode' type='radio' value='on-check'></input>
          <label style='display:inline' for='complete-on-check'>When the user marks complete (forms must include complete checkbox)</label>
        </div>
      <br/>
      TODO:
      <ul>
      <li>Select form to form workflow option (coconut needs UI for selecting which values copy over)</li>
      <li>Allow filtered push of results (pre-populate forms based on who is logged in)</li>
      </ul>
      <button id='create' type='button'>Create</button>
      <div id='message'>
      </div>
    "

$.couch.login
  name: prompt "Enter username"
  password: prompt "Enter password"

Coconut = {}
Coconut.router = new Router()
Coconut.router.startApp()

Coconut.debug = (string) ->
  console.log string
  $("#message").append string + "<br/>"
