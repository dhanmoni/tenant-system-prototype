import { useCallback, useState } from 'react'

export function useServiceFormPreview(submitHandler) {
	const [previewOpen, setPreviewOpen] = useState(false)

	const requestPreview = useCallback((event) => {
		event?.preventDefault?.()
		setPreviewOpen(true)
	}, [])

	const closePreview = useCallback(() => {
		setPreviewOpen(false)
	}, [])

	const confirmSubmit = useCallback(async () => {
		const ok = await submitHandler()
		if (ok !== false) setPreviewOpen(false)
	}, [submitHandler])

	return {
		previewOpen,
		requestPreview,
		closePreview,
		confirmSubmit,
	}
}
