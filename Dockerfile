# Stage 1: Build client
FROM node:20-alpine AS client-build
WORKDIR /app
COPY package*.json ./
COPY packages/client/package*.json ./packages/client/
RUN npm install
COPY packages/client ./packages/client
RUN npm run build -w @bitcoin-tools/client

# Stage 2: Build server
FROM node:20-alpine AS server-build
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY packages/server/package*.json ./packages/server/
RUN npm install
COPY packages/server ./packages/server
COPY --from=client-build /app/packages/client/dist ./packages/server/public
RUN npm run build -w @bitcoin-tools/server
RUN ls -la packages/server/dist


# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app
COPY --from=server-build /app/packages/server/dist ./dist
COPY --from=server-build /app/packages/server/public ./public
COPY packages/server/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["node", "dist/index.js"]