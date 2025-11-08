# Stage 1: Build dependencies
# Use an official Node.js runtime that is compatible with your dependencies.
# The @google/genai package requires Node.js >= 20.0.0.
FROM node:20-alpine AS deps

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies.
# This leverages Docker's layer caching.
COPY package.json package-lock.json ./
# Install production dependencies only.
RUN npm install --omit=dev

# Stage 2: Production image
# Copy installed dependencies from the 'deps' stage.
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of your application's source code.
COPY . .

# The serve package automatically listens on the port specified by
# the PORT environment variable, which Cloud Run provides.
# This is good practice for documentation.
EXPOSE 8080

# The command to start the application.
# This will run the "start": "serve -s ." script from your package.json.
CMD ["npm", "start"]