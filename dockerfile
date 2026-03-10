FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "run","start" ]

# FROM node:20-alpine AS dist

# COPY package*.json ./
# RUN npm install

# COPY . ./
# RUN npm run build

# FROM node:20-alpine AS node_modules

# COPY package*.json ./
# RUN npm install

# FROM node:20-alpine

# WORKDIR /usr/src/app

# COPY --from=dist dist /usr/src/app/dist
# COPY --from=node_modules node_modules /usr/src/app/node_modules

# COPY . /usr/src/app

# EXPOSE 3000

# CMD [ "npm", "run","start:prod" ]