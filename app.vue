<template>
	<UApp :locale="locales[locale]">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>

<script setup lang="ts">
import type { Locale, Messages } from '@nuxt/ui'
import * as _locales from '@nuxt/ui/locale'

const locales = _locales as Record<string, Locale<Messages>>
const { locale } = useI18n()
const i18nHead = useLocaleHead()
useHead(() => ({
	htmlAttrs: {
		lang: i18nHead.value.htmlAttrs.lang,
	},
	link: [...(i18nHead.value.link || [])],
	meta: [...(i18nHead.value.meta || [])],
}))
</script>
