FROM node:20.18.1-alpine

# Add curl for healthcheck
RUN apk add --no-cache curl wget

WORKDIR /app
COPY . /app

# Run the build and deployment script
RUN cd /app/web/frontend && npm install
RUN cd /app/web/widget && npm install
RUN cd /app/web/shared && npm install
RUN cd /app/web && npm install

RUN chmod +x /app/build-and-serve-app.sh

CMD ["sh", "/app/build-and-serve-app.sh"]

EXPOSE 3000