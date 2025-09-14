import {
    FilterConfigurationEgg,
    FilterConfigurationId,
    UpdateFilterConfiguration,
} from '@loot-filters/core'
import { eq } from 'drizzle-orm'
import { IRequest } from 'itty-router'
import { FILTER_CONFIGURATIONS_TABLE } from '../db/filters'
import { Env } from '../env'
import { generateId } from '../utils/id_generation'
import {
    enforceOwnership,
    withAuthenticatedUser,
    withAuthenticatedUserIfPresent,
} from '../utils/route-auth-utils'
import { ApiCall } from './router-binding'

type FilterConfigurationInsert = typeof FILTER_CONFIGURATIONS_TABLE.$inferInsert

export const createFilterConfiguration: ApiCall<'createFilterConfiguration'> = {
    middleware: [withAuthenticatedUser],
    call: async (req: IRequest, env: Env, egg: FilterConfigurationEgg) => {
        const newConfiguration: FilterConfigurationInsert = {
            ...egg,
            id: generateId('filter_config'),
            ownerDiscordId: req.auth.discordId,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
            macroOverrides: JSON.stringify(egg.macroOverrides),
        }

        const result = await env.DB.insert(FILTER_CONFIGURATIONS_TABLE)
            .values(newConfiguration)
            .returning()
            .get()

        return {
            ...result,
            macroOverrides: JSON.parse(result.macroOverrides),
        }
    },
}

export const readFilterConfiguration: ApiCall<'readFilterConfiguration'> = {
    middleware: [withAuthenticatedUserIfPresent],
    call: async (
        req: IRequest,
        env: Env,
        { filterId: id }: FilterConfigurationId
    ) => {
        const configuration = await env.DB.select()
            .from(FILTER_CONFIGURATIONS_TABLE)
            .where(eq(FILTER_CONFIGURATIONS_TABLE.id, id))
            .get()

        enforceOwnership(req, env, true, configuration)

        return {
            ...configuration!,
            macroOverrides: JSON.parse(configuration!.macroOverrides),
        }
    },
}

export const updateFilterConfiguration: ApiCall<'updateFilterConfiguration'> = {
    middleware: [withAuthenticatedUser],
    call: async (
        req: IRequest,
        env: Env,
        updateData: UpdateFilterConfiguration
    ) => {
        const existingConfig = await env.DB.select()
            .from(FILTER_CONFIGURATIONS_TABLE)
            .where(eq(FILTER_CONFIGURATIONS_TABLE.id, updateData.id))
            .get()

        enforceOwnership(req, env, false, existingConfig)

        const dbUpdateData: Partial<FilterConfigurationInsert> = {
            updatedAt: new Date().getTime(),
            ...updateData,
            macroOverrides: JSON.stringify(updateData.macroOverrides),
        }

        const result = await env.DB.update(FILTER_CONFIGURATIONS_TABLE)
            .set(dbUpdateData)
            .where(eq(FILTER_CONFIGURATIONS_TABLE.id, updateData.id))
            .returning()
            .get()

        return {
            ...result,
            macroOverrides: JSON.parse(result.macroOverrides),
        }
    },
}

export const deleteFilterConfiguration: ApiCall<'deleteFilterConfiguration'> = {
    middleware: [withAuthenticatedUser],
    call: async (
        req: IRequest,
        env: Env,
        { filterId: id }: FilterConfigurationId
    ) => {
        const existingConfig = await env.DB.select()
            .from(FILTER_CONFIGURATIONS_TABLE)
            .where(eq(FILTER_CONFIGURATIONS_TABLE.id, id))
            .get()

        enforceOwnership(req, env, false, existingConfig)

        await env.DB.delete(FILTER_CONFIGURATIONS_TABLE).where(
            eq(FILTER_CONFIGURATIONS_TABLE.id, id)
        )
    },
}

export const listMyFilterConfigurations: ApiCall<'listMyFilterConfigurations'> =
    {
        middleware: [withAuthenticatedUser],
        call: async (req: IRequest, env: Env) => {
            const configurations = await env.DB.select()
                .from(FILTER_CONFIGURATIONS_TABLE)
                .where(
                    eq(
                        FILTER_CONFIGURATIONS_TABLE.ownerDiscordId,
                        req.auth.discordId
                    )
                )
                .orderBy(FILTER_CONFIGURATIONS_TABLE.createdAt)

            return configurations.map((config) => ({
                ...config,
                macroOverrides: JSON.parse(config.macroOverrides),
            }))
        },
    }

export const listPublicFilterConfigurations: ApiCall<'listPublicFilterConfigurations'> =
    {
        middleware: [],
        call: async (req: IRequest, env: Env) => {
            const configurations = await env.DB.select()
                .from(FILTER_CONFIGURATIONS_TABLE)
                .where(eq(FILTER_CONFIGURATIONS_TABLE.public, true))
                .orderBy(FILTER_CONFIGURATIONS_TABLE.createdAt)

            return configurations.map((config) => ({
                ...config,
                macroOverrides: JSON.parse(config.macroOverrides),
            }))
        },
    }
