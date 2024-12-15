# Build stage
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies for the entire workspace
RUN bun install

# Build the server package
WORKDIR /app/packages/server
RUN bun build src/index.ts --compile --outfile swm

# Final stage
FROM debian:bookworm-slim

WORKDIR /app

# Copy only the compiled binary
COPY --from=builder /app/packages/server/swm ./swm

# Expose the port from an environment variable
ENV PORT=$SERVER_PORT
EXPOSE $PORT

# Run the binary
CMD ["./swm"]