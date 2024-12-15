# Build stage
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY packages/server/package.json ./


# Copy rest of the files
COPY . ./
RUN bun install
# Build the binary
RUN bun build packages/server/src/index.ts --compile --outfile swm

# Final stage
FROM debian:bookworm-slim

WORKDIR /app

# Copy only the compiled binary
COPY --from=builder /app/swm ./swm

# Run the binary
CMD ["./swm"]