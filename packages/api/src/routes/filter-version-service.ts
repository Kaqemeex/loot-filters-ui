import {
    FilterId,
    FilterVersion,
    FilterVersionEgg,
    FilterVersionId,
    FilterVersionSettingsSchema,
    MacroBindingSchema,
    UpdateFilterVersionSettingsRequest,
} from '@loot-filters/core'
import { and, desc, eq } from 'drizzle-orm'
import { IRequest } from 'itty-router'
import { FILTER_VERSIONS_TABLE } from '../db/filters'
import { Env } from '../env'
import { NotFoundError } from '../utils/http-errors'
import { generateId } from '../utils/id_generation'
import {
    getFilterAndCheckOwnership,
    withAuthenticatedUser,
    withAuthenticatedUserIfPresent,
} from '../utils/route-auth-utils'
import { ApiCall } from './router-binding'

const deserializeVersionObj = (
    obj: typeof FILTER_VERSIONS_TABLE.$inferSelect
): FilterVersion => {
    return {
        ...obj,
        url: obj.url ?? undefined,
        settings: FilterVersionSettingsSchema.parse(JSON.parse(obj.settings)),
        parsedMacros: MacroBindingSchema.array().parse(
            JSON.parse(obj.parsedMacros)
        ),
    }
}

export const createFilterVersion: ApiCall<'createFilterVersion'> = {
    middleware: [withAuthenticatedUser],
    call: async (req: IRequest, env: Env, egg: FilterVersionEgg) => {
        // Ensures we own the filter and that it exists
        await getFilterAndCheckOwnership(req, env, egg.filterId)

        const versionId = generateId('filter_version')
        const rawRs2f = egg.rawRs2f
        const precompiledRs2f = egg.precompiledRs2f
        const parsedMacros = egg.parsedMacros
        const settings = egg.settings
        const filterVersionObj: typeof FILTER_VERSIONS_TABLE.$inferInsert = {
            versionId,
            name: egg.name || `Version ${new Date().toLocaleDateString()}`,
            filterId: egg.filterId,
            rawRs2f,
            precompiledRs2f,
            parsedMacros: JSON.stringify(parsedMacros),
            settings: JSON.stringify(settings),
            createdAt: new Date().getTime(),
        }

        const createdFilterVersion = await env.DB.insert(FILTER_VERSIONS_TABLE)
            .values(filterVersionObj)
            .returning()
            .get()
        return deserializeVersionObj(createdFilterVersion)
    },
}

export const readFilterVersion: ApiCall<'readFilterVersion'> = {
    middleware: [withAuthenticatedUserIfPresent],
    call: async (
        req: IRequest,
        env: Env,
        { filterId: id, versionId: versionId }: FilterVersionId
    ) => {
        await getFilterAndCheckOwnership(req, env, id, true)

        if (versionId === '@current') {
            return await readCurrentFilterVersionSettings.call(req, env, {
                filterId: id,
            })
        }

        const version = await env.DB.select()
            .from(FILTER_VERSIONS_TABLE)
            .where(
                and(
                    eq(FILTER_VERSIONS_TABLE.versionId, versionId),
                    eq(FILTER_VERSIONS_TABLE.filterId, id)
                )
            )
            .get()

        if (!version) {
            throw new NotFoundError()
        }

        return deserializeVersionObj(version)
    },
}

export const updateSettingsOnFilterVersion: ApiCall<'updateSettingsOnFilterVersion'> =
    {
        middleware: [withAuthenticatedUser],
        call: async (
            req: IRequest,
            env: Env,
            data: UpdateFilterVersionSettingsRequest
        ) => {
            await getFilterAndCheckOwnership(req, env, data.filterId)

            const updated = await env.DB.update(FILTER_VERSIONS_TABLE)
                .set({ settings: JSON.stringify(data.settings) })
                .where(
                    and(
                        eq(FILTER_VERSIONS_TABLE.versionId, data.versionId),
                        eq(FILTER_VERSIONS_TABLE.filterId, data.filterId)
                    )
                )
                .returning()
                .get()

            return deserializeVersionObj(updated)
        },
    }

export const deleteFilterVersion: ApiCall<'deleteFilterVersion'> = {
    middleware: [withAuthenticatedUser],
    call: async (
        req: IRequest,
        env: Env,
        { filterId: id, versionId: versionId }: FilterVersionId
    ) => {
        await getFilterAndCheckOwnership(req, env, id)

        await env.DB.delete(FILTER_VERSIONS_TABLE).where(
            and(
                eq(FILTER_VERSIONS_TABLE.versionId, versionId),
                eq(FILTER_VERSIONS_TABLE.filterId, id)
            )
        )
    },
}

export const listFilterVersions: ApiCall<'listFilterVersions'> = {
    middleware: [withAuthenticatedUserIfPresent],
    call: async (req: IRequest, env: Env, { filterId: id }: FilterId) => {
        await getFilterAndCheckOwnership(req, env, id, true)

        const versions = await env.DB.select()
            .from(FILTER_VERSIONS_TABLE)
            .where(eq(FILTER_VERSIONS_TABLE.filterId, id))
            .orderBy(desc(FILTER_VERSIONS_TABLE.createdAt))

        return versions.map(deserializeVersionObj)
    },
}

export const readCurrentFilterVersionSettings: ApiCall<'readCurrentFilterVersionSettings'> =
    {
        middleware: [withAuthenticatedUserIfPresent],
        call: async (req: IRequest, env: Env, { filterId: id }: FilterId) => {
            await getFilterAndCheckOwnership(req, env, id, true)
            const version = await env.DB.select()
                .from(FILTER_VERSIONS_TABLE)
                .where(eq(FILTER_VERSIONS_TABLE.filterId, id))
                .orderBy(desc(FILTER_VERSIONS_TABLE.createdAt))
                .limit(1)
                .get()

            if (!version) {
                throw new NotFoundError()
            }

            return deserializeVersionObj(version)
        },
    }
