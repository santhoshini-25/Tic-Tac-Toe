# STEP 1: Build the TypeScript code
FROM node:20-alpine AS builder

# 1. Install system dependencies
RUN apk add --no-cache git

WORKDIR /backend

# 2. Copy dependency files and install them
COPY package*.json ./
RUN npm install

# 3. Copy the actual source code
COPY . .

# 4. Compile the code (Using the project's installed typescript)
RUN npx tsc --module ESNext --target ESNext

# STEP 2: Run Nakama
FROM heroiclabs/nakama:3.21.1

# Copy the compiled files into the modules folder
COPY --from=builder /backend/build/*.js /nakama/data/modules/