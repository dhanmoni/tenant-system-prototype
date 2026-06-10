import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './Icons'

function ProfileCompletionModal({ open, onComplete, onDismiss }) {
	useEffect(() => {
		if (!open) return undefined
		const onKeyDown = (event) => {
			if (event.key === 'Escape') onDismiss?.()
		}
		document.addEventListener('keydown', onKeyDown)
		const prevOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKeyDown)
			document.body.style.overflow = prevOverflow
		}
	}, [open, onDismiss])

	if (!open) return null

	return createPortal(
		<div
			className="profile-completion-overlay"
			role="presentation"
			onClick={onDismiss}
		>
			<div
				className="profile-completion-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="profile-completion-title"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="profile-completion-modal__icon" aria-hidden>
					<Icon name="user" />
				</div>
				<h2 id="profile-completion-title" className="profile-completion-modal__title">
					Complete your profile
				</h2>
				<p className="profile-completion-modal__message">
					Add your address, PIN code, PAN, and passport photo so future applications can be
					auto-filled and you spend less time on each form.
				</p>
				<ul className="profile-completion-modal__list">
					<li>Residential address and PIN code</li>
					<li>PAN card number</li>
					<li>Passport-size photograph</li>
				</ul>
				<footer className="profile-completion-modal__actions">
					<button
						type="button"
						className="workflow-confirm-btn workflow-confirm-btn--secondary"
						onClick={onDismiss}
					>
						Remind me later
					</button>
					<button
						type="button"
						className="workflow-confirm-btn workflow-confirm-btn--primary"
						onClick={onComplete}
					>
						Complete profile
					</button>
				</footer>
			</div>
		</div>,
		document.body
	)
}

export default ProfileCompletionModal
