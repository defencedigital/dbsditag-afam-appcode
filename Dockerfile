FROM registry.access.redhat.com/ubi9/nodejs-18:lts

WORKDIR /usr/src/app

COPY service/package*.json ./

RUN npm install

COPY service/ .

RUN npm run build
EXPOSE 8080

CMD [ "node", "dist/main.js" ]