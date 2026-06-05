import { useEffect } from 'react'

function SubmissionSuccessModal({ open, message, onClose }) {
	useEffect(() => {
		if (!open) return undefined
		const onKeyDown = (event) => {
			if (event.key === 'Escape') onClose?.()
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [open, onClose])

	if (!open || !message) return null

	return (
		<div
			className="submission-success-overlay"
			role="presentation"
			onClick={onClose}
		>
			<div
				className="submission-success-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="submission-success-title"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="submission-success-modal__icon" aria-hidden>
					✓
				</div>
				<h2 id="submission-success-title" className="submission-success-modal__title">
					Application submitted
				</h2>
				<p className="submission-success-modal__message">{message}</p>
				<button
					type="button"
					className="workflow-confirm-btn workflow-confirm-btn--primary submission-success-modal__btn"
					onClick={onClose}
				>
					OK
				</button>
			</div>
		</div>
	)
}

export default SubmissionSuccessModal
