# Deploying CodeXDiagram to Vercel

This document outlines the steps to deploy the CodeXDiagram application to Vercel.

## Prerequisites

- A Vercel account (https://vercel.com/signup)
- Your CodeXDiagram repository on GitHub
- Google API key for the Gemini API

## Deployment Steps

### 1. Deploy the Server (API)

1. Log in to your Vercel account
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure the project:
   - Set the root directory to `server`
   - Framework preset: Other
   - Build command: Leave empty (uses Vercel defaults)
   - Output directory: Leave empty
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `GOOGLE_API_KEY`: Your Google Gemini API key
   - `CLIENT_URL`: URL of your client app (once deployed)
6. Click "Deploy"
7. Note the URL of your deployed API (e.g., `https://codexdiagram-server.vercel.app`)

### 2. Deploy the Client (Frontend)

1. In Vercel, click "Add New" → "Project" again
2. Import the same GitHub repository
3. Configure the project:
   - Set the root directory to `client`
   - Framework preset: Create React App
   - Build command: `npm run build` (or leave default)
   - Output directory: `build` (or leave default)
4. Add environment variables:
   - `REACT_APP_API_URL`: The URL of your deployed server from step 1
5. Click "Deploy"

### 3. Update CORS Configuration (if needed)

After deploying both applications, you might need to update the CORS configuration on your server:

1. Go to your server project in Vercel
2. Go to "Settings" → "Environment Variables"
3. Add/update `CLIENT_URL` to match your client's deployed URL

## Testing the Deployment

1. Open your deployed client application
2. Try generating a flowchart using both Normal and AI modes
3. Ensure the requests are correctly sent to your API and results are displayed

## Troubleshooting

- If you encounter CORS errors, verify that your server's CORS configuration includes the correct client URL
- Check Vercel logs for both deployments if you encounter issues
- Ensure your Google API key is valid and has access to the Gemini API

## Continuous Deployment

Vercel automatically redeploys your application when you push changes to your repository. Make sure to:

1. Test changes locally before pushing
2. Check build logs in Vercel after deployment
3. Verify functionality after each deployment 