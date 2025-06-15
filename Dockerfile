FROM node:22-slim AS builder

WORKDIR /app

# COPY package*.json ./

# RUN npm install --omit=dev --verbose

COPY . .

# Make edid-decode binary executable
RUN chmod +x edid-decode

FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app ./

ENV NODE_ENV=production

EXPOSE 2005

USER nonroot
CMD ["index.js"] 