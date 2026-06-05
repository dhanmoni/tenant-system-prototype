export function formatPreviewValue(value) {
	if (value instanceof File) {
		return value.name || 'File attached'
	}
	if (value === null || value === undefined) return '—'
	const text = String(value).trim()
	return text || '—'
}

export function previewItem(label, value) {
	return { label, value: formatPreviewValue(value) }
}

export function previewSection(title, items = []) {
	const visible = items.filter((item) => item && item.label)
	if (!visible.length) return null
	return { title, items: visible }
}

export function previewSections(...sections) {
	return sections.filter(Boolean)
}
