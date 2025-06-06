// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-05-15',
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	app: {
		baseURL: '/',
		head: {
			link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
		},
	},
	devServer: {
		port: 3333,
	},
	modules: [
		'@nuxt/content',
		'@nuxt/eslint',
		'@nuxt/fonts',
		'@nuxt/icon',
		'@nuxt/image',
		'@nuxt/ui',
		'nuxt-viewport',
		'@nuxtjs/i18n',
	],
	viewport: {
		breakpoints: {
			xs: 320,
			sm: 640,
			md: 768,
			lg: 1024,
		},
	},
	i18n: {
		baseUrl: '/',
		defaultLocale: 'ja',
		locales: [
			{
				code: 'ja',
				language: 'ja-JP',
				name: '日本語',
				file: 'ja.json',
			},
		],
	},
	icon: {
		serverBundle: false,
		clientBundle: {
			// icons: ['i-lucide-house', 'i-lucide-book', 'lucide:align-justify'],
			scan: true,
		},
	},
})
