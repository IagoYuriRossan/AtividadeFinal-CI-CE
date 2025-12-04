FROM node:18-alpine
WORKDIR /app

# copy package files first to leverage caching
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
