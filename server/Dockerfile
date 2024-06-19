FROM node:20 as base

WORKDIR /server

COPY . .

ADD . /server

RUN npm install -g ts-node
RUN npm install
RUN npm run build

EXPOSE 9000

CMD ["ts-node", "./dist/server.js"]
