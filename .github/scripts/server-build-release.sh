#!/bin/bash

# Inputs
VERSION=$1


# Build the server binary
bun install

bun build packages/server/src/index.ts --compile --minify --sourcemap --bytecode --target=bun-linux-x64-modern --outfile=swm-${VERSION}

