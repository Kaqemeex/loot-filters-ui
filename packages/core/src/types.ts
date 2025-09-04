import { z } from 'zod'

// Base schemas for common fields
export const timestampSchema = z.number().int().positive()
export const discordIdSchema = z.string().nonempty()
