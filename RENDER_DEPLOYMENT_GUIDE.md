# Deploying Multi Blockchain Wallet Balance Service to Render

This guide provides step-by-step instructions for deploying the Multi Blockchain Wallet Balance Service to Render using Docker.

## Prerequisites

1. A Render account (https://render.com)
2. A GitHub repository with your Multi Blockchain Wallet Balance Service code
3. API keys for the blockchain networks you want to use

## Deployment Steps

### 1. Push Your Code to GitHub

First, push your code to a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/blockchain-wallet-balance-service.git
git push -u origin main
```

### 2. Create a New Web Service on Render

1. Log in to your Render account
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository
4. Select the repository with your Multi Blockchain Wallet Balance Service code

### 3. Configure the Web Service

1. **Name**: Enter a name for your service (e.g., "multi-blockchain-wallet-balance-service")
2. **Environment**: Select "Docker"
3. **Docker Command**: Leave this blank to use the CMD in your Dockerfile
4. **Branch**: Select the branch you want to deploy (e.g., "main")
5. **Root Directory**: Enter the path to your backend directory (e.g., "./backend")

### 4. Configure Environment Variables

Add the following environment variables:

- `PORT`: 3005
- `ETHERSCAN_API_KEY`: Your Etherscan API key
- `ARBISCAN_API_KEY`: Your Arbiscan API key
- `POLYSCAN_API_KEY`: Your Polygonscan API key
- `BSCSCAN_API_KEY`: Your BSCscan API key
- `FANTOM_API_KEY`: Your Fantom API key
- `OPTIMISM_API_KEY`: Your Optimism API key
- `BASE_API_KEY`: Your Base API key
- `CARDANO_API_KEY`: Your Cardano API key
- `STACKS_API_KEY`: Your Stacks API key

### 5. Configure Advanced Settings

1. **Health Check Path**: /
2. **Auto-Deploy**: Enable if you want automatic deployments when you push to your repository

### 6. Deploy the Service

Click on "Create Web Service" to deploy your service. Render will build and deploy your Docker image.

### 7. Access Your Service

Once the deployment is complete, you can access your service at the URL provided by Render:

```
https://your-service-name.onrender.com
```

## Using render.yaml for Deployment

Alternatively, you can use the provided `render.yaml` file for deployment:

1. Push your code to GitHub, including the `render.yaml` file
2. Go to the Render Dashboard
3. Click on "Blueprint" in the navigation
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file and create the services defined in it
6. Configure the environment variables for your API keys
7. Deploy the services

## Dockerfile Explanation

The Dockerfile used for deployment is configured as follows:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Change port to 3005 to match multi-blockchain-server.js
EXPOSE 3005

# Use multi-blockchain-server.js instead of npm run dev
CMD ["node", "multi-blockchain-server.js"]
```

This Dockerfile:
1. Uses Node.js 18 Alpine as the base image
2. Sets the working directory to /app
3. Copies package.json and package-lock.json
4. Installs dependencies
5. Copies the rest of the application
6. Exposes port 3005
7. Runs the multi-blockchain-server.js file

## Troubleshooting

### CORS Issues

If you encounter CORS issues when accessing your API from a frontend application, ensure that your CORS configuration in `multi-blockchain-server.js` is properly set up:

```javascript
app.use(cors({
  origin: '*', // Allow all origins or specify your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow credentials
}));
```

For production, you may want to restrict the `origin` to specific domains instead of using `'*'`.

### API Rate Limiting

Many blockchain APIs have rate limits. If you encounter rate limiting issues, consider:

1. Implementing caching for responses
2. Adding retry logic with exponential backoff
3. Using multiple API keys and rotating between them

### Memory Issues

If your service is running out of memory, you can:

1. Increase the memory allocation for your Render service
2. Optimize your code to reduce memory usage
3. Implement pagination for large responses

## Conclusion

Your Multi Blockchain Wallet Balance Service should now be deployed to Render and accessible via the provided URL. You can use this service to fetch wallet balances from 40+ blockchain networks using real API calls.
