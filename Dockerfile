# ---- Estágio: development ----
FROM node:24-alpine AS development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ---- Estágio: build ----
FROM node:24-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Estágio: production ----
FROM node:24-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV TS_NODE_BASE_URL=./dist
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/tsconfig.json ./tsconfig.json
USER node
EXPOSE 3000
CMD ["node", "-r", "tsconfig-paths/register", "dist/src/main.js"]
