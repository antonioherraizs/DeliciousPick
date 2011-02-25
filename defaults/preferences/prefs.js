// Manually delete preferences from about:config by editing prefs.js in the user profile dir.
// Try to provide defaults for all preferences
// https://developer.mozilla.org/en/Code_snippets/Preferences#Using_preferences_in_extensions

// login preferences
pref("extensions.deliciouspick.usePasswordManager", false);
pref("extensions.deliciouspick.deliciousUsername", "");
pref("extensions.deliciouspick.clearPassword", false);

// https://developer.mozilla.org/en/Localizing_extension_descriptions
pref("extensions.deliciouspick@toniaddons.com.description", "chrome://deliciouspick/locale/overlay.properties");
