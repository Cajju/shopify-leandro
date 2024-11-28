FROM node:20-alpine

RUN echo "Docker Build Starting..."
WORKDIR /app
COPY . /app
RUN chmod +x /app/build-and-serve-app.sh
RUN cd /app/web/frontend && npm install
RUN cd /app/web && npm install
CMD ["sh", "/app/build-and-serve-app.sh"]
EXPOSE 8081
RUN echo "Docker Build Complete."