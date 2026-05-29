import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Activity, FileCheck, Layers, Smartphone } from 'lucide-react'
import { portalBenefitCards, portalBenefitsIntro } from '../../data/portalBenefits'
import benefitsImage from '../../assets/img/img5.png'
import {
	benefitsBodyVariants,
	benefitsCardHover,
	benefitsCardsGridVariants,
	benefitsCardVariants,
	benefitsIconHover,
	benefitsMediaFrameVariants,
	benefitsMediaVariants,
} from '../../utils/landingMotion'
import LandingSectionIntro from './LandingSectionIntro'

const iconMap = {
	layers: Layers,
	file: FileCheck,
	activity: Activity,
	smartphone: Smartphone,
}

function PortalBenefitsSection() {
	const bodyRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const bodyInView = useInView(bodyRef, { once: true, margin: '-14% 0px -10% 0px' })
	const reveal = reduceMotion || bodyInView

	return (
		<section
			id="portal-benefits"
			className="portal-benefits landing-body landing-wallpaper-bg landing-wallpaper-bg--cream py-14 sm:py-16 lg:py-20"
			aria-labelledby="portal-benefits-heading"
		>
			<div className="portal-benefits__inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<LandingSectionIntro
					className="portal-benefits__intro"
					eyebrow={portalBenefitsIntro.eyebrow}
					title={portalBenefitsIntro.title}
					lead={portalBenefitsIntro.lead}
					titleId="portal-benefits-heading"
				/>

				<motion.div
					ref={bodyRef}
					className="portal-benefits__body"
					initial={reduceMotion ? false : 'hidden'}
					animate={reveal ? 'visible' : 'hidden'}
					variants={reduceMotion ? undefined : benefitsBodyVariants}
				>
					<div className="portal-benefits__cards">
						<motion.div
							className="portal-benefits__cards-grid"
							variants={reduceMotion ? undefined : benefitsCardsGridVariants}
						>
							{portalBenefitCards.map((card, index) => {
								const Icon = iconMap[card.icon] || Layers
								return (
									<motion.article
										key={card.id}
										className="portal-benefits-card portal-benefits-card--motion"
										custom={index}
										variants={reduceMotion ? undefined : benefitsCardVariants}
										whileHover={reduceMotion ? undefined : benefitsCardHover}
									>
										<motion.span
											className="portal-benefits-card__icon"
											aria-hidden
											whileHover={reduceMotion ? undefined : benefitsIconHover}
										>
											<Icon className="h-5 w-5" strokeWidth={1.85} />
										</motion.span>
										<h3 className="portal-benefits-card__title">{card.title}</h3>
										<ul className="portal-benefits-card__tags">
											{card.tags.map((tag) => (
												<li key={tag}>
													<span className="portal-benefits-card__pill">{tag}</span>
												</li>
											))}
										</ul>
									</motion.article>
								)
							})}
						</motion.div>
					</div>

					<motion.div
						className="portal-benefits__media"
						variants={reduceMotion ? undefined : benefitsMediaVariants}
					>
						<motion.div
							className="portal-benefits__media-blob"
							aria-hidden
							initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
							animate={
								reduceMotion
									? undefined
									: reveal
										? {
												opacity: 0.85,
												scale: [1, 1.05, 1],
											}
										: { opacity: 0, scale: 0.8 }
							}
							transition={
								reduceMotion
									? undefined
									: reveal
										? {
												opacity: { duration: 0.5 },
												scale: {
													duration: 9,
													repeat: Infinity,
													ease: 'easeInOut',
													delay: 0.55,
												},
											}
										: { duration: 0.35 }
							}
						/>
						<motion.div
							className="portal-benefits__media-frame"
							variants={reduceMotion ? undefined : benefitsMediaFrameVariants}
						>
							<img
								src={benefitsImage}
								alt="Citizens using online tenancy registration and UIN services"
								className="portal-benefits__media-img"
								loading="lazy"
								decoding="async"
							/>
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	)
}

export default PortalBenefitsSection
