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

# Expose backend port
EXPOSE 3000

# Run migrations, seed, and start the app
CMD ["sh", "-c", "pnpm run db:migrate && pnpm run db:seed && pnpm start"]
