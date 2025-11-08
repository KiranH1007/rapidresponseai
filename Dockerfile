# ---- Builder Stage ----
# This stage builds the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency definition files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
# Using --frozen-lockfile is recommended for CI/CD and Docker builds for reproducibility
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the application (assuming you have a "build" script in package.json)
# This is common for Vite projects: "build": "vite build"
RUN pnpm run build

# ---- Production Stage ----
# This stage creates the final, smaller image
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency definition files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port your application will run on (e.g., 3001)
EXPOSE 3001

# Command to start the application
# This will run "serve -s dist -p 3000" based on our package.json script
# Change from listening on localhost (default) to all interfaces
#CMD [ "serve", "-s", "dist", "-l", "3001" ]
CMD ["pnpm", "start"]