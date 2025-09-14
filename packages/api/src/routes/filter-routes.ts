import { FilterEgg, FilterId, UpdateFilter } from '@loot-filters/core'
import { and, eq } from 'drizzle-orm'
import { IRequest } from 'itty-router'
import { FILTERS_TABLE } from '../db/filters'
import { Env } from '../env'
import { generateId } from '../utils/id_generation'
import {
    getFilterAndCheckOwnership,
    withAuthenticatedUser,
    withAuthenticatedUserIfPresent,
} from '../utils/route-auth-utils'
import { ApiCall } from './router-binding'

type FilterInsert = typeof FILTERS_TABLE.$inferInsert

export const createFilter: ApiCall<'createFilter'> = {
    middleware: [withAuthenticatedUser],
    call: async (req: IRequest, env: Env, egg: FilterEgg) => {
        const filterId = generateId('filter')

        const newFilter: FilterInsert = {
            name: egg.name,
            description: egg.description,
            public: egg.public,
            filterId,
            ownerDiscordId: req.auth.discordId,
            currentVersionId: '@none', // no version yet, will be set when first version is created
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        }

        return await env.DB.insert(FILTERS_TABLE)
            .values(newFilter)
            .returning()
            .get()
    },
}

export const updateFilter: ApiCall<'updateFilter'> = {
    middleware: [withAuthenticatedUser],
    call: async (
        req: IRequest,
        env: Env,
        {
            filterId,
            name,
            description,
            public: isPublic,
            currentVersionId,
        }: UpdateFilter
    ) => {
        // Validate that at least one field is provided
        if (
            !name &&
            !description &&
            isPublic === undefined &&
            !currentVersionId
        ) {
            throw new Error('At least one field must be provided')
        }
        const filter = await getFilterAndCheckOwnership(req, env, filterId)

        const updateData: Partial<FilterInsert> = {
            name,
            description,
            public: isPublic,
            currentVersionId,
        }
        updateData.updatedAt = new Date().getTime()

        return await env.DB.update(FILTERS_TABLE)
            .set(updateData)
            .where(eq(FILTERS_TABLE.filterId, filter!.filterId))
            .returning()
            .get()
    },
}

export const deleteFilter: ApiCall<'deleteFilter'> = {
    middleware: [withAuthenticatedUser],
    call: async (req: IRequest, env: Env, { filterId: id }: FilterId) => {
        await getFilterAndCheckOwnership(req, env, id)
        await env.DB.delete(FILTERS_TABLE).where(
            and(
                eq(FILTERS_TABLE.filterId, id),
                eq(FILTERS_TABLE.ownerDiscordId, req.auth.discordId)
            )
        )
    },
}

export const listMyFilters: ApiCall<'listMyFilters'> = {
    middleware: [withAuthenticatedUser],
    call: async (req: IRequest, env: Env) => {
        const filters = await env.DB.select()
            .from(FILTERS_TABLE)
            .where(eq(FILTERS_TABLE.ownerDiscordId, req.auth.discordId))
            .orderBy(FILTERS_TABLE.createdAt)
        return filters
    },
}

export const listPublicFilters: ApiCall<'listPublicFilters'> = {
    middleware: [],
    call: async (req: IRequest, env: Env) => {
        const filters = await env.DB.select()
            .from(FILTERS_TABLE)
            .where(eq(FILTERS_TABLE.public, true))
            .orderBy(FILTERS_TABLE.createdAt)
        return filters
    },
}

export const readFilter: ApiCall<'readFilter'> = {
    middleware: [withAuthenticatedUserIfPresent],
    call: async (req: IRequest, env: Env, { filterId: id }: FilterId) => {
        const filter = await getFilterAndCheckOwnership(req, env, id, true)
        return filter!
    },
}
