# Backend Docker Setup

## Build the Docker image

```bash
docker build -t lmnp-backend .
```

## Run the container

```bash
docker run -d \
  --name lmnp-backend \
  -p 3001:3001 \
  -e OPENAI_API_KEY=your_api_key_here \
  -e MODEL_NAME=gpt-3.5-turbo-1106 \
  -e TEMPERATURE=0.3 \
  -e MAX_TOKENS=500 \
  lmnp-backend
```

## View logs

```bash
docker logs -f lmnp-backend
```

## Stop and remove container

```bash
docker stop lmnp-backend
docker rm lmnp-backend
```

