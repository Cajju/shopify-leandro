#!/bin/sh
echo "Building frontend..."
cd /app/web/frontend
npm run build

echo "Building widget..."
cd /app/web/widget
npm run build:widget

echo "Starting application server..."
cd /app/web
npm run serve