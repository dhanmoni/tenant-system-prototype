import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Shared confirm dialog for inbox actions (forward, reject, success).
 */
function WorkflowConfirmModal({
	open,
	onClose,
	title,
	description,
	children,
	primaryLabel = 'Confirm',
	secondaryLabel = 'Cancel',
	onPrimary,
	primaryDisabled = false,
	primaryVariant = 'primary',
	hidePrimary = false,
}) {
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

	if (!open) return null

	return createPortal(
		<div
			className="status-progress-modal-overlay workflow-confirm-overlay"
			role="presentation"
			onClick={onClose}
		>
			<div
				className="status-progress-modal workflow-confirm-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="status-progress-modal__toolbar">
					<h2 id={titleId} className="status-progress-modal__toolbar-title">
						{title}
					</h2>
					<button
						type="button"
						className="status-progress-modal__close"
						onClick={onClose}
						aria-label="Close"
					>
						<X className="status-progress-modal__close-icon" aria-hidden />
					</button>
				</div>
				<div className="status-progress-modal__body workflow-confirm-modal__body">
					{description ? <p className="workflow-confirm-modal__lead">{description}</p> : null}
					{children}
					{!hidePrimary ? (
						<div className="workflow-confirm-modal__actions">
							<button
								type="button"
								className={
									primaryVariant === 'danger'
										? 'workflow-confirm-btn workflow-confirm-btn--danger'
										: 'workflow-confirm-btn workflow-confirm-btn--primary'
								}
								onClick={onPrimary}
								disabled={primaryDisabled}
							>
								{primaryLabel}
							</button>
							<button
								type="button"
								className="workflow-confirm-btn workflow-confirm-btn--secondary"
								onClick={onClose}
							>
								{secondaryLabel}
							</button>
						</div>
					) : null}
				</div>
			</div>
		</div>,
		document.body
	)
}

export default WorkflowConfirmModal
