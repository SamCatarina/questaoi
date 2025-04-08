FROM node:16 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --dev

COPY . .

RUN npm run build

FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install -g serve

COPY --from=build /app/dist /app/dist

EXPOSE 3000

CMD ["npm", "run", "dev"]
# CMD ["serve", "/app/dist", "-s", "-l", "3000"]
