#!/bin/bash

flavor="$1"

if [[ "$flavor" == "residentapp" ]]; then
  echo "CLIENT_ID=INJI_GOOGLE_CLIENT_ID" >> $GITHUB_OUTPUT
elif [[ "$flavor" == "collab" ]]; then
  echo "CLIENT_ID=COLLAB_ORG_KEY" >> $GITHUB_OUTPUT
elif [[ "$flavor" == "synergy" ]]; then
  echo "CLIENT_ID=SYNERGY_ORG_KEY" >> $GITHUB_OUTPUT
elif [[ "$flavor" == "inji" ]]; then
  echo "CLIENT_ID=INJI_ORG_KEY" >> $GITHUB_OUTPUT
elif [[ "$flavor" == "mec" ]]; then
  echo "CLIENT_ID=MEC_ORG_KEY" >> $GITHUB_OUTPUT
elif [[ "$flavor" == "ph4h" ]]; then
  echo "CLIENT_ID=PH4H_ORG_KEY" >> $GITHUB_OUTPUT
else
  echo "Error: Invalid flavor '$flavor'"
  exit 1
fi