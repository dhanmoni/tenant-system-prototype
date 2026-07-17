import { useEffect, useState } from 'react'

function PreviewField({ label, value, rawValue }) {
	const [imageUrl, setImageUrl] = useState('')

	useEffect(() => {
		if (!(rawValue instanceof File) || !rawValue.type?.startsWith('image/')) {
			setImageUrl('')
			return undefined
		}
		const url = URL.createObjectURL(rawValue)
		setImageUrl(url)
		return () => URL.revokeObjectURL(url)
	}, [rawValue])

	return (
		<div className={`service-form-preview__field${imageUrl ? ' service-form-preview__field--media' : ''}`}>
			<span className="service-form-preview__label">{label}</span>
			{imageUrl ? (
				<div className="service-form-preview__media">
					<img src={imageUrl} alt={label} className="service-form-preview__image" />
					<span className="service-form-preview__filename">{value}</span>
				</div>
			) : (
				<span className="service-form-preview__value">{value}</span>
			)}
		</div>
	)
}

function ServiceFormPreviewModal({
	open,
	title = 'Review application',
	subtitle,
	sections = [],
	onClose,
	onConfirm,
	confirming = false,
	confirmLabel = 'Confirm & submit',
}) {
	useEffect(() => {
		if (!open) return undefined
		const onKeyDown = (event) => {
			if (event.key === 'Escape' && !confirming) onClose?.()
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [open, confirming, onClose])

	if (!open) return null

	return (
		<div
			className="service-form-preview-overlay"
			role="presentation"
			onClick={confirming ? undefined : onClose}
		>
			<div
				className="service-form-preview-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="service-form-preview-title"
				onClick={(event) => event.stopPropagation()}
			>
				<header className="service-form-preview-modal__header">
					<div>
						<h2 id="service-form-preview-title" className="service-form-preview-modal__title">
							{title}
						</h2>
						{subtitle ? <p className="service-form-preview-modal__subtitle">{subtitle}</p> : null}
					</div>
					<button
						type="button"
						className="service-form-preview-modal__close"
						onClick={onClose}
						disabled={confirming}
						aria-label="Close preview"
					>
						×
					</button>
				</header>

				<div className="service-form-preview-modal__body">
					<p className="service-form-preview-modal__lead">
						Please review your details below. Click <strong>Confirm & submit</strong> only if
						everything is correct.
					</p>

					{sections.map((section) => (
						<section key={section.title} className="service-form-preview__section">
							<h3 className="service-form-preview__section-title">{section.title}</h3>
							<div className="service-form-preview__grid">
								{section.items.map((item) => (
									<PreviewField key={`${section.title}-${item.label}`} {...item} />
								))}
							</div>
						</section>
					))}
				</div>

				<footer className="service-form-preview-modal__footer">
					<button
						type="button"
						className="workflow-confirm-btn workflow-confirm-btn--secondary"
						onClick={onClose}
						disabled={confirming}
					>
						Edit details
					</button>
					<button
						type="button"
						className="workflow-confirm-btn workflow-confirm-btn--primary"
						onClick={onConfirm}
						disabled={confirming}
					>
						{confirming ? 'Submitting…' : confirmLabel}
					</button>
				</footer>
			</div>
		</div>
	)
}

export default ServiceFormPreviewModal
