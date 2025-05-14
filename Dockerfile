FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Change port to 3005 to match multi-blockchain-server.js
EXPOSE 3005

# Use multi-blockchain-server.js instead of npm run dev
CMD ["node", "multi-blockchain-server.js"]
