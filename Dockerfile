FROM node:latest

COPY package*.json /
# RUN npm install
# required to serve the react app on the live server
COPY . /app
WORKDIR /app

COPY docker-start.sh ./start.sh
RUN chmod +x ./start.sh
CMD ./start.sh