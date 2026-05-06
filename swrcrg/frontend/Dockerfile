FROM node:20-alpine

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose frontend port
EXPOSE 5173

# Start the development server and expose to network
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
