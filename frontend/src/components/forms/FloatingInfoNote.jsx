import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'

const POPUP_WIDTH = 352
const VIEW_PAD = 12

/**
 * (i) note that portals a fixed tooltip so parent overflow cannot clip it.
 */
function FloatingInfoNote({ label, children, iconSize = 14, className = '' }) {
	const triggerRef = useRef(null)
	const popupId = useId()
	const [open, setOpen] = useState(false)
	const [pos, setPos] = useState({ top: 0, left: 0, width: POPUP_WIDTH })

	const place = useCallback(() => {
		const el = triggerRef.current
		if (!el) return
		const rect = el.getBoundingClientRect()
		const width = Math.min(POPUP_WIDTH, window.innerWidth - VIEW_PAD * 2)
		let left = rect.left
		if (left + width > window.innerWidth - VIEW_PAD) {
			left = Math.max(VIEW_PAD, rect.right - width)
		}
		if (left < VIEW_PAD) left = VIEW_PAD
		let top = rect.bottom + 6
		const estimatedHeight = 220
		if (top + estimatedHeight > window.innerHeight - VIEW_PAD) {
			top = Math.max(VIEW_PAD, rect.top - estimatedHeight - 6)
		}
		setPos({ top, left, width })
	}, [])

	const show = useCallback(() => {
		place()
		setOpen(true)
	}, [place])

	const hide = useCallback(() => setOpen(false), [])

	useEffect(() => {
		if (!open) return undefined
		const onScrollOrResize = () => place()
		window.addEventListener('scroll', onScrollOrResize, true)
		window.addEventListener('resize', onScrollOrResize)
		return () => {
			window.removeEventListener('scroll', onScrollOrResize, true)
			window.removeEventListener('resize', onScrollOrResize)
		}
	}, [open, place])

	return (
		<span
			ref={triggerRef}
			className={`ground-choice__info-container${className ? ` ${className}` : ''}`}
			role="note"
			tabIndex={0}
			aria-label={label}
			aria-describedby={open ? popupId : undefined}
			onMouseEnter={show}
			onMouseLeave={hide}
			onFocus={show}
			onBlur={hide}
			onClick={(e) => {
				e.preventDefault()
				e.stopPropagation()
			}}
			onMouseDown={(e) => {
				e.preventDefault()
				e.stopPropagation()
			}}
		>
			<Info size={iconSize} aria-hidden />
			{open && typeof document !== 'undefined'
				? createPortal(
						<span
							id={popupId}
							className="ground-choice__info-popup form-ii-floating-info-popup"
							role="tooltip"
							style={{
								display: 'block',
								position: 'fixed',
								top: pos.top,
								left: pos.left,
								width: pos.width,
								transform: 'none',
								zIndex: 10050,
								marginTop: 0,
							}}
						>
							{children}
						</span>,
						document.body
					)
				: null}
		</span>
	)
}

export default FloatingInfoNote
