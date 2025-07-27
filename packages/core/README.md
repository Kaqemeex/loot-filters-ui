# @loot-filters/core

This package contains shared data models and validation schemas for the loot-filters project. It uses Zod for runtime type validation and provides TypeScript types for all models.

## Usage

```typescript
import { FilterSchema, Filter, schemas } from '@loot-filters/core'

// Validate data
const filterData = FilterSchema.parse(rawData)

// Use TypeScript types
const filter: Filter = {
    id: '123',
    name: 'My Filter',
    content: 'filter content...',
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublic: false,
    tags: ['pvm', 'bossing'],
}

// Access all schemas
const { Filter, User, FilterConfiguration } = schemas
```

## Available Models

- `Filter` - Represents a loot filter with metadata
- `User` - User account information
- `FilterConfiguration` - User-specific filter settings
- `ApiResponse` - Generic API response wrapper

## Development

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```
