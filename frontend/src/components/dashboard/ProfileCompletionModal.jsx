import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Icon } from './Icons'

function ProfileCompletionModal({ open, onComplete, onDismiss }) {
	const [dontShowAgain, setDontShowAgain] = useState(false)

	useEffect(() => {
		if (open) setDontShowAgain(false)
	}, [open])

	useEffect(() => {
		if (!open) return undefined
		const onKeyDown = (event) => {
			if (event.key === 'Escape') onDismiss?.({ suppressPermanent: dontShowAgain })
		}
		document.addEventListener('keydown', onKeyDown)
		const prevOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKeyDown)
			document.body.style.overflow = prevOverflow
		}
	}, [open, onDismiss, dontShowAgain])

	if (!open) return null

	const handleDismiss = () => onDismiss?.({ suppressPermanent: dontShowAgain })

	return createPortal(
		<div
			className="profile-completion-overlay"
			role="presentation"
			onClick={handleDismiss}
		>
			<div
				className="profile-completion-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="profile-completion-title"
				onClick={(event) => event.stopPropagation()}
			>
				<button
					type="button"
					className="profile-completion-modal__close"
					onClick={handleDismiss}
					aria-label="Close"
				>
					<X className="profile-completion-modal__close-icon" aria-hidden strokeWidth={2.25} />
				</button>

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

				<label className="profile-completion-modal__dont-show">
					<input
						type="checkbox"
						checked={dontShowAgain}
						onChange={(event) => setDontShowAgain(event.target.checked)}
					/>
					<span>Don&apos;t show again</span>
				</label>

				<footer className="profile-completion-modal__actions">
					<button
						type="button"
						className="workflow-confirm-btn workflow-confirm-btn--secondary"
						onClick={handleDismiss}
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
