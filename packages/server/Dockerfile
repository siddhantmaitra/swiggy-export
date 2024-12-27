
ARG NODE_ENV=development
# Build stage
FROM oven/bun:alpine AS builder

WORKDIR /app
# Copy the entire monorepo

COPY . .

RUN bun install

WORKDIR /app/packages/server

ENV NODE_ENV=production

RUN bun build src/index.ts --minify --sourcemap --bytecode --target=bun --outdir=dist
# RUN NODE_ENV=$NODE_ENV bun build src/index.ts --compile --minify --sourcemap --bytecode --target=bun-linux-x64-modern --outfile=swm

# use --target=debug for debug builds
FROM oven/bun:alpine AS debug

WORKDIR /app

COPY --from=builder /app .

CMD [ "sh" ]


# Final runtime stage
FROM oven/bun:alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/packages/server/dist ./dist

ENTRYPOINT [ "bun", "run", "./dist/index.js" ]