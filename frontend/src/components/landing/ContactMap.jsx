import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useLanguage } from '../../i18n'

const MAP_EMBED_SRC =
	'https://www.google.com/maps?q=Directorate%20of%20Town%20and%20Country%20Planning%2C%20Assam&output=embed'

function ContactMap() {
	const { t } = useLanguage()
	const frameRef = useRef(null)
	const [shouldLoad, setShouldLoad] = useState(false)
	const [isReady, setIsReady] = useState(false)

	useEffect(() => {
		const el = frameRef.current
		if (!el || shouldLoad) return undefined

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setShouldLoad(true)
					observer.disconnect()
				}
			},
			{ rootMargin: '280px 0px' },
		)

		observer.observe(el)
		return () => observer.disconnect()
	}, [shouldLoad])

	return (
		<div className="gov-plain-page__map-frame" ref={frameRef}>
			{!shouldLoad ? (
				<button
					type="button"
					className="gov-plain-page__map-placeholder"
					onClick={() => setShouldLoad(true)}
					aria-label={t('contact.loadMap')}
				>
					<MapPin className="gov-plain-page__map-placeholder-icon" aria-hidden />
					<span className="gov-plain-page__map-placeholder-title">{t('contact.mapTitle')}</span>
					<span className="gov-plain-page__map-placeholder-text">{t('contact.mapAddress')}</span>
					<span className="gov-plain-page__map-placeholder-action">{t('contact.loadMap')}</span>
				</button>
			) : (
				<div className="gov-plain-page__map-embed-wrap">
					{!isReady ? (
						<div className="gov-plain-page__map-loading" role="status" aria-live="polite">
							<span className="gov-plain-page__map-loading-spinner" aria-hidden />
							{t('contact.loadingMap')}
						</div>
					) : null}
					<iframe
						title={t('contact.mapIframe')}
						className="gov-plain-page__map-embed"
						loading="eager"
						referrerPolicy="no-referrer-when-downgrade"
						src={MAP_EMBED_SRC}
						onLoad={() => setIsReady(true)}
					/>
				</div>
			)}
		</div>
	)
}

export default ContactMap
