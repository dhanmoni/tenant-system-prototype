import { useEffect } from 'react'
import { useLanguage } from '../../i18n'

function SubmissionSuccessModal({ open, message, onClose }) {
	const { t } = useLanguage()

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
					{t('ws.citizen.modal.submittedTitle')}
				</h2>
				<p className="submission-success-modal__message">{message}</p>
				<button
					type="button"
					className="workflow-confirm-btn workflow-confirm-btn--primary submission-success-modal__btn"
					onClick={onClose}
				>
					{t('ws.citizen.modal.ok')}
				</button>
			</div>
		</div>
	)
}

export default SubmissionSuccessModal
