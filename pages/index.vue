<template>
	<div>
		<div class="bg-gradient-to-br from-sky-50 to-pink-50">
			<div class="max-w-screen-lg mx-auto relative backdrop-blur-3xl">
				<NuxtImg src="/girl.png" width="1024" />
				<h1
					class="absolute right-2 bottom-2 sm:right-4 sm:bottom-4 lg:bottom-8 p-2 sm:p-4 rounded-lg text-white font-bold text-xl sm:text-4xl lg:text-6xl text-center backdrop-blur-xs"
				>
					夢見草<br />の<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;栞。
				</h1>
			</div>
		</div>
		<UContainer class="flex flex-col items-center py-4 sm:py-6 lg:py-8 gap-4">
			<ULink to="/novelog" class="mx-auto">〜 {{ $t('novelog') }} 〜</ULink>
		</UContainer>
	</div>
</template>
<script setup lang="ts">
definePageMeta({
	layout: 'home',
})
</script>
