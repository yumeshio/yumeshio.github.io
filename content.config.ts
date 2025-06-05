import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
	collections: {
		blog: defineCollection({
			type: 'page',
			source: 'blog/**/*.md',
			schema: z.object({
				date: z.string(),
				tags: z.array(z.string()),
			}),
		}),
		diary: defineCollection({
			type: 'page',
			source: 'diary/**/*.md',
			schema: z.object({
				date: z.string(),
			}),
		}),
	},
})
