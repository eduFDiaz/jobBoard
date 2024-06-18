# Stage 1: Build the Angular app
FROM node:20 as build

WORKDIR /client-angular

COPY . .

ADD . /client-angular

RUN npm install --legacy-peer-deps

RUN npm run build

# # Stage 2: Serve app with nginx server
FROM nginx:1.19.0-alpine as prod-stage

COPY --from=build /client-angular/dist/browser /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]