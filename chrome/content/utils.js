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
 *	utils.js: Add-on independent utility functions.
 */

if(!com) var com={};
if(!com.toniaddons) com.toniaddons={};
com.toniaddons.utils = {

  // set this variable to false to avoid logging Console Messages
  loggingIsActive: false,
  
  // retrieve pass from Firefox's Login Manager
  getFirefoxPass: function(forUsername, restrictSearchURL, protocolHTTPRealm) {
    var storedPassword;
    var passwordManager = Components.classes["@mozilla.org/login-manager;1"]
      .getService(Components.interfaces.nsILoginManager);
    var logins = passwordManager.findLogins({}, restrictSearchURL, null, protocolHTTPRealm);

    // loop through logins until we find the one for our username
    for (var i = 0; i < logins.length; i++) {
      if (logins[i].username == forUsername) {
        com.toniaddons.utils.log('getFirefoxPass(): Going through logins: logins[' + i + ']' + 'got: ' + logins[i].username);
        storedPassword = logins[i].password;
      }
    }
    if (storedPassword) {
      storedPassword = decodeURIComponent(storedPassword);
    }
    return storedPassword;
  },
  
  // save or remove login info in Firefox
  setFirefoxPass: function(forUsername, withPassword, saveIt, restrictSearchURL, protocolHTTPRealm) {
    var passwordManager = Components.classes["@mozilla.org/login-manager;1"]
      .getService(Components.interfaces.nsILoginManager);
      
    if (saveIt) {
      var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", 
        Components.interfaces.nsILoginInfo, "init");
      var newLogin = new nsLoginInfo(restrictSearchURL, null, protocolHTTPRealm, forUsername, withPassword, "", "");

      try {
        passwordManager.addLogin(newLogin);
        com.toniaddons.utils.log('setFirefoxPass(): just saved [' + forUsername + '/' + withPassword + ']');
      } catch (e) {}
    } else {
      var formSubmitURL = null;
      var logins;

      try {
        // Remove login info
        logins = passwordManager.findLogins({}, restrictSearchURL, formSubmitURL, protocolHTTPRealm);
        com.toniaddons.utils.log('setFirefoxPass(): just removed login info for ' + forUsername);

        for (var i = 0; i < logins.length; i++) {
          if (logins[i].username == forUsername) {
            try {
              passwordManager.removeLogin(logins[i]);
            } catch (e) {}
            break;
          }
        }
      } catch (e) {}
    }
  },
  
  // process a XML response, retrieving the attribute 'attributeTag' from element 'elementTag'
  getAttributeFromElement: function(responseXML, elementTag, attributeTag) {
    var resultAttrib = null;
    var result = responseXML.getElementsByTagName(elementTag).item(0);
    if (result != null && result.hasAttribute(attributeTag)) {
      resultAttrib = result.getAttribute(attributeTag);
    }
    return resultAttrib;
  },
  
  // open link in current tab
  openLinkInCurrentTab: function(link) {
    window.content.document.location.href = link;
  },
  
  // open a new tab and go to 'link'
  openLinkInNewTab: function(link) {
    const windowMediatorIID = Components.interfaces.nsIWindowMediator;
    const windowMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
      .getService(windowMediatorIID);
    const topWin = windowMediator.getMostRecentWindow("navigator:browser");
    topWin.getBrowser().selectedTab = topWin.getBrowser().addTab(link);
  },
  
  // bring up an alert-like box using the prompt service
  alertEx: function(aTitle, aMessage) {
    var prmpt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
      .getService(Components.interfaces.nsIPromptService);
    prmpt.alert(window, aTitle, aMessage);
  },
  
  // get random number between m and n
  randomXToY: function(minVal,maxVal) {
    var randVal = minVal+(Math.random()*(maxVal-minVal));
    return Math.round(randVal);
  },
  
  // log aText to the console
  log: function(aText) {
    if (this.loggingIsActive == true) {
      var console = Components.classes["@mozilla.org/consoleservice;1"]
          .getService(Components.interfaces.nsIConsoleService);
      console.logStringMessage(aText);
    } else {
      // do nothing
    }
  },  
  
  /* The following function takes as its arguments an object and the 
     object's diplay name. It then iterates over all the object's properties 
     and returns a string that lists the property names and their values. */
  showObjProperties: function(obj, objName) {
    var result = "";
    for (var i in obj) {
      result += objName + "." + i + " = " + obj[i] + "\n";
    }
    com.toniaddons.utils.log('showObjProperties: ' + result);
  },
};