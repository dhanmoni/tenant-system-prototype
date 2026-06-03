import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import AuthNavLink from './AuthNavLink'
import {
	heroAccentLineVariants,
	heroActionItemVariants,
	heroActionsContainerVariants,
	heroCopyContainerVariants,
	heroLeadVariants,
	heroSlideVariants,
	heroTitleVariants,
} from '../../utils/landingMotion'
import heroCommunityHomes from '../../assets/img/img12.png'
import heroPortalSlide from '../../assets/img/img10.png'
import heroTenancyHandover from '../../assets/img/img8.png'
import heroFamilyHome from '../../assets/img/img11.png'
import HeroRotatingLead from './HeroRotatingLead'

const heroSlides = [
	{
		src: heroCommunityHomes,
		alt: 'Residential neighbourhood in Assam with traditional and modern homes and families on a community green',
		objectPosition: 'center 42%',
	},
	{
		src: heroTenancyHandover,
		alt: 'Tenancy registration completed with key handover and signed documents in a new home',
		objectPosition: 'center 42%',
	},
	{
		src: heroPortalSlide,
		alt: 'Citizens using the Assam tenancy registration portal',
		objectPosition: 'center 40%',
	},
	{
		src: heroFamilyHome,
		alt: 'Family moving into their newly registered home in Assam',
		objectPosition: 'center 38%',
	},
]

const SLIDE_INTERVAL_MS = 6000

function LandingHero({ navSlot }) {
	const [activeIndex, setActiveIndex] = useState(0)
	const [slideDirection, setSlideDirection] = useState(1)
	const [isPaused, setIsPaused] = useState(false)
	const reduceMotion = useReducedMotion()

	const goToSlideIndex = (index, direction) => {
		const nextIndex =
			((index % heroSlides.length) + heroSlides.length) % heroSlides.length
		if (nextIndex === activeIndex) return
		setSlideDirection(direction)
		setActiveIndex(nextIndex)
	}

	useEffect(() => {
		if (reduceMotion || heroSlides.length <= 1 || isPaused) return undefined
		const timer = setInterval(() => {
			setSlideDirection(1)
			setActiveIndex((prev) => (prev + 1) % heroSlides.length)
		}, SLIDE_INTERVAL_MS)
		return () => clearInterval(timer)
	}, [reduceMotion, isPaused])

	const scrollToHowToApply = (e) => {
		e.preventDefault()
		document.getElementById('portal-guide')?.scrollIntoView({ behavior: 'smooth' })
	}

	const goToSlide = (index) => {
		const nextIndex =
			((index % heroSlides.length) + heroSlides.length) % heroSlides.length
		if (nextIndex === activeIndex) return
		const direction = nextIndex > activeIndex ? 1 : -1
		goToSlideIndex(nextIndex, direction)
	}

	const goToPreviousSlide = () => {
		goToSlideIndex(
			(activeIndex - 1 + heroSlides.length) % heroSlides.length,
			-1,
		)
	}

	const goToNextSlide = () => {
		goToSlideIndex((activeIndex + 1) % heroSlides.length, 1)
	}

	const activeSlide = heroSlides[activeIndex]

	return (
		<section
			className="landing-hero relative isolate overflow-hidden"
			aria-label="Portal introduction"
		>
			{navSlot}
			<div className="landing-hero-media">
				<AnimatePresence initial={false} custom={slideDirection}>
					<motion.img
						key={activeSlide.src}
						src={activeSlide.src}
						alt=""
						className="absolute inset-0 h-full w-full object-cover"
						style={{ objectPosition: activeSlide.objectPosition }}
						custom={slideDirection}
						variants={reduceMotion ? undefined : heroSlideVariants}
						initial={reduceMotion ? false : 'enter'}
						animate={reduceMotion ? { opacity: 1, x: 0 } : 'center'}
						exit={reduceMotion ? undefined : 'exit'}
					/>
				</AnimatePresence>
				<span className="sr-only">{activeSlide.alt}</span>
				<div className="landing-hero-overlay landing-hero-overlay--lr" aria-hidden />
				<div className="landing-hero-overlay landing-hero-overlay--tb" aria-hidden />

				<div className="landing-hero-inner relative z-10 mx-auto flex w-full max-w-7xl px-6 sm:px-10 lg:px-12">
					<motion.div
						className="landing-hero-copy"
						variants={reduceMotion ? undefined : heroCopyContainerVariants}
						initial={reduceMotion ? false : 'hidden'}
						animate={reduceMotion ? undefined : 'visible'}
					>
							<div className="landing-hero-copy__text">
								<motion.h1
									id="hero-heading"
									className="landing-hero-title"
									variants={reduceMotion ? undefined : heroTitleVariants}
								>
									Assam Tenancy Registration and Management System
									<motion.span
										className="landing-hero-title__accent"
										variants={reduceMotion ? undefined : heroAccentLineVariants}
										aria-hidden
									/>
								</motion.h1>
								<motion.p
									className="landing-hero-lead landing-hero-lead--rotating"
									variants={reduceMotion ? undefined : heroLeadVariants}
								>
									<HeroRotatingLead />
								</motion.p>
							</div>
							<motion.div
								className="landing-hero-actions"
								variants={reduceMotion ? undefined : heroActionsContainerVariants}
							>
								<motion.div variants={reduceMotion ? undefined : heroActionItemVariants}>
									<AuthNavLink
										mode="login"
										className="landing-hero-cta landing-hero-cta--primary"
									>
										Apply Now
									</AuthNavLink>
								</motion.div>
								<motion.div variants={reduceMotion ? undefined : heroActionItemVariants}>
									<a
										href="#portal-guide"
										onClick={scrollToHowToApply}
										className="landing-hero-cta landing-hero-cta--ghost"
									>
										How to apply
									</a>
								</motion.div>
							</motion.div>
					</motion.div>
				</div>

				{heroSlides.length > 1 ? (
					<div className="landing-hero-controls">
						<button
							type="button"
							className="landing-hero-carousel-arrow landing-hero-carousel-arrow--prev"
							onClick={goToPreviousSlide}
							aria-label={`Previous slide: ${heroSlides[(activeIndex - 1 + heroSlides.length) % heroSlides.length].alt}`}
						>
							<ChevronLeft className="landing-hero-carousel-arrow-icon" aria-hidden />
						</button>
						<button
							type="button"
							className="landing-hero-carousel-arrow landing-hero-carousel-arrow--next"
							onClick={goToNextSlide}
							aria-label={`Next slide: ${heroSlides[(activeIndex + 1) % heroSlides.length].alt}`}
						>
							<ChevronRight className="landing-hero-carousel-arrow-icon" aria-hidden />
						</button>
						<div className="landing-hero-carousel-nav">
							<button
								type="button"
								className="landing-hero-carousel-pause"
								onClick={() => setIsPaused((p) => !p)}
								aria-pressed={isPaused}
								aria-label={isPaused ? 'Play hero slideshow' : 'Pause hero slideshow'}
								title={isPaused ? 'Play slideshow' : 'Pause slideshow'}
							>
								{isPaused ? (
									<Play className="h-4 w-4" aria-hidden />
								) : (
									<Pause className="h-4 w-4" aria-hidden />
								)}
							</button>
							<div className="flex gap-2" role="tablist" aria-label="Hero background slides">
								{heroSlides.map((slide, index) => (
									<button
										key={slide.src}
										type="button"
										role="tab"
										aria-selected={index === activeIndex}
										aria-label={`Show slide ${index + 1}: ${slide.alt}`}
										className={`landing-hero-carousel-dot ${index === activeIndex ? 'is-active' : ''}`}
										onClick={() => goToSlide(index)}
									/>
								))}
							</div>
						</div>
					</div>
				) : null}
			</div>
		</section>
	)
}

export default LandingHero
