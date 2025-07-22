# Loot Filters API

A Cloudflare Worker that provides an API for accessing loot filters stored in R2.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure your R2 bucket in `wrangler.toml` (update the bucket names as needed)

3. Authenticate with Cloudflare:

```bash
npx wrangler login
```

## Development

Start the development server:

```bash
npm run dev
```

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## API Endpoints

### GET /filter/{id}

Retrieves a filter by ID from R2 storage.

**Parameters:**

- `id` (string): The filter ID

**Response:**

- `200`: Filter data as JSON
- `404`: Filter not found
- `500`: Internal server error

**Example:**

```bash
curl https://your-worker.your-subdomain.workers.dev/filter/my-filter-id
```

### GET /

Returns API information and available endpoints.

**Response:**

```json
{
    "message": "Loot Filters API",
    "version": "1.0.0",
    "endpoints": {
        "GET /filter/{id}": "Get a filter by ID from R2 storage"
    }
}
```

## R2 Storage

Filters are stored in R2 as JSON files with the naming convention `{filterId}.json`.

## CORS

The API includes CORS headers to allow cross-origin requests from any domain.
