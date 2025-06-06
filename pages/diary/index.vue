<script setup lang="ts">
import { CalendarDate, type DateValue } from '@internationalized/date'
const route = useRoute()
const today = new Date()
const placeholder = shallowRef(
	new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()),
)
const selectedDate = shallowRef()
if (route.query.date && typeof route.query.date === 'string') {
	const parts = route.query.date.split('-')
	selectedDate.value = new CalendarDate(
		parseInt(parts[0]),
		parseInt(parts[1]),
		parseInt(parts[2]),
	)
	placeholder.value = selectedDate.value
}
const { data } = await useAsyncData('diary-list', () => {
	const prev = placeholder.value.subtract({ months: 1 })
	const next = placeholder.value.add({ months: 1 })
	const query = queryCollection('diary')
	query.order('date', 'DESC')
	query.select('title', 'path', 'description', 'date')
	query.where('date', '>', [prev.toString(), next.toString()])
	return query.all()
})

const isDateDisabled = (date: DateValue) => {
	return !data.value?.find((d) => d.date == date.toString())
}
const { data: diaryData } = await useAsyncData('diary-content', async () => {
	if (!selectedDate.value) {
		return Promise.resolve(null)
	}
	return queryCollection('diary')
		.where('date', '=', selectedDate.value.toString())
		.first()
})

watch(selectedDate, async () => {
	await navigateTo({ query: { date: selectedDate.value.toString() } })
	refreshNuxtData('diary-content')
})

watch(placeholder, async (newValue, oldValue) => {
	if (newValue.month != oldValue.month || newValue.year != oldValue.year) {
		await refreshNuxtData('diary-list')
	}
})
</script>

<template>
	<UCalendar
		v-model="selectedDate"
		v-model:placeholder="placeholder"
		:is-date-disabled="isDateDisabled"
		class="w-fit mx-auto mb-4 md:mb-6"
	/>
	<UContainer>
		<h1 v-if="selectedDate" class="text-center font-bold">
			{{ $d(selectedDate.toDate('JST'), 'long') }}
		</h1>
		<ContentRenderer
			v-if="diaryData"
			:value="diaryData"
			:prose="true"
			tag="article"
			class="diary-content"
		/>
	</UContainer>
</template>
