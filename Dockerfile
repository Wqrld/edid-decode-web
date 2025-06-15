FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Make edid-decode binary executable
RUN chmod +x edid-decode

EXPOSE 2005

CMD ["node", "index.js"] 