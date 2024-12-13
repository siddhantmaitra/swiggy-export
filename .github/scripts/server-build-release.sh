#!/bin/bash

# Inputs
VERSION=$1

# Change to server directory
cd packages/server

# Build the server binary
bun install
# bun build --compile src/index.ts --target=bun-linux-x64 --outfile=swm
bun build src/index.ts --compile --minify --sourcemap --bytecode --target=bun-linux-x64 --outfile=swm
cd ../.. 
ls -alR 
# Create GitHub release
gh release create server-v$VERSION \
  swm \
  --title "Server v$VERSION" : CI test Release \
  --notes "Testing CI release of the server package. Please Ignore"