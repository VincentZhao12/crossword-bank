FROM node:alpine AS development

ENV NODE_ENV development

WORKDIR /react-app

COPY ./package*.json /react-app/

RUN npm install
RUN npm install -g serve

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "-l", "3000", "./build"]