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
	image: {
		weserv: {
			baseURL: 'https://yumeshio.github.io',
		},
	},
	modules: [
		'@nuxt/content',
		'@nuxt/eslint',
		'@nuxt/fonts',
		'@nuxt/icon',
		'@nuxt/image',
		'@nuxt/ui',
		'@nuxtjs/i18n',
		'@vueuse/nuxt',
	],
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
