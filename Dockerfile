FROM node:carbon-alpine

ADD . /app
WORKDIR /app
EXPOSE 3000
RUN apk update && apk add python pkgconfig cairo-dev jpeg-dev giflib-dev make g++
RUN yarn global add node-gyp
RUN yarn install
CMD yarn start
