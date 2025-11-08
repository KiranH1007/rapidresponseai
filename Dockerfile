# Stage 1: Use a base Node image to install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production

# Stage 2: Final image - Copy dependencies and app code
FROM node:20-alpine
WORKDIR /app

# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all your application source files
COPY . .

# Expose the port the app will run on (serve defaults to 3000)
EXPOSE 3000

# The command to run when the container starts
# This will serve all files in the current directory
CMD [ "npx", "serve", "-s", ".", "-l", "3000" ]