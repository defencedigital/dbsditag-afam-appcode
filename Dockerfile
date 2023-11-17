FROM registry.access.redhat.com/ubi9/nodejs-18 as build-stage

WORKDIR /app
COPY service/ .

USER 0

RUN npm install -g yarn rimraf "@nestjs/cli"
RUN yarn install
RUN yarn run build

USER 1001

FROM registry.access.redhat.com/ubi9/nodejs-18
COPY --from=build-stage /app/ "${HOME}"
CMD [ "node", "dist/main.js" ]

EXPOSE 8080
