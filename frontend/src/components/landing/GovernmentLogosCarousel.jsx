import { useReducedMotion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { governmentPortalLogos } from '../../data/governmentPortalLogos'
import { useLanguage } from '../../i18n'
import { useOffscreenPause } from '../../hooks/useOffscreenPause'

function LogoCard({ portal, opensNewLabel }) {
	return (
		<a
			href={portal.href}
			target="_blank"
			rel="noopener noreferrer"
			className="gov-logos-carousel__card"
			title={opensNewLabel}
		>
			{portal.logo ? (
				<img
					src={portal.logo}
					alt={portal.alt}
					className={`gov-logos-carousel__img${portal.imgClass ? ` ${portal.imgClass}` : ''}`}
					loading="lazy"
					decoding="async"
				/>
			) : (
				<span className="gov-logos-carousel__label">{portal.label ?? portal.name}</span>
			)}
			<ExternalLink className="gov-logos-carousel__external" aria-hidden />
		</a>
	)
}

function GovernmentLogosCarousel() {
	const { t } = useLanguage()
	const reduceMotion = useReducedMotion()
	const { ref, offscreen } = useOffscreenPause('120px 0px')
	const items = [...governmentPortalLogos, ...governmentPortalLogos]

	return (
		<section
			ref={ref}
			className={`gov-logos-carousel${offscreen ? ' is-offscreen' : ''}`}
			aria-label={t('home.logos.aria')}
		>
			<div className="gov-logos-carousel__inner">
				<p className="gov-logos-carousel__sr-only">{t('home.logos.srOnly')}</p>

				{reduceMotion ? (
					<ul className="gov-logos-carousel__static">
						{governmentPortalLogos.map((portal) => (
							<li key={portal.id}>
								<LogoCard
									portal={portal}
									opensNewLabel={t('home.logos.opensNew', { name: portal.name })}
								/>
							</li>
						))}
					</ul>
				) : (
					<div className="gov-logos-carousel__viewport">
						<div className="gov-logos-carousel__marquee">
							{items.map((portal, index) => (
								<LogoCard
									key={`${portal.id}-${index}`}
									portal={portal}
									opensNewLabel={t('home.logos.opensNew', { name: portal.name })}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	)
}

export default GovernmentLogosCarousel
