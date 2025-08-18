import type { MaybeComputedElementRef } from '@vueuse/core'
export default (target: MaybeComputedElementRef) => {
	const containerBounding = useElementBounding(target)
	const windowSize = useWindowSize()
	return computed(() => {
		return (
			containerBounding.bottom.value > 0 &&
			containerBounding.bottom.value <= windowSize.height.value
		)
	})
}
