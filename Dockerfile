# Stage 1: Install dependencies
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Stage 2: Lightweight runtime
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
