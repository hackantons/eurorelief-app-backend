FROM node:10
RUN apt-get update
RUN mkdir -p /usr/src/refugeecamp/node_modules && chown -R node:node /usr/src/refugeecamp && mkdir -p /usr/src/refugeecamp/public
WORKDIR /usr/src/refugeecamp
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]