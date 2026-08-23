import { useEffect, useId, useRef, useState } from 'react'
import { handleSkipLinkClick } from '../../utils/skipNavigation'
import { useLanguage } from '../../i18n'
import '../../styles/ux4g-topbar.css'

/**
 * Official UX4G 3.0 accessibility / government utility topbar.
 * Markup follows the UX4G playground Accessibility Bar (Desktop Fluid).
 */
export default function Ux4gTopbar({
	mainContentTargetId,
	fontScale,
	onIncreaseFont,
	onDecreaseFont,
	onResetFont,
}) {
	const { language, setLanguage, t } = useLanguage()
	const [langOpen, setLangOpen] = useState(false)
	const langWrapRef = useRef(null)
	const listboxId = useId()

	// NOTE: The UX4G UI uses Material Icons ligatures (e.g. "arrow_drop_down") for glyphs.
	// When the accessibility widget enables Dyslexia Friendly mode, it overrides font/ligatures,
	// causing those ligature strings to appear as broken text.
	// To avoid that entirely, we render simple inline SVGs for the topbar icons.
	const TopbarIcon = ({ kind, title }) => {
		const common = {
			width: 18,
			height: 18,
			viewBox: '0 0 24 24',
			'aria-hidden': true,
			focusable: 'false',
		}

		const strokeProps = { stroke: 'currentColor', strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
		switch (kind) {
			case 'text_decrease':
				return (
					<svg {...common}>
						<circle cx="12" cy="12" r="9" {...strokeProps} />
						<path d="M8.5 12.2h7" {...strokeProps} />
						{title ? <title>{title}</title> : null}
					</svg>
				)
			case 'text_increase':
				return (
					<svg {...common}>
						<circle cx="12" cy="12" r="9" {...strokeProps} />
						<path d="M8.5 12.2h7" {...strokeProps} />
						<path d="M12 8.7v7" {...strokeProps} />
						{title ? <title>{title}</title> : null}
					</svg>
				)
			case 'font_download':
				return (
					<svg {...common}>
						<circle cx="12" cy="12" r="9" {...strokeProps} />
						<path d="M12 11v5" {...strokeProps} />
						<path d="M8.8 13.9 12 17l3.2-3.1" {...strokeProps} />
						<path d="M7.5 6.7h9" {...strokeProps} />
						{title ? <title>{title}</title> : null}
					</svg>
				)
			case 'accessibility_new':
				return (
					<svg {...common}>
						<circle cx="12" cy="12" r="9" {...strokeProps} />
						<path d="M9.2 10.3c1.1-1.2 4.5-1.2 5.6 0" {...strokeProps} />
						<path d="M12 10.8c-1 0-2-.9-2-2s1-2 2-2 2 .9 2 2-1 2-2 2Z" {...strokeProps} />
						<path d="M10.1 14.1 8.5 18" {...strokeProps} />
						<path d="M13.9 14.1 15.5 18" {...strokeProps} />
						{title ? <title>{title}</title> : null}
					</svg>
				)
			case 'language':
				return (
					<svg {...common}>
						<circle cx="12" cy="12" r="9" {...strokeProps} />
						<path d="M3.6 12h16.8" {...strokeProps} />
						<path d="M12 3.2c2.4 2.6 2.4 15 0 17.6" {...strokeProps} />
						{title ? <title>{title}</title> : null}
					</svg>
				)
			case 'arrow_drop_down':
				return (
					<svg {...common}>
						<path d="M6.8 9.5 12 14.7l5.2-5.2" {...strokeProps} />
						{title ? <title>{title}</title> : null}
					</svg>
				)
			default:
				return null
		}
	}

	useEffect(() => {
		if (!langOpen) return undefined
		const onPointerDown = (event) => {
			if (!langWrapRef.current?.contains(event.target)) {
				setLangOpen(false)
			}
		}
		const onKeyDown = (event) => {
			if (event.key === 'Escape') setLangOpen(false)
		}
		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [langOpen])

	const openAccessibilityWidget = () => {
		const trigger = document.getElementById('uw-widget-custom-trigger')
		const panel = document.getElementById('uw-main')
		if (trigger) {
			trigger.click()
			return
		}
		if (panel) {
			panel.style.right = '0'
		}
	}

	const languageLabel = language === 'as' ? 'অসমীয়া' : 'English'

	return (
		<header className="ux4g-topbar ux4g-topbar-wide" role="banner" id="accessibility-bar">
			<div className="ux4g-container-fluid">
				<div className="ux4g-topbar__wrap ux4g-d-flex ux4g-jc-between ux4g-ai-center">
					<div className="ux4g-d-flex ux4g-ai-center ux4g-topbar__gov">
						<span className="india-flag" aria-hidden />
						<span className="ux4g-label-m-default ux4g-topbar__gov-label">
							{t('gov.brandLine')}
						</span>
					</div>
					<nav aria-label={t('a11y.options')} className="ux4g-d-flex ux4g-ai-center">
						<a
							className="ux4g-label-m-default ux4g-topbar__skip"
							href={`#${mainContentTargetId}`}
							onClick={(e) => handleSkipLinkClick(e, mainContentTargetId)}
						>
							<span className="ux4g-topbar__skip-full">{t('a11y.skipToMain')}</span>
							<span className="ux4g-topbar__skip-short">{t('a11y.skipShort')}</span>
						</a>

						{/* Tablet+ : font size */}
						<span className="ux4g-bl acc-top-divider ux4g-d-none ux4g-md-d-flex" aria-hidden />
						<div
							aria-label={t('a11y.fontSize')}
							className="ux4g-topbar__group ux4g-d-none ux4g-md-d-flex ux4g-ai-center"
							role="group"
						>
							<button
								aria-label={t('a11y.decreaseText')}
								className="ux4g-topbar__iconbtn ux4g-d-flex ux4g-jc-center ux4g-ai-center"
								type="button"
								onClick={onDecreaseFont}
								disabled={fontScale === 'normal'}
							>
								<span className="ux4g-top-bar-icon" aria-hidden>
									<TopbarIcon kind="text_decrease" />
								</span>
							</button>
							<button
								aria-label={t('a11y.resetText')}
								className="ux4g-topbar__iconbtn ux4g-d-flex ux4g-jc-center ux4g-ai-center"
								type="button"
								onClick={onResetFont}
								aria-pressed={fontScale === 'normal'}
							>
								<span className="ux4g-top-bar-icon" aria-hidden>
									<TopbarIcon kind="font_download" />
								</span>
							</button>
							<button
								aria-label={t('a11y.increaseText')}
								className="ux4g-topbar__iconbtn ux4g-d-flex ux4g-jc-center ux4g-ai-center"
								type="button"
								onClick={onIncreaseFont}
								disabled={fontScale === 'xlarge'}
							>
								<span className="ux4g-top-bar-icon" aria-hidden>
									<TopbarIcon kind="text_increase" />
								</span>
							</button>
						</div>

						{/* Always: accessibility + language (compact on phones) */}
						<span className="ux4g-bl acc-top-divider ux4g-d-flex" aria-hidden />
						<button
							type="button"
							aria-label={t('a11y.options')}
							className="ux4g-topbar__iconbtn ux4g-d-flex ux4g-jc-center ux4g-ai-center"
							onClick={openAccessibilityWidget}
						>
							<span className="ux4g-top-bar-icon" aria-hidden>
								<TopbarIcon kind="accessibility_new" />
							</span>
						</button>
						<span className="ux4g-bl acc-top-divider ux4g-d-flex" aria-hidden />
						<div className="ux4g-topbar__select ux4g-d-flex" ref={langWrapRef}>
							<button
								aria-expanded={langOpen}
								aria-haspopup="listbox"
								aria-controls={listboxId}
								className="ux4g-topbar__selectbtn ux4g-d-inline-flex ux4g-ai-center"
								type="button"
								onClick={() => setLangOpen((open) => !open)}
							>
								<span className="ux4g-top-bar-icon icon-language" aria-hidden>
									<TopbarIcon kind="language" />
								</span>
								<span className="ux4g-label-m-default">{languageLabel}</span>
								<span className="ux4g-top-bar-icon" aria-hidden>
									<TopbarIcon kind="arrow_drop_down" />
								</span>
							</button>
							{langOpen ? (
								<ul
									id={listboxId}
									className="ux4g-topbar__lang-menu"
									role="listbox"
									aria-label={t('a11y.language')}
								>
									<li role="option" aria-selected={language === 'en'}>
										<button
											type="button"
											className={language === 'en' ? 'is-active' : undefined}
											onClick={() => {
												setLanguage('en')
												setLangOpen(false)
											}}
										>
											English
										</button>
									</li>
									<li role="option" aria-selected={language === 'as'}>
										<button
											type="button"
											className={language === 'as' ? 'is-active' : undefined}
											onClick={() => {
												setLanguage('as')
												setLangOpen(false)
											}}
										>
											অসমীয়া
										</button>
									</li>
								</ul>
							) : null}
						</div>
					</nav>
				</div>
			</div>
		</header>
	)
}
