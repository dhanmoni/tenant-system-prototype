import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LayoutDashboard } from 'lucide-react'
import { useLanguage } from '../../i18n'

const CLOSE_DELAY_MS = 140

function NavDashboardMenu({ variant = 'desktop', onNavigate }) {
	const [open, setOpen] = useState(false)
	const [panelPos, setPanelPos] = useState({ top: 0, left: 0 })
	const rootRef = useRef(null)
	const triggerRef = useRef(null)
	const closeTimerRef = useRef(null)
	const location = useLocation()
	const { t } = useLanguage()

	const clearCloseTimer = () => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current)
			closeTimerRef.current = null
		}
	}

	const openMenu = () => {
		clearCloseTimer()
		setOpen(true)
	}

	const scheduleClose = () => {
		clearCloseTimer()
		closeTimerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
	}

	useEffect(() => {
		setOpen(false)
		clearCloseTimer()
	}, [location.pathname])

	useEffect(() => () => clearCloseTimer(), [])

	useLayoutEffect(() => {
		if (!open || !triggerRef.current) return undefined

		const updatePosition = () => {
			const rect = triggerRef.current.getBoundingClientRect()
			setPanelPos({
				top: rect.bottom + 10,
				left: rect.left + rect.width / 2,
			})
		}

		updatePosition()
		window.addEventListener('resize', updatePosition)
		window.addEventListener('scroll', updatePosition, true)
		return () => {
			window.removeEventListener('resize', updatePosition)
			window.removeEventListener('scroll', updatePosition, true)
		}
	}, [open])

	useEffect(() => {
		if (!open) return undefined
		const onDocClick = (e) => {
			if (rootRef.current?.contains(e.target)) return
			const panel = document.getElementById('landing-nav-dashboard-panel')
			if (panel?.contains(e.target)) return
			if (e.target.closest?.('.landing-nav-dropdown-panel-portal')) return
			setOpen(false)
		}
		const onKey = (e) => {
			if (e.key === 'Escape') setOpen(false)
		}
		document.addEventListener('mousedown', onDocClick)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('mousedown', onDocClick)
			document.removeEventListener('keydown', onKey)
		}
	}, [open])

	const close = () => {
		clearCloseTimer()
		setOpen(false)
		onNavigate?.()
	}

	const items = [
		{
			to: '/public-dashboard',
			label: t('nav.publicDashboard'),
			desc: t('nav.dashboardDesc'),
		},
	]

	if (variant === 'drawer') {
		return (
			<div className="landing-nav-drawer-dropdown">
				<p className="landing-nav-drawer-dropdown-label">{t('nav.dashboard')}</p>
				{items.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						onClick={close}
						className="landing-nav-drawer-dropdown-link"
					>
						<LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
						<span>
							<span className="block font-semibold">{item.label}</span>
							<span className="block text-xs font-normal opacity-80">{item.desc}</span>
						</span>
					</Link>
				))}
			</div>
		)
	}

	const panel =
		typeof document !== 'undefined'
			? createPortal(
					<AnimatePresence>
						{open ? (
							<div
								className="landing-nav-dropdown-panel-portal"
								style={{
									top: panelPos.top,
									left: panelPos.left,
								}}
								onMouseEnter={openMenu}
								onMouseLeave={scheduleClose}
							>
								{/* Invisible bridge so cursor can move from trigger → panel */}
								<span className="landing-nav-dropdown-bridge" aria-hidden />
								<motion.div
									id="landing-nav-dashboard-panel"
									initial={{ opacity: 0, y: -4 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -3 }}
									transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
									className="landing-nav-dropdown-panel"
									role="menu"
								>
									{items.map((item) => (
										<Link
											key={item.to}
											to={item.to}
											role="menuitem"
											className="landing-nav-dropdown-item"
											onClick={close}
										>
											<LayoutDashboard
												className="landing-nav-dropdown-item-icon"
												aria-hidden
											/>
											<span className="landing-nav-dropdown-item-copy">
												<span className="landing-nav-dropdown-item-label">{item.label}</span>
												<span className="landing-nav-dropdown-item-desc">{item.desc}</span>
											</span>
										</Link>
									))}
								</motion.div>
							</div>
						) : null}
					</AnimatePresence>,
					document.body,
				)
			: null

	return (
		<div
			ref={rootRef}
			className={`landing-nav-dropdown${open ? ' is-open' : ''}`}
			onMouseEnter={openMenu}
			onMouseLeave={scheduleClose}
		>
			<button
				ref={triggerRef}
				type="button"
				className="landing-nav-shell-link landing-nav-dropdown-trigger"
				aria-expanded={open}
				aria-haspopup="true"
				onClick={() => setOpen((v) => !v)}
				onFocus={openMenu}
			>
				{t('nav.dashboard')}
				<ChevronDown
					className={`landing-nav-dropdown-chevron${open ? ' is-open' : ''}`}
					aria-hidden
				/>
			</button>
			{panel}
		</div>
	)
}

export default NavDashboardMenu
