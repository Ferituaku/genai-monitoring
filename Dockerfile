FROM node:23-alpine AS node-app

# Set working directory for the Node.js app
WORKDIR /app/node

# Copy package.json and package-lock.json first (better caching)
COPY ./package*.json ./

# Install Node.js dependencies
RUN npm install --omit=dev

# Copy the rest of the application files
COPY . .

# Expose the port your app runs on
EXPOSE 5102

# Command to start the application in development mode
CMD ["npm", "run", "dev"]



FROM python:3.12 AS python-app

# Set working directory for Flask app
WORKDIR /app/python

# Copy and install dependencies
COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Flask app
COPY ./backend /app/python/backend
COPY ./database /app/python/database
COPY ./app.py /app/python
COPY ./lib /app/python/lib

# Expose Flask app port
EXPOSE 5101

# Command to run Flask app
CMD ["python", "/app/python/app.py", "--host=0.0.0.0", "--port=5101"]
