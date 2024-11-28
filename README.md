# [Boilerpalte] Bundles - Shopify app

## Introduction
Bundles is a Shopify app that allows merchants to create and manage product bundles in their store. THis version of app supports one type of bundle:

Volume Discounts: Apply discounts when customers buy multiple quantities of the same product

**Key features include:**
* Bundle management dashboard
* Flexible discount rules
* Bundle status tracking (active/draft)
* Product selection interface
* Real-time bundle updates

## Getting Started with Development

### Pre-requisites:

1. Install the Shopify CLI https://shopify.dev/docs/api/shopify-cli

2. Have a running local mongodb server (https://dev.to/saint_vandora/how-to-install-mongodb-locally-on-a-macbook-5h3a).

### Run the project locally:
Check that the project is running properly and you can reach the admin dashboard of the app.

Clone the project

```bash
  git clone https://github.com/Store-Dojo/shopify-app-boilerplate.git
```

Go to the project directory

```bash
  cd shopify-app-boilerplate
```

start server and install dependencies
```bash
  npm run dev
```

This will:
* Start the Node.js backend server
* Launch the React frontend development environment
* Connect to your local MongoDB instance
* Enable hot-reloading for development
* Build and minify the app widget and saves it to /extensions/assets

**The app should now be accessible through your Shopify admin panel in development mode.**



## Project Structure
The app follows a standard Shopify app architecture:
* /web - Backend Node.js server
* /web/server - Express node.js server files (Backend)
* /web/frontend - React frontend application (Admin dashboard)
* /web/widget - React frontend application (App widget)
* /extensions - Shopify theme extensions (App widget **shopify wrapper** in online store)
* /web/shared - Shared utilities and constants

## Contributing
1. Create a feature branch
2. Make your changes
3. Submit a pull request
