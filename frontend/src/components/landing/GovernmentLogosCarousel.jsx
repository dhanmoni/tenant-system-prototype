import { useReducedMotion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { governmentPortalLogos } from '../../data/governmentPortalLogos'

function LogoCard({ portal }) {
	return (
		<a
			href={portal.href}
			target="_blank"
			rel="noopener noreferrer"
			className="gov-logos-carousel__card"
			title={`${portal.name} (opens in new tab)`}
		>
			{portal.logo ? (
				<img src={portal.logo} alt={portal.alt} className="gov-logos-carousel__img" loading="lazy" />
			) : (
				<span className="gov-logos-carousel__label">{portal.label ?? portal.name}</span>
			)}
			<ExternalLink className="gov-logos-carousel__external" aria-hidden />
		</a>
	)
}

function GovernmentLogosCarousel() {
	const reduceMotion = useReducedMotion()
	const items = [...governmentPortalLogos, ...governmentPortalLogos]

	return (
		<section className="gov-logos-carousel" aria-label="Related government websites">
			<div className="gov-logos-carousel__inner">
				<p className="gov-logos-carousel__sr-only">
					Links to related Government of India and Government of Assam portals
				</p>

				{reduceMotion ? (
					<ul className="gov-logos-carousel__static">
						{governmentPortalLogos.map((portal) => (
							<li key={portal.id}>
								<LogoCard portal={portal} />
							</li>
						))}
					</ul>
				) : (
					<div className="gov-logos-carousel__viewport">
						<div className="gov-logos-carousel__marquee">
							{items.map((portal, index) => (
								<LogoCard key={`${portal.id}-${index}`} portal={portal} />
							))}
						</div>
					</div>
				)}
			</div>
		</section>
	)
}

export default GovernmentLogosCarousel
