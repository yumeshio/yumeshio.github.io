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
		library: defineCollection({
			type: 'data',
			source: 'library/**/*.json',
			schema: z.object({
				title: z.string(),
				releaseDate: z.string().date().optional(),
				purchaseDate: z.string().date().optional(),
				startDate: z.string().date().optional(),
				completeDate: z.string().date().optional(),
				tags: z.array(z.string()).optional(),
				images: z.array(z.string().url()).optional(),
				status: z
					.enum(['wishlist', 'unstarted', 'ongoing', 'completed'])
					.optional(),
				link: z.string().url().optional(),
			}),
		}),
	},
})
