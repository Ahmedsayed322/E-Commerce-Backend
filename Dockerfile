FROM node:22.15.1
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
CMD [ "npm","run","start:dev" ]