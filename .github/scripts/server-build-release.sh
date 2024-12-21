#!/bin/bash

# Inputs
VERSION=$1


# Build the server binary
bun install

bun NODE_ENV=$2 build packages/server/src/index.ts --compile --minify --sourcemap --bytecode --target=bun-linux-x64 --outfile=swm-${VERSION}

bun NODE_ENV=$2 build packages/server/src/index.ts --compile --minify --sourcemap --bytecode --target=bun-windows-x64-modern --outfile=swm-win-${VERSION}
