FROM node:14-alpine as base

WORKDIR /usr/src/app/backend
COPY ./backend/package.json ./backend/package-lock.json /usr/src/app/
EXPOSE 3000


FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY ./backend /usr/src/app/backend
CMD ["node", "start"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY ./backend /usr/src/app/backend
CMD ["nodemon", "start"]