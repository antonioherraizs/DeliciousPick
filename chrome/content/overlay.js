/**
 * Delicious Pick 
 * by Antonio Herraiz - http://www.toniblogs.com/firefox-add-ons/
 *
 * Based on Delicious Post 1.1
 * by AE Creations - http://aecreations.mozdev.org
 *
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 *
 * You are free to share and remix this work as long as you attribute the author and distribute
 * the resulting work only under the same or similar license to this one.
 *
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/
 *
 * date: Feb 2011
 * description:
 *	overlay.js: Main module. When add-on's main function onMenuItemCommand() is called,
 *              user's Delicious credentials are retrieved and used to call Delicious' API
 *              to get a random post.
 *   Note: In Delicious, a Bookmark's info is known within the API as a "post"
 */

/** 
 * Respect javascript's global namespace declaring/using objects "com.toniaddons.*"
 *
 * http://blogger.ziesemer.com/2008/05/javascript-namespace-function.html
 * -> Newer but gives me a warning "reference to undefined property g[e[d]]"
 * http://blogger.ziesemer.com/2007/10/respecting-javascript-global-namespace.html
 * -> Older, works fine, no warnings. Stick to this.
 */
if(!com) var com={};
if(!com.toniaddons) com.toniaddons={};
com.toniaddons.deliciouspick = {

  haveNumTotalLinks: false,
  totalLinks: 0,
  
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("deliciouspick-strings");
    
    com.toniaddons.utils.log('deliciouspick is ready!');
  },

  onMenuItemCommand: function(e) {

    const deliciouspickSearchURL = "chrome://deliciouspick/";
    const deliciouspickHTTPRealm = "Delicious Pick";
    
    var prefs = null;
    var delicUsername = "";
    var delicPassword = "";
    var delicUseManager = false;
    
    /* Let's get the user's Delicious username and password:
       Working with preferences: https://developer.mozilla.org/en/Code_snippets/Preferences
       - All of our preferences have default values set, so no need to use prefHasUserValue()
       
       1. get username, might be "" (default)
       2. Check if 'Remove password' was selected in preferences. If so, remove it and reset preference
       3. IF we have "Use Password Manager" enabled, retrieve password from Firefox Pass Manager
          ELSE bring up login dialog passing the retrieved username
       4. store preferences: username - always. password - only if user enabled "Use Password Manager" */

    prefs = Components.classes["@mozilla.org/preferences-service;1"]
      .getService(Components.interfaces.nsIPrefService)
      .getBranch("extensions.deliciouspick."); // get only extensions.deliciouspick.*
    
    // get username
    delicUsername = prefs.getCharPref("deliciousUsername");
    com.toniaddons.utils.log('pref deliciousUsername = ' + delicUsername);
    
    // if 'Remove password from Password Manager' was selected in preferences
    if (prefs.getBoolPref("clearPassword") == true) {
      prefs.setBoolPref("clearPassword", false);
      prefs.setBoolPref("usePasswordManager", false);
      var savePassword = false;
      com.toniaddons.utils.setFirefoxPass(
          delicUsername, "", savePassword, 
          deliciouspickSearchURL, deliciouspickHTTPRealm);
    }
    
    var canIRunAPI = true;
    if (prefs.getBoolPref("usePasswordManager") == true) {
      // get stored password
      delicPassword = com.toniaddons.utils.getFirefoxPass(
          delicUsername, deliciouspickSearchURL, deliciouspickHTTPRealm);
      com.toniaddons.utils.log('pref deliciousPassword = ' + delicPassword);
      
    } else {
      // display login dialog, process response
      var dialogResult = null;
      dialogResult = this.openLoginPanel(delicUsername);
      if (dialogResult == null) {
        com.toniaddons.utils.log('user pressed cancel on login dialog, let\'s exit');
        canIRunAPI = false;
      } else {
        com.toniaddons.utils.log('username: ' + dialogResult.username 
        + ', password: ' + dialogResult.password 
        + ', useManager: ' + dialogResult.useManager);
        
        delicUsername = dialogResult.username;
        delicPassword = dialogResult.password;
        delicUseManager = dialogResult.useManager;
      }
    }
    
    // Done retreving username & pass. Now do something with them.
    
    if (canIRunAPI == true) {
      // store preferences for next time
      prefs.setCharPref("deliciousUsername", delicUsername);
      if (delicUseManager == true) {
        prefs.setBoolPref("usePasswordManager", delicUseManager);
        var savePassword = true;
        com.toniaddons.utils.setFirefoxPass(
            delicUsername, delicPassword, savePassword, 
            deliciouspickSearchURL, deliciouspickHTTPRealm);
      }
        
      // At this point we have a user/pass combination to use, it might be invalid
      // as we haven't tested it with the API but we have to give it a try.
      
      com.toniaddons.utils.log('We have user/pass, ' + delicUsername + '/' + delicPassword + ', let\'s use it!');
      this.deliciousAPIGetPost(delicUsername, delicPassword);
    }
    
    // Messages from callback functions may appear after this line is shown in the Messages Console
    com.toniaddons.utils.log('End of deliciouspick');
  },
  
  deliciousAPIGetPost: function(deliciousUsername, deliciousPassword) {
    const DELICIOUS_API_MAX_RESULTS = 1;
    const DELICIOUS_API_URL = "https://api.del.icio.us/v1/";

    var startOffsetAt = 0;
    if (this.totalLinks > 0) {
      // we now know the total number of links
      startOffsetAt = com.toniaddons.utils.randomXToY(0, this.totalLinks);
    }
    
    com.toniaddons.utils.log(
      'this.haveNumTotalLinks: ' + this.haveNumTotalLinks +
      ', this.totalLinks: ' + this.totalLinks + 
      ', startOffsetAt: ' + startOffsetAt);
    
    var maxResults = DELICIOUS_API_MAX_RESULTS;
    var queryString = DELICIOUS_API_URL
      + 'posts/all?results=' + encodeURIComponent(maxResults) 
      + '&start=' + encodeURIComponent(startOffsetAt);
      
    com.toniaddons.utils.log('QUERY: ' + queryString);
    com.toniaddons.utils.log('USERNAME: ' + deliciousUsername + ', PASSWORD: ' + deliciousPassword);
    
    // make a new asynchronous request every time
    // https://developer.mozilla.org/en/XMLHttpRequest
    // https://developer.mozilla.org/en/using_xmlhttprequest
    
    var req = new XMLHttpRequest();
    req.mozBackgroundRequest = true; // prevents security dialogs from being shown to the user
    req.open('GET', queryString, true, deliciousUsername, deliciousPassword);
    req.onreadystatechange = infoReceived; // define callback function
    req.send(null);    

    // callback for XMLHttpRequest
    function infoReceived() {
    
      // Because we may be called as a callback, we can't rely on
      // "this" referring to the right object, so we need to reference
      // it by its full name here.
      var that = com.toniaddons.deliciouspick;
      
      var errorMsg = "";
      if (req.readyState == 4) { // the operation is complete
        try {
          switch (req.status) {
            case 200: // ready and response is OK, process
            
              /* Part of the responses we are interested in:
                   <posts user="delicious" update="2011-02-05T22:58:12Z" tag="" total="152" count="1" start="0">
                   <post href="http://ngrams.googlelabs.com/" hash="a5d539ffe[...]b775ac" description="[...] */

              if (that.haveNumTotalLinks == false) {
                // extract number of links the user has and remember it
                that.totalLinks = com.toniaddons.utils.getAttributeFromElement(req.responseXML, 'posts', 'total');
                com.toniaddons.utils.log('Retrieved: totalLinks = ' + that.totalLinks);
                that.deliciousAPIGetPost(deliciousUsername, deliciousPassword);

                // avoid entering here again
                that.haveNumTotalLinks = true; 
              } else {
              
                // retrieve link from Delicious bookmark
                var httpLink = com.toniaddons.utils.getAttributeFromElement(req.responseXML, 'post', 'href');
                com.toniaddons.utils.log('Retrieved: httpLink = ' + httpLink);
                com.toniaddons.utils.openLinkInCurrentTab(httpLink);
              }
              break;
            case 401:
            case 403:
              com.toniaddons.utils.log('Unathorized');
              errorMsg = that.strings.getString('authenticationfailed');
              break;
            case 503:
              com.toniaddons.utils.log('Throttled');
              errorMsg = that.strings.getString('throttled');
              break;
            default:
              com.toniaddons.utils.log('There was a problem with the request. req.status = ' + req.status);
              errorMsg = that.strings.getString('unexpectedError');
              break;
          }   
        }
        catch (e if e.result == Components.results.NS_ERROR_NOT_AVAILABLE) {
          com.toniaddons.utils.log('Connection error');
          errorMsg = that.strings.getString('connectionError');
        }
        catch (e) {
          com.toniaddons.utils.log('Unexpected error');
          errorMsg = that.strings.getString('unexpectedError');
        } // end try ... catch
      } // end req.readyState == 4
      
      // notify user if any errors happened
      if (errorMsg != "") {
        com.toniaddons.utils.alertEx(that.strings.getString('appName'), errorMsg);
      }
      
    } // end callback infoReceived()
  },
  
  openLoginPanel: function(usernameFromPref) {
    // https://developer.mozilla.org/en/Code_snippets/Dialogs_and_Prompts
    var params = {inn:{username:usernameFromPref, password:"", useManager:false}, out:null};
    var features = "chrome, dialog, centerscreen, modal";
    window.openDialog('chrome://deliciouspick/content/login.xul', '', features, params).focus();

    // params.out will be null if user pressed 'cancel', or it will contain the fields' values if user pressed 'ok'
    // NOTE: if user presses 'ok' with empty values, then accepts the alert and then 'cancel', params.out wil not be null but empty
    var retVal = null;
    if (params.out) {
      if (params.out.username.length > 0 && params.out.password.length > 0) {
        retVal = params.out;
      }
    }
    return retVal;
  },
};

// initalize deliciouspick when window loads
// see https://developer.mozilla.org/en/DOM/element.addEventListener#Memory_issues
window.addEventListener("load", function(){com.toniaddons.deliciouspick.onLoad()}, false);
