#!/bin/bash

# Change to the server directory
cd packages/server

# Get the current version from package.json
current_version=$(jq -r '.version' package.json)

# Get the previous version from git tags specific to the server
previous_version=$(git tag --sort=-v:refname | grep '^server-v' | head -n 1 | sed 's/server-v//')

# Extract major versions
current_major=$(echo $current_version | cut -d. -f1)
previous_major=$(echo $previous_version | cut -d. -f1)

echo "true"
echo "$current_version"
echo $PWD
cd ../..
# # Check if major version has changed
# if [ "$current_major" != "$previous_major" ]; then
#   echo "true"
#   echo "$current_version"
# else
#   echo "false"
# fi