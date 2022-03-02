BP Log was created out of the need of my mum to log her daily blood pressure on her smartphone.  I had fed up with the currently available apps with "advanced" fancy features bombarded with ads.  All we need is just a simple log which store all blood pressure records on the phone, with the option to output the data via email.  In short, an app never compromises the privacy and security. 

Localised Languages
The app currently supports English, French, Spanish, Traditional Chinese and Simplified Chinese.  All of the localisation work is done by me alone.  Some of the translations may not be accurate in the perspective of native speakers.  You are more than welcome to suggest any improvements on the languages.

Expo managed workflow
To simplify the maintenance process, I choose to apply expo over react-native and let expo to manage the building process.  This allows me to focus more time on the matters of user experience rather than dealing with tangled messy npm packages.  One shortcoming is that the compiled app tends to be bigger in size (around 30 MB, compared with native apps of similar category with just a few MB).

Android App Keystore and Apple APNS 
The managed workflow handles the Android Keystore and Apple APNS automatically and saves them in the Expo server.  The keys will be used when we request Expo server to build app for us.

Expo release channel

v1.0.0 (Android version code 3) - default (expo 41)

v1.0.1 (Android version code 4) - prod-v1 (expo 42), api version 21+, target sdk 30, min ios version 11.0

v1.1.0 (Android version code 5) - prod-v2 (expo 43, up to the version of "height of the modal has been fine-tuned", not to be released, testflight/closed release only), api version 21+, target sdk 30, min ios version 12.0

v1.1.1 (Android version code 6) - prod-v3 internal testing only

v1.1.2 (Android version code 7) - prod-v4 released in mid-Dec 2021

v1.1.3 (Android version code 8) - prod-v5 hiding the suggestion button, released at 1 Jan 2022

v1.1.4 (Android version code 9) - prod-v6 fixing bugs when user type commas on remark and exporting to csv, not published not released

expo publish --release-channel prod-v5