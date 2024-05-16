# Use an appropriate base image for your frontend
# For example:
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy necessary files into the container
COPY . .

# Install dependencies and build your frontend
RUN npm install

# Set the entry point or command to run the frontend
CMD [ "node", "src/index.js" ]
