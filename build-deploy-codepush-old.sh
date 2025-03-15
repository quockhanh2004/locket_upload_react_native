#!/bin/bash
read -p 'Enter target binary version (e.g., 1.6.0): ' TARGET_VERSION
read -p 'Enter decription for this version ($TARGET_VERSION): ' DECRYPTION
appcenter codepush release-react -a quockhanh2004/Locket-Upload -d Production --target-binary-version $TARGET_VERSION --mandatory true --description "$DECRYPTION"
#appcenter codepush release-react -a quockhanh2004/Locket-Upload-1 -d Production --target-binary-version 1.0.0 --mandatory true --description "$DECRYPTION"