#!/bin/bash

# Inputs
VERSION=$1

# Change to server directory
cd packages/server

# Build the server binary
bun install
bun build --compile src/index.ts --target=bun-linux-x64 --outfile=swm

# Create GitHub release
gh release create server-v$VERSION \
  swm \
  --title "Server v$VERSION" \
  --notes "Major version release of the server package"