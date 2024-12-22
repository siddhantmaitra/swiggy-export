#!/bin/bash

# Inputs
VERSION=$1
NODE_ENV=$2

# Build the server binary
bun install

echo "FOUND NODE_ENV: ${NODE_ENV}"

bun build packages/server/src/index.ts \
  --define "process.env.NODE_ENV='${NODE_ENV}'" \
  --compile \
  --minify \
  --sourcemap \
  --bytecode \
  --target=bun-linux-x64 \
  --outfile="swm-${VERSION}"

NODE_ENV=$NODE_ENV bun build packages/server/src/index.ts --compile --minify --sourcemap --bytecode --target=bun-windows-x64-modern --outfile=swm-win-${VERSION}
