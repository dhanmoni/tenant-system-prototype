import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import AuthNavLink from './AuthNavLink'
import heroCommunityHomes from '../../assets/img/img12.png'
import heroPortalSlide from '../../assets/img/img10.png'
import heroTenancyHandover from '../../assets/img/img8.png'
import heroFamilyHome from '../../assets/img/img11.png'

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
	const heroRef = useRef(null)
	const [activeIndex, setActiveIndex] = useState(0)
	const [isPaused, setIsPaused] = useState(false)
	const reduceMotion = useReducedMotion()
	const { scrollYProgress } = useScroll({
		target: heroRef,
		offset: ['start start', 'end start'],
	})
	const backgroundY = useTransform(scrollYProgress, (progress) =>
		reduceMotion ? 0 : progress * 140,
	)

	useEffect(() => {
		if (reduceMotion || heroSlides.length <= 1 || isPaused) return undefined
		const timer = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % heroSlides.length)
		}, SLIDE_INTERVAL_MS)
		return () => clearInterval(timer)
	}, [reduceMotion, isPaused])

	const scrollToHowToApply = (e) => {
		e.preventDefault()
		document.getElementById('portal-guide')?.scrollIntoView({ behavior: 'smooth' })
	}

	const goToSlide = (index) => {
		setActiveIndex(((index % heroSlides.length) + heroSlides.length) % heroSlides.length)
	}

	const goToPreviousSlide = () => {
		setActiveIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
	}

	const goToNextSlide = () => {
		setActiveIndex((prev) => (prev + 1) % heroSlides.length)
	}

	const activeSlide = heroSlides[activeIndex]

	const slideTransition = reduceMotion
		? { duration: 0 }
		: { duration: 1.1, ease: [0.4, 0, 0.2, 1] }

	return (
		<section
			ref={heroRef}
			className="landing-hero relative isolate overflow-hidden"
			aria-label="Portal introduction"
		>
			{navSlot}
			<div className="landing-hero-media">
				<motion.div
					className="landing-hero-parallax"
					style={{ y: backgroundY }}
					aria-hidden
				>
					<AnimatePresence mode="sync" initial={false}>
						<motion.img
							key={activeSlide.src}
							src={activeSlide.src}
							alt=""
							className="absolute inset-0 h-full w-full scale-105 object-cover"
							style={{ objectPosition: activeSlide.objectPosition }}
							initial={reduceMotion ? false : { opacity: 0, scale: 1.08 }}
							animate={{ opacity: 1, scale: 1.05 }}
							exit={reduceMotion ? undefined : { opacity: 0, scale: 1.02 }}
							transition={slideTransition}
						/>
					</AnimatePresence>
				</motion.div>
				<span className="sr-only">{activeSlide.alt}</span>
				<div className="landing-hero-overlay landing-hero-overlay--lr" aria-hidden />
				<div className="landing-hero-overlay landing-hero-overlay--tb" aria-hidden />

				<div className="landing-hero-inner relative z-10 mx-auto flex w-full max-w-7xl px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, x: -28 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, ease: 'easeOut' }}
						className="landing-hero-copy"
					>
						<h1 id="hero-heading" className="landing-hero-title">
							Digital Tenancy Records for Assam
						</h1>
						<p className="landing-hero-lead">
							Apply for your certificate, track your application, and download digitally signed
							documents when approved.
						</p>
						<div className="landing-hero-actions">
							<AuthNavLink
								mode="login"
								className="landing-hero-cta landing-hero-cta--primary"
							>
								Apply Now
							</AuthNavLink>
						<a
							href="#portal-guide"
							onClick={scrollToHowToApply}
							className="landing-hero-cta landing-hero-cta--ghost"
						>
							<span className="landing-hero-cta-label landing-hero-cta-label--short">
								How to apply
							</span>
							<span className="landing-hero-cta-label landing-hero-cta-label--long">
								See how to apply
							</span>
						</a>
						</div>
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

