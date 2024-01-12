FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
RUN npm rebuild sqlite3  

EXPOSE 3000

ENV NODE_ENV=production
ENV MIN_SHARE_VALUE=3
ENV MAX_SHARE_VALUE=200
ENV TARGET_COST_PER_ACQUISITION=200

CMD ["npm", "start"]
