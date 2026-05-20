import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import ApplicationStatusProgress from './ApplicationStatusProgress'

function ApplicationStatusProgressModal({ open, onClose, application }) {
	const titleId = useId()

	useEffect(() => {
		if (!open) return undefined
		const onKey = (e) => {
			if (e.key === 'Escape') onClose()
		}
		document.addEventListener('keydown', onKey)
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = prev
		}
	}, [open, onClose])

	if (!open || !application) return null

	return createPortal(
		<div
			className="status-progress-modal-overlay"
			role="presentation"
			onClick={onClose}
		>
			<div
				className="status-progress-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="status-progress-modal__toolbar">
					<h2 id={titleId} className="status-progress-modal__toolbar-title">
						Application progress
					</h2>
					<button
						type="button"
						className="status-progress-modal__close"
						onClick={onClose}
						aria-label="Close status progress"
					>
						<X className="status-progress-modal__close-icon" aria-hidden />
					</button>
				</div>
				<div className="status-progress-modal__body">
					<ApplicationStatusProgress application={application} />
				</div>
			</div>
		</div>,
		document.body
	)
}

export default ApplicationStatusProgressModal
