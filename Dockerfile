FROM node:13.8.0-alpine

WORKDIR /app
ENV PORT=3000
CMD ["yarn", "start"]

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
USER node