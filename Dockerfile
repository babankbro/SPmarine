FROM node:23-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* .
RUN pnpm install

COPY . .
RUN pnpm build

FROM node:23-alpine AS runner

RUN npm install -g next
COPY --from=builder /app /app
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_ENDPOINT=http://62.72.30.12:18001
ENV API_ENDPOINT=http://62.72.30.12:18001

# COPY --from=builder /app/.next .
# COPY --from=builder /app/node_modules .
# COPY --from=builder /app/package.json .
# COPY --from=builder /app/public .
# COPY --from=builder /app/next.config.mjs .

EXPOSE 3000
CMD ["npm", "run", "start"]

