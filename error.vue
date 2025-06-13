<script setup lang="ts">
import type { NuxtError } from '#app'
import type { Locale, Messages } from '@nuxt/ui'
import * as _locales from '@nuxt/ui/locale'

const props = defineProps<{
	error: NuxtError
}>()

const locales = _locales as Record<string, Locale<Messages>>
const { locale } = useI18n()
const i18nHead = useLocaleHead()
useHead(() => ({
	htmlAttrs: {
		lang: i18nHead.value.htmlAttrs.lang,
	},
	link: [...(i18nHead.value.link || [])],
	meta: [...(i18nHead.value.meta || [])],
	title: props.error.statusCode,
}))
</script>

<template>
	<UApp :locale="locales[locale]">
		<NuxtLayout>
			<NuxtImg v-if="error?.statusCode === 404" src="/404.png" />
			<p v-else>{{ error.statusCode }} {{ error.statusMessage }}</p>
		</NuxtLayout>
	</UApp>
</template>
