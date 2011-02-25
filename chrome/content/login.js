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
 *	login.js: handle Login dialog logic.
 */
 
if(!com) var com={};
if(!com.toniaddons) com.toniaddons={};
if(!com.toniaddons.deliciouspick) com.toniaddons.deliciouspick={};
com.toniaddons.deliciouspick.login = {

  initLoginDialog: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("deliciouspick-strings");
    
    com.toniaddons.utils.log('initLoginDialog: start, window.arguments.length = ' + window.arguments.length);
    
    // Use the arguments passed to us by the caller
    document.getElementById("deliciouspick-login-dialog-username").value = window.arguments[0].inn.username;
    document.getElementById("deliciouspick-login-dialog-password").value = window.arguments[0].inn.password;
    document.getElementById("deliciouspick-login-dialog-use_password_manager").checked = window.arguments[0].inn.useManager;
  },
  
  loginDialogAccept: function() {
    // when user clicks accept from Login dialog
    
    // Return the changed arguments.
    // Notice if user clicks cancel, window.arguments[0].out remains null
    // because this function is never called
    window.arguments[0].out = {username:document.getElementById("deliciouspick-login-dialog-username").value,
      password:document.getElementById("deliciouspick-login-dialog-password").value,    
      useManager:document.getElementById("deliciouspick-login-dialog-use_password_manager").checked};
      
    // validate input. dialog stays up until we return true from here
    var validInput = false;
    if (window.arguments[0].out.username.length > 0 &&
        window.arguments[0].out.password.length > 0) {
      validInput = true;
      com.toniaddons.utils.log('Login dialog input is valid');
    } else {
      com.toniaddons.utils.log('Login dialog input is invalid');
      com.toniaddons.utils.alertEx(this.strings.getString('appName'), this.strings.getString('supplyLogin'));
    }
    return validInput;
  },
  
  loginDialogCancel: function() {
    // when user clicks cancel from Login dialogArguments
    com.toniaddons.utils.log('cancel clicked');
  },
};