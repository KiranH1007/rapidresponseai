# Stage 1: Use a base Node image to install dependencies
# Stage 1: Build dependencies
# Use an official Node.js runtime that is compatible with your dependencies.
# The @google/genai package requires Node.js >= 20.0.0.
FROM node:20-alpine AS deps

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies.
# This leverages Docker's layer caching.
COPY package.json package-lock.json ./
RUN npm install --production
RUN npm install --omit=dev

# Stage 2: Final image - Copy dependencies and app code
FROM node:20-alpine
# ---

# Stage 2: Production image
# Use a small, secure base image.
FROM node:20-alpine AS final

# Set the working directory
WORKDIR /app

# Copy dependencies from the 'deps' stage
# Copy installed dependencies from the 'deps' stage.
COPY --from=deps /app/node_modules ./node_modules

# Copy all your application source files
# Copy the rest of your application's source code.
COPY . .

# Expose the port the app will run on (serve defaults to 3000)
EXPOSE 3000
# The serve package automatically listens on the port specified by
# the PORT environment variable, which Cloud Run provides.
# This is good practice for documentation.
EXPOSE 8080

# The command to run when the container starts
# This will serve all files in the current directory
CMD [ "npx", "serve", "-s", "build", "-l", "3000" ]
# The command to start the application.
# This will run the "start": "serve -s ." script from your package.json.
CMD ["npm", "start"]