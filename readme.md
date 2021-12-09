BP Log was created out of the need of my mum to log her daily blood pressure on her smartphone.  I had fed up with the currently available apps with "advanced" fancy features bombarded with ads.  All we need is just a simple log which store all blood pressure records on the phone, with the option to output the data via email.  In short, an app never compromises the privacy and security. 

Localised Languages
The app currently supports English, French, Spanish, Traditional Chinese and Simplified Chinese.  All of the localisation work is done by me alone.  Some of the translations may not be accurate in the perspective of native speakers.  You are more than welcome to suggest any improvements on the languages.

Expo managed workflow
To simplify the maintenance process, I choose to apply expo over react-native and let expo to manage the building process.  This allows me to focus more time on the matters of user experience rather than dealing with tangled messy npm packages.  One shortcoming is that the compiled app tends to be bigger in size (around 30 MB, compared with native apps of similar category with just a few MB).

Android App Keystore and Apple APNS 
The managed workflow handles the Android Keystore and Apple APNS automatically and saves them in the Expo server.  The keys will be used when we request Expo server to build app for us.

Expo release channel
v1.0.0 (Android version code 3) - default (expo 41)
v1.0.1 (Android version code 4) - prod-v1 (expo 42)
v1.1.0 (Adnroid version code 5) - prod-v2 (expo 43, up to the version of "height of the modal has been fine-tuned", not to be released, testflight/closed release only)
v1.1.1 (Adnroid version code 6) - prod-v3 (expo 43, not yet released)

expo publish --release-channel prod-v3