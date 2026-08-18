import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Icon } from './Icons'

const AUTO_DISMISS_MS = 5000

function ProfileCompletionModal({ open, onComplete, onDismiss }) {
	const [overlayHost, setOverlayHost] = useState(null)

	useEffect(() => {
		if (!open) {
			setOverlayHost(null)
			return
		}
		setOverlayHost(
			document.getElementById('dashboard-primary-content') || document.body,
		)
	}, [open])

	useEffect(() => {
		if (!open) return undefined
		const timer = window.setTimeout(() => {
			onDismiss?.()
		}, AUTO_DISMISS_MS)
		return () => window.clearTimeout(timer)
	}, [open, onDismiss])

	useEffect(() => {
		if (!open) return undefined
		const onKeyDown = (event) => {
			if (event.key === 'Escape') onDismiss?.()
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [open, onDismiss])

	if (!open || !overlayHost) return null

	return createPortal(
		<div
			className="profile-completion-overlay"
			role="presentation"
			onClick={() => onDismiss?.()}
		>
			<div
				className="profile-completion-modal"
				role="status"
				aria-live="polite"
				aria-labelledby="profile-completion-title"
				onClick={(event) => event.stopPropagation()}
			>
				<button
					type="button"
					className="profile-completion-modal__close"
					onClick={() => onDismiss?.()}
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
					auto-filled. This reminder will move to notifications.
				</p>
				<footer className="profile-completion-modal__actions">
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
		overlayHost,
	)
}

export default ProfileCompletionModal
