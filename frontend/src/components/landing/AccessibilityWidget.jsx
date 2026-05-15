import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Accessibility, Contrast, Minus, Navigation, Plus, RotateCcw, X, Type } from 'lucide-react'

function AccessibilityWidget({
	fontScale,
	highContrast,
	onIncreaseFont,
	onDecreaseFont,
	onResetFont,
	onToggleContrast,
	navTargetId = 'public-primary-nav',
}) {
	const [open, setOpen] = useState(false)
	const panelId = useId()
	const fabRef = useRef(null)
	const panelRef = useRef(null)

	const close = useCallback(() => setOpen(false), [])
	const toggle = useCallback(() => setOpen((prev) => !prev), [])

	useEffect(() => {
		const onKeyDown = (e) => {
			if (e.ctrlKey && e.key === 'F2') {
				e.preventDefault()
				toggle()
			}
			if (e.key === 'Escape' && open) {
				close()
				fabRef.current?.focus()
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [open, toggle, close])

	useEffect(() => {
		if (!open) return undefined
		const onPointerDown = (e) => {
			if (
				panelRef.current?.contains(e.target) ||
				fabRef.current?.contains(e.target)
			) {
				return
			}
			close()
		}
		document.addEventListener('mousedown', onPointerDown)
		return () => document.removeEventListener('mousedown', onPointerDown)
	}, [open, close])

	useEffect(() => {
		document.body.classList.toggle('ux4g-a11y-panel-open', open)
		return () => document.body.classList.remove('ux4g-a11y-panel-open')
	}, [open])

	const options = [
		{
			id: 'bigger-text',
			label: 'Bigger text',
			hint: 'A+',
			icon: Plus,
			onClick: onIncreaseFont,
		},
		{
			id: 'smaller-text',
			label: 'Smaller text',
			hint: 'A−',
			icon: Minus,
			onClick: onDecreaseFont,
		},
		{
			id: 'reset-text',
			label: 'Reset text',
			hint: 'A',
			icon: RotateCcw,
			onClick: onResetFont,
			active: fontScale === 'normal',
		},
		{
			id: 'high-contrast',
			label: 'High contrast',
			hint: 'On / Off',
			icon: Contrast,
			onClick: onToggleContrast,
			active: highContrast,
		},
	]

	const skipTo = (target) => {
		const id = target.startsWith('#') ? target.slice(1) : target
		const el = document.getElementById(id)
		if (el) {
			if (!el.hasAttribute('tabindex')) {
				el.setAttribute('tabindex', '-1')
			}
			el.focus({ preventScroll: true })
			el.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}
		close()
	}

	return (
		<>
			{open ? (
				<div className="ux4g-a11y-backdrop" aria-hidden onClick={close} />
			) : null}

			<div
				ref={panelRef}
				id={panelId}
				className={`ux4g-a11y-panel${open ? ' is-open' : ''}`}
				role="dialog"
				aria-modal="true"
				aria-hidden={!open}
				aria-labelledby="ux4g-a11y-panel-title"
			>
				<div className="ux4g-a11y-panel-header">
					<div className="ux4g-a11y-panel-brand">
						<Accessibility className="h-5 w-5 shrink-0" aria-hidden />
						<div>
							<h2 id="ux4g-a11y-panel-title">Accessibility options</h2>
							<p>Adjust display settings for easier reading</p>
						</div>
					</div>
					<button
						type="button"
						className="ux4g-a11y-panel-close"
						onClick={close}
						aria-label="Close accessibility options"
					>
						<X className="h-5 w-5" aria-hidden />
					</button>
				</div>

				<div className="ux4g-a11y-panel-grid">
					{options.map((opt) => {
						const Icon = opt.icon
						return (
							<button
								key={opt.id}
								type="button"
								className={`ux4g-a11y-option${opt.active ? ' is-active' : ''}`}
								onClick={() => {
									opt.onClick()
								}}
							>
								<span className="ux4g-a11y-option-icon">
									<Icon className="h-5 w-5" aria-hidden />
								</span>
								<span className="ux4g-a11y-option-label">{opt.label}</span>
								<span className="ux4g-a11y-option-hint">{opt.hint}</span>
							</button>
						)
					})}
				</div>

				<div className="ux4g-a11y-panel-links">
					<button type="button" className="ux4g-a11y-link-btn" onClick={() => skipTo('main-content')}>
						<Type className="h-4 w-4" aria-hidden />
						Skip to main content
					</button>
					<button
						type="button"
						className="ux4g-a11y-link-btn"
						onClick={() => skipTo(navTargetId)}
					>
						<Navigation className="h-4 w-4" aria-hidden />
						Skip to navigation
					</button>
				</div>
			</div>

			<button
				ref={fabRef}
				type="button"
				className={`ux4g-a11y-fab${open ? ' is-open' : ''}`}
				onClick={toggle}
				aria-expanded={open}
				aria-controls={panelId}
				aria-label="Accessibility options"
				title="Accessibility options"
			>
				<Accessibility className="h-7 w-7" strokeWidth={2.25} aria-hidden />
			</button>
		</>
	)
}

export default AccessibilityWidget
