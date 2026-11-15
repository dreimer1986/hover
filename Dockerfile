FROM python:3.13-slim AS site
WORKDIR /build
COPY scripts/build_site.py scripts/build_site.py
COPY site site
COPY modifications modifications
COPY web web
COPY archive/windows/release-downloads.json archive/windows/release-downloads.json
RUN python scripts/build_site.py

FROM python:3.13-slim
LABEL org.opencontainers.image.source="https://github.com/dreimer1986/hover" \
      org.opencontainers.image.title="Hover multiplayer" \
      org.opencontainers.image.description="Preserved Hover web game with an optional Python multiplayer server"
WORKDIR /app
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server/app.py server/maps.json ./
COPY --from=site /build/_site /app/site
ENV SITE_DIR=/app/site PORT=8080 PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/healthz', timeout=2).read()"
CMD ["python", "app.py"]
