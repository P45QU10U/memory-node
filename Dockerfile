FROM node:14-alpine as base

WORKDIR /usr/src/app
COPY package.json package-lock.json /usr/src/app/
EXPOSE 3000
CMD ["npm", "start"]


FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . /usr/src/app
CMD ["node", "bin/www"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /usr/src/app
CMD ["nodemon", "bin/www"]