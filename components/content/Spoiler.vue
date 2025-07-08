<template>
	<div class="relative">
		<div
			class="absolute inset-0 rounded p-4"
			:class="{
				'backdrop-blur-lg': !show,
			}"
			@click="show = !show"
		>
			<span
				v-if="!show"
				class="text-sm text-default bg-default border border-default rounded p-2"
				>{{ t('showSpoiler') }}</span
			>
		</div>
		<slot />
	</div>
</template>
<script lang="ts" setup>
const show = ref(false)
const { t } = useLocalI18n()
</script>

<i18n lang="json">
{
	"ja": {
		"showSpoiler": "ネタバレを表示"
	}
}
</i18n>
