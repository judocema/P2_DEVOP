FROM api-api:latest

WORKDIR /app

COPY index.html .
COPY style.css .
COPY script.js .
COPY server.js .

EXPOSE 80

CMD ["node", "server.js"]
