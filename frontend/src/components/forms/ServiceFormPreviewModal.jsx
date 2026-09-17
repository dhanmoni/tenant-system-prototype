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
	/** `legal` shows an A4-style document sheet via `legalDocument` instead of section grids. */
	variant = 'default',
	legalDocument = null,
	lead,
	onClose,
	onConfirm,
	confirming = false,
	confirmLabel = 'Confirm & submit',
}) {
	const isLegal = variant === 'legal'

	useEffect(() => {
		if (!open) return undefined
		const onKeyDown = (event) => {
			if (event.key === 'Escape' && !confirming) onClose?.()
		}
		document.addEventListener('keydown', onKeyDown)
		const prevOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKeyDown)
			document.body.style.overflow = prevOverflow
		}
	}, [open, confirming, onClose])

	if (!open) return null

	const defaultLead = (
		<>
			Please review your details below. Click <strong>Confirm & submit</strong> only if everything is
			correct.
		</>
	)

	if (isLegal) {
		return (
			<div className="drive-preview" role="presentation">
				<header className="drive-preview__toolbar">
					<div className="drive-preview__file">
						<span className="drive-preview__file-icon" aria-hidden>
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
								<path
									d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
									stroke="currentColor"
									strokeWidth="1.6"
									strokeLinejoin="round"
								/>
								<path
									d="M14 2v6h6"
									stroke="currentColor"
									strokeWidth="1.6"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
						<div className="drive-preview__file-meta">
							<h2 id="service-form-preview-title" className="drive-preview__file-name">
								{title}
							</h2>
							{subtitle ? <p className="drive-preview__file-sub">{subtitle}</p> : null}
						</div>
					</div>
					<div className="drive-preview__actions">
						<button
							type="button"
							className="drive-preview__btn drive-preview__btn--ghost"
							onClick={onClose}
							disabled={confirming}
						>
							Edit
						</button>
						<button
							type="button"
							className="drive-preview__btn drive-preview__btn--primary"
							onClick={onConfirm}
							disabled={confirming}
						>
							{confirming ? 'Submitting…' : confirmLabel}
						</button>
						<button
							type="button"
							className="drive-preview__close"
							onClick={onClose}
							disabled={confirming}
							aria-label="Close preview"
						>
							×
						</button>
					</div>
				</header>

				<div
					className="drive-preview__canvas"
					role="dialog"
					aria-modal="true"
					aria-labelledby="service-form-preview-title"
					onClick={confirming ? undefined : onClose}
				>
					<div
						className="drive-preview__sheet-wrap"
						onClick={(event) => event.stopPropagation()}
					>
						{legalDocument}
					</div>
				</div>

				<p className="drive-preview__hint">
					Preview of FORM-I as it will be filed. Press Esc or click outside the page to go back.
				</p>
			</div>
		)
	}

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
					<p className="service-form-preview-modal__lead">{lead ?? defaultLead}</p>

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
