FROM node:14-alpine as base

WORKDIR /usr/src/app
COPY ./package.json ./package-lock.json /usr/src/app/
EXPOSE 3000

RUN npm install -g nodemon && npm install
COPY . /usr/src/app/
CMD ["npm", "start"]