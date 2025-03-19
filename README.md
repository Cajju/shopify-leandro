# Shopify App Boilerplate

## Introduction

This is a modern Shopify app boilerplate that provides a solid foundation for building Shopify applications. It comes with a pre-configured setup that includes both frontend and backend implementations.

**Key features include:**

- Ready-to-use admin dashboard
- MongoDB integration
- React frontend
- Node.js backend
- Theme extension support
- Development environment setup

## Getting Started with Development

### Pre-requisites:

1. Install the Shopify CLI https://shopify.dev/docs/api/shopify-cli

2. Have a running local mongodb server (https://dev.to/saint_vandora/how-to-install-mongodb-locally-on-a-macbook-5h3a).

### Run the project locally:

Follow these steps to set up and run the boilerplate locally.

Clone the project

```bash
  git clone https://github.com/Store-Dojo/shopify-app-boilerplate.git
```

Go to the project directory

```bash
  cd shopify-app-boilerplate
```

Create .env file same as .env.sample

Create a new Shopify app (manually) in the Partners Dashboard.

Create shopify.app.dev-{{dev-name}}.toml file same as shopify.app.dev-sample.toml
"{{dev-name}}" is the name of the developer

in this new file (make 2 changes):

1. change the client_id to the client_id of the app you created in the Partners Dashboard
2. change the name of the app to the name of the developer

Run the following command to use the new app config:
choose the app config file you created

```bash
shopify app config use
```

Deploy the config to Shopify and choose the existing app you've created

```bash
shopify app deploy
```

start server and install dependencies

```bash
  npm run dev
```

This will:

- Start the Node.js backend server
- Launch the React frontend development environment
- Connect to your local MongoDB instance
- Enable hot-reloading for development
- Build and minify the app widget and saves it to /extensions/assets

**The app should now be accessible through your Shopify admin panel in development mode.**

## Project Structure

The app follows a standard Shopify app architecture:

- /web - Backend Node.js server
- /web/server - Express node.js server files (Backend)
- /web/frontend - React frontend application (Admin dashboard)
- /web/widget - React frontend application (App widget)
- /extensions - Shopify theme extensions (App widget **shopify wrapper** in online store)
- /web/shared - Shared utilities and constants

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## How to deploy the app

### Production deployment

Just push to "main" branch

### Staging deployment

Just push to "staging" branch
