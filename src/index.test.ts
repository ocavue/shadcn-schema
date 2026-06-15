import { describe, expect, it } from 'vitest'
import z from 'zod'

import { registryConfigSchema, registrySchema } from './index'

describe('registryConfigSchema', () => {
  it('should accept valid registry names starting with @', () => {
    const validConfig = {
      '@v0': 'https://v0.dev/{name}.json',
      '@acme': {
        url: 'https://acme.com/{name}.json',
        headers: {
          Authorization: 'Bearer token',
        },
      },
    }

    const result = registryConfigSchema.safeParse(validConfig)
    expect(result.success).toBe(true)
  })

  it('should reject registry names not starting with @', () => {
    const invalidConfig = {
      v0: 'https://v0.dev/{name}.json',
      acme: 'https://acme.com/{name}.json',
    }

    const result = registryConfigSchema.safeParse(invalidConfig)
    expect(result.success).toBe(false)
    if (!result.success) {
      const message = JSON.stringify(z.treeifyError(result.error), null, 2)
      expect(message).toContain('Registry names must start with @')
    }
  })

  it('should reject URLs without {name} placeholder', () => {
    const invalidConfig = {
      '@v0': 'https://v0.dev/component.json',
    }

    const result = registryConfigSchema.safeParse(invalidConfig)
    expect(result.success).toBe(false)
    if (!result.success) {
      const message = JSON.stringify(z.treeifyError(result.error), null, 2)
      expect(message).toContain('Registry URL must include {name} placeholder')
    }
  })
})

describe('registrySchema', () => {
  it('should accept a registry with items', () => {
    const result = registrySchema.safeParse({
      name: 'acme',
      homepage: 'https://acme.com',
      items: [{ name: 'button', type: 'registry:ui' }],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toHaveLength(1)
    }
  })

  it('should accept a registry with only include and default items to []', () => {
    const result = registrySchema.safeParse({
      name: 'acme',
      homepage: 'https://acme.com',
      include: ['https://acme.com/registry.json'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toEqual([])
    }
  })

  it('should reject a registry without items or include', () => {
    const result = registrySchema.safeParse({
      name: 'acme',
      homepage: 'https://acme.com',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const message = JSON.stringify(z.treeifyError(result.error), null, 2)
      expect(message).toContain(
        'Registry must define at least one of `items` or `include`',
      )
    }
  })
})
