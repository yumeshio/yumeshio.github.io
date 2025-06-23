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
		layoutTransition: {
			enterActiveClass: 'transition-all',
			leaveActiveClass: 'transition-all',
			enterFromClass: 'blur opacity-0',
			leaveToClass: 'blur opacity-0',
			mode: 'out-in',
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
		strategy: 'no_prefix',
		defaultLocale: 'ja',
		locales: [
			{
				code: 'ja',
				language: 'ja-JP',
				name: '日本語',
				file: 'ja.json',
			},
			{
				code: 'zh',
				language: 'zh-CN',
				name: '简体中文',
				file: 'zh.json',
			},
		],
	},
	icon: {
		serverBundle: false,
		clientBundle: {
			icons: [
				'lucide:chevron-right',
				'lucide:chevrons-right',
				'lucide:chevron-left',
				'lucide:chevrons-left',
				'lucide:x',
			],
			scan: true,
		},
	},
})
