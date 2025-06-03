# 1. 베이스 이미지
FROM node:20-alpine AS builder

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. pnpm 설치
RUN npm install -g pnpm

# 4. 의존성 설치
COPY pnpm-lock.yaml ./
COPY package.json ./
RUN pnpm install

# 5. 소스 복사 및 빌드
COPY . .
RUN pnpm build

# 6. 실제 실행 환경
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm 

# 필요한 파일만 복사
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# 7. 환경 변수 설정
ENV NODE_ENV production
ENV PORT 3000

EXPOSE 3000

# 8. Next.js 실행
CMD ["pnpm", "start"]