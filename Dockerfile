FROM node:boron

ADD . /app
WORKDIR /app
EXPOSE 3000
RUN yarn global add node-gyp
RUN yarn install
CMD yarn start
