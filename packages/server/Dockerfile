# Build stage
FROM oven/bun:debian AS builder

WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies for the entire workspace
RUN bun install

# Build the server package
WORKDIR /app/packages/server
ARG SERVER_PORT

ENV PORT=$SERVER_PORT

RUN bun build src/index.ts --compile --outfile swm

# Final stage
FROM debian:bookworm-slim

WORKDIR /app

# Copy only the compiled binary
COPY --from=builder /app/packages/server/swm ./swm

# Ensure the binary is executable
RUN chmod +x ./swm

# Expose a default port for documentation purposes (optional)
# EXPOSE 4324

# The PORT can be dynamically passed at runtime using `-e`
CMD ["./swm"]
