# Build stage
# Using Red Hat's Universal Base Image (UBI) with Node.js 18 as the base image
FROM registry.access.redhat.com/ubi9/nodejs-18 as build

# Setting the working directory in the container to /usr/src/app
WORKDIR /usr/src/app

# Copying the service directory from the host to the current location (/usr/src/app) in the container
COPY service/ .

# Switching to the root user to install dependencies and change ownership of files
USER 0

RUN npm install -g corepack

RUN corepack enable

RUN npm install -g npm@10.2.5

RUN yarn install

RUN yarn build

RUN yarn add @nestjs/cli

# Installing the production dependencies defined in package-lock.json
#RUN npm ci --only=production

# Installing NestJS CLI for building the application
#RUN npm install @nestjs/cli

# Running the build script defined in package.json
#RUN npm run build

# Changing the ownership of /usr/src/app and its subdirectories to user 1001 and group 0
# Also setting the permissions so that the group has the same permissions as the user
RUN chown -R 1001:0 /usr/src/app && chmod -R g=u /usr/src/app

# Switching back to user 1001 for security
USER 1001

# Production stage
# Using Red Hat's Universal Base Image (UBI) with Node.js 20 (minimal version) as the base image
FROM registry.access.redhat.com/ubi9/nodejs-20

# Setting the working directory in the container to /usr/src/app
WORKDIR /usr/src/app

# Copying the built application from the build stage to the current location (/usr/src/app) in the container
COPY --from=build /usr/src/app/ .

# Switching to the root user to install dependencies
USER 0

RUN chown -R 1001:0 /usr/src/app && chmod -R g=u /usr/src/app
RUN chmod -R 777 /usr/src/app

# Installing curl and jq using the yum package manager
RUN yum install -y --allowerasing curl jq

# Switching back to user 1001 for security
USER 1001

# Setting the environment variable PORT to 8080
ENV PORT=8080

# Informing Docker that the container listens on the specified network port at runtime
EXPOSE 8080

# The command that will be run when the container starts
# It sources the preflight.sh script and then starts the application using Node.js
CMD [ "/bin/bash", "-c", "source /usr/src/app/preflight.sh && node dist/main.js" ]