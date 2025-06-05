export default defineI18nConfig(() => {
	return {
		datetimeFormats: {
			ja: {
				short: {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
				},
				long: {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
				},
			},
		},
	}
})
