import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, LayoutDashboard } from 'lucide-react'
import { useLanguage } from '../../i18n'

function NavDashboardMenu({ variant = 'desktop', onNavigate }) {
	const [open, setOpen] = useState(false)
	const rootRef = useRef(null)
	const location = useLocation()
	const { t } = useLanguage()

	useEffect(() => {
		setOpen(false)
	}, [location.pathname])

	useEffect(() => {
		if (!open) return undefined
		const onDocClick = (e) => {
			if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
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

	return (
		<div ref={rootRef} className="landing-nav-dropdown">
			<button
				type="button"
				className="landing-nav-shell-link landing-nav-dropdown-trigger"
				aria-expanded={open}
				aria-haspopup="true"
				onClick={() => setOpen((v) => !v)}
			>
				{t('nav.dashboard')}
				<ChevronDown
					className={`landing-nav-dropdown-chevron${open ? ' is-open' : ''}`}
					aria-hidden
				/>
			</button>
			<AnimatePresence>
				{open ? (
					<div className="landing-nav-dropdown-panel-anchor">
						<motion.div
							initial={{ opacity: 0, y: -8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
									<LayoutDashboard className="h-4 w-4 shrink-0 text-landing" aria-hidden />
									<span>
										<span className="landing-nav-dropdown-item-label">{item.label}</span>
										<span className="landing-nav-dropdown-item-desc">{item.desc}</span>
									</span>
								</Link>
							))}
						</motion.div>
					</div>
				) : null}
			</AnimatePresence>
		</div>
	)
}

export default NavDashboardMenu
