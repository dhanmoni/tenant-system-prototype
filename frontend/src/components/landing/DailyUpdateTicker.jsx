import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useLanguage } from '../../i18n'
import { useOffscreenPause } from '../../hooks/useOffscreenPause'

function NoticeItem({ text }) {
	return (
		<span className="daily-update-ticker-item">
			<span className="daily-update-ticker-bullet" aria-hidden>
				•
			</span>
			<span>{text}</span>
		</span>
	)
}

function DailyUpdateTicker() {
	const { t } = useLanguage()
	const reduceMotion = useReducedMotion()
	const { ref, offscreen } = useOffscreenPause()

	const updates = useMemo(
		() => [
			{ id: 'uin-joint', text: t('home.notice.uinJoint') },
			{ id: 'uin-individual', text: t('home.notice.uinIndividual') },
		],
		[t],
	)
	const marqueeItems = [...updates, ...updates]

	return (
		<section
			ref={ref}
			className={`daily-update-ticker${offscreen ? ' is-offscreen' : ''}`}
			aria-label={t('home.notices')}
			aria-live={reduceMotion ? 'polite' : 'off'}
		>
			<div className="daily-update-ticker-inner">
				<div className="daily-update-ticker-badge">{t('home.notices')}</div>

				<div className="daily-update-ticker-viewport">
					{reduceMotion ? (
						<div className="daily-update-ticker-static">
							{updates.map((item) => (
								<NoticeItem key={item.id} text={item.text} />
							))}
						</div>
					) : (
						<div className="daily-update-ticker-track">
							<div className="daily-update-ticker-marquee">
								{marqueeItems.map((item, index) => (
									<NoticeItem key={`${item.id}-${index}`} text={item.text} />
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}

export default DailyUpdateTicker
