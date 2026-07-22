import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/dashboard/Icons'
import { useLanguage } from '../../i18n'
import { getWorkspaceNavigation } from '../config/navigation'

const PAGE_KEYWORDS = {
	'ws.nav.dashboard': ['home', 'overview', 'main'],
	'ws.nav.applyUin': ['uin', 'tenancy', 'certificate', 'apply', 'register'],
	'ws.nav.uinStatus': ['status', 'track', 'application', 'uin'],
	'ws.nav.allServices': ['services', 'forms', 'authority', 'court', 'tribunal'],
	'ws.nav.myProfile': ['profile', 'account', 'photo', 'pan', 'address'],
	'ws.nav.userManagement': ['users', 'staff', 'admin'],
	'ws.nav.staffDirectory': ['staff', 'directory', 'users'],
	'ws.nav.manageAssistants': ['assistants', 'staff', 'manage'],
	'ws.nav.applicationInbox': ['inbox', 'applications', 'review'],
	'ws.nav.serviceApplications': ['service', 'applications', 'forms'],
	'ws.nav.tenancyApplications': ['tenancy', 'applications', 'uin'],
	'ws.nav.districts': ['districts', 'locations', 'map'],
}

function buildPageIndex(user, t) {
	if (!user?.role) return []

	const seen = new Set()
	return getWorkspaceNavigation(user)
		.flatMap((group) => group.items)
		.filter((item) => {
			if (seen.has(item.to)) return false
			seen.add(item.to)
			return true
		})
		.map((item) => ({
			to: item.to,
			label: t(item.labelKey),
			icon: item.icon,
			keywords: PAGE_KEYWORDS[item.labelKey] || [],
		}))
}

function filterPages(pages, query) {
	const q = query.trim().toLowerCase()
	if (!q) return pages

	return pages.filter((page) => {
		const haystack = [page.label, page.to, ...page.keywords].join(' ').toLowerCase()
		return q.split(/\s+/).every((token) => haystack.includes(token))
	})
}

function WorkspacePageSearch({ user, onPanelOpen }) {
	const navigate = useNavigate()
	const location = useLocation()
	const { t } = useLanguage()
	const listboxId = useId()
	const rootRef = useRef(null)
	const inputRef = useRef(null)
	const [query, setQuery] = useState('')
	const [open, setOpen] = useState(false)
	const [focused, setFocused] = useState(false)
	const [highlightIndex, setHighlightIndex] = useState(0)

	const allPages = useMemo(() => buildPageIndex(user, t), [user, t])
	const results = useMemo(() => filterPages(allPages, query).slice(0, 10), [allPages, query])
	const hasQuery = Boolean(query.trim())
	const showPanel = open && (results.length > 0 || hasQuery)

	const closeSearch = useCallback(() => {
		setOpen(false)
		setHighlightIndex(0)
	}, [])

	const openSearch = useCallback(() => {
		onPanelOpen?.()
		setOpen(true)
		setHighlightIndex(0)
	}, [onPanelOpen])

	const goToPage = useCallback(
		(page) => {
			if (!page?.to) return
			navigate(page.to)
			setQuery('')
			closeSearch()
			inputRef.current?.blur()
		},
		[navigate, closeSearch]
	)

	useEffect(() => {
		setQuery('')
		closeSearch()
	}, [location.pathname, closeSearch])

	useEffect(() => {
		setHighlightIndex(0)
	}, [query, results.length])

	useEffect(() => {
		if (!open || results.length === 0) return
		const optionId = `${listboxId}-option-${highlightIndex}`
		document.getElementById(optionId)?.scrollIntoView({ block: 'nearest' })
	}, [highlightIndex, open, results.length, listboxId])

	useEffect(() => {
		if (!open) return undefined
		const onPointerDown = (event) => {
			if (rootRef.current && !rootRef.current.contains(event.target)) {
				closeSearch()
			}
		}
		document.addEventListener('mousedown', onPointerDown)
		return () => document.removeEventListener('mousedown', onPointerDown)
	}, [open, closeSearch])

	useEffect(() => {
		const onShortcut = (event) => {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault()
				inputRef.current?.focus()
				openSearch()
			}
		}
		document.addEventListener('keydown', onShortcut)
		return () => document.removeEventListener('keydown', onShortcut)
	}, [openSearch])

	const handleKeyDown = (event) => {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			if (!open) {
				openSearch()
				return
			}
			if (!results.length) return
			setHighlightIndex((prev) => (prev + 1) % results.length)
			return
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault()
			if (!open) {
				openSearch()
				return
			}
			if (!results.length) return
			setHighlightIndex((prev) => (prev - 1 + results.length) % results.length)
			return
		}

		if (event.key === 'Enter') {
			event.preventDefault()
			if (results[highlightIndex]) {
				goToPage(results[highlightIndex])
			}
			return
		}

		if (event.key === 'Escape') {
			event.preventDefault()
			setQuery('')
			closeSearch()
			inputRef.current?.blur()
		}
	}

	return (
		<div
			className={`ws-topbar-search${focused ? ' is-focused' : ''}${open ? ' is-open' : ''}`}
			ref={rootRef}
		>
			<div
				className="ws-topbar-search-field"
				onClick={() => inputRef.current?.focus()}
				role="search"
			>
				<span className="ws-topbar-search-leading" aria-hidden>
					<Icon name="search" className="ws-topbar-search-icon" />
				</span>
				<input
					ref={inputRef}
					type="text"
					className="ws-topbar-search-input"
				placeholder={focused ? t('ws.top.searchPlaceholderFocus') : t('ws.top.searchPlaceholder')}
				value={query}
				onChange={(event) => {
					setQuery(event.target.value)
					openSearch()
				}}
				onFocus={() => {
					setFocused(true)
					openSearch()
				}}
				onBlur={() => {
					window.setTimeout(() => {
						if (!rootRef.current?.contains(document.activeElement)) {
							setFocused(false)
						}
					}, 0)
				}}
				onKeyDown={handleKeyDown}
				aria-label={t('ws.top.searchLabel')}
				role="combobox"
				aria-expanded={showPanel}
				aria-controls={listboxId}
				aria-activedescendant={
					showPanel && results[highlightIndex]
						? `${listboxId}-option-${highlightIndex}`
						: undefined
				}
				aria-autocomplete="list"
				autoComplete="off"
				spellCheck={false}
			/>
			</div>

			{showPanel ? (
				<div className="ws-topbar-search-panel" id={listboxId} role="listbox" aria-label={t('ws.top.searchResults')}>
					<div className="ws-topbar-search-panel-head">
						<span className="ws-topbar-search-panel-label">
							{hasQuery ? t('ws.top.searchMatches') : t('ws.top.searchQuickPages')}
						</span>
						<span className="ws-topbar-search-panel-count">
							{results.length}
						</span>
					</div>

					{results.length > 0 ? (
						<ul className="ws-topbar-search-list">
							{results.map((page, index) => {
								const isActive = index === highlightIndex
								return (
									<li key={page.to}>
										<button
											type="button"
											id={`${listboxId}-option-${index}`}
											className={`ws-topbar-search-result${isActive ? ' is-active' : ''}`}
											role="option"
											aria-selected={isActive}
											onMouseEnter={() => setHighlightIndex(index)}
											onMouseDown={(event) => event.preventDefault()}
											onClick={() => goToPage(page)}
										>
											<span className="ws-topbar-search-result-icon" aria-hidden>
												<Icon name={page.icon || 'dashboard'} />
											</span>
											<span className="ws-topbar-search-result-copy">
												<span className="ws-topbar-search-result-label">{page.label}</span>
												<span className="ws-topbar-search-result-path">{page.to}</span>
											</span>
										</button>
									</li>
								)
							})}
						</ul>
					) : (
						<p className="ws-topbar-search-empty" role="status">
							{t('ws.top.searchNoResults')}
						</p>
					)}

					<div className="ws-topbar-search-foot" aria-hidden>
						<span className="ws-topbar-search-kbd">↑</span>
						<span className="ws-topbar-search-kbd">↓</span>
						<span>{t('ws.top.searchNavigate')}</span>
						<span className="ws-topbar-search-kbd">Enter</span>
						<span>{t('ws.top.searchOpen')}</span>
						<span className="ws-topbar-search-kbd">Esc</span>
						<span>{t('ws.top.searchClose')}</span>
					</div>
				</div>
			) : null}
		</div>
	)
}

export default WorkspacePageSearch
