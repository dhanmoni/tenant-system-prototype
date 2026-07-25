import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { heroSlideVariants } from '../../utils/landingMotion'
import heroCommunityHomes from '../../assets/img/HeroBanner5.1.webp'
import heroPortalSlide from '../../assets/img/HeroBanner4.1.webp'
import { useLanguage } from '../../i18n'

const SLIDE_INTERVAL_MS = 6000

function LandingHero({ navSlot }) {
	const { t } = useLanguage()
	const [activeIndex, setActiveIndex] = useState(0)
	const [slideDirection, setSlideDirection] = useState(1)
	const [isPaused, setIsPaused] = useState(false)
	const reduceMotion = useReducedMotion()

	const heroSlides = useMemo(
		() => [
			{
				src: heroPortalSlide,
				alt: t('hero.slide3Alt'),
				objectPosition: 'center center',
			},
			{
				src: heroCommunityHomes,
				alt: t('hero.slide1Alt'),
				objectPosition: 'center 42%',
			},
		],
		[t],
	)

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
	}, [reduceMotion, isPaused, heroSlides.length])

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
			id="landing-hero"
			className="landing-hero relative isolate overflow-hidden"
			aria-label={t('hero.aria')}
		>
			{navSlot}
			<div className="landing-hero-media">
				<AnimatePresence initial={false} custom={slideDirection}>
					<motion.div
						key={activeSlide.src}
						className="absolute inset-0 overflow-hidden"
						custom={slideDirection}
						variants={reduceMotion ? undefined : heroSlideVariants}
						initial={reduceMotion ? false : 'enter'}
						animate={reduceMotion ? { opacity: 1, x: 0 } : 'center'}
						exit={reduceMotion ? undefined : 'exit'}
					>
						<img
							src={activeSlide.src}
							alt=""
							className="absolute inset-0 h-full w-full object-cover"
							style={{
								objectPosition: activeSlide.objectPosition,
							}}
						/>
					</motion.div>
				</AnimatePresence>
				<h1 id="hero-heading" className="sr-only">
					{t('gov.portalSystem')}
				</h1>
				<span className="sr-only">{activeSlide.alt}</span>
				<div className="landing-hero-overlay landing-hero-overlay--lr" aria-hidden />
				<div className="landing-hero-overlay landing-hero-overlay--tb" aria-hidden />

				{heroSlides.length > 1 ? (
					<div className="landing-hero-controls">
						<button
							type="button"
							className="landing-hero-carousel-arrow landing-hero-carousel-arrow--prev"
							onClick={goToPreviousSlide}
							aria-label={t('hero.prevSlide', {
								alt: heroSlides[(activeIndex - 1 + heroSlides.length) % heroSlides.length].alt,
							})}
						>
							<ChevronLeft className="landing-hero-carousel-arrow-icon" aria-hidden />
						</button>
						<button
							type="button"
							className="landing-hero-carousel-arrow landing-hero-carousel-arrow--next"
							onClick={goToNextSlide}
							aria-label={t('hero.nextSlide', {
								alt: heroSlides[(activeIndex + 1) % heroSlides.length].alt,
							})}
						>
							<ChevronRight className="landing-hero-carousel-arrow-icon" aria-hidden />
						</button>
						<div className="landing-hero-carousel-nav">
							<button
								type="button"
								className="landing-hero-carousel-pause"
								onClick={() => setIsPaused((p) => !p)}
								aria-pressed={isPaused}
								aria-label={isPaused ? t('hero.play') : t('hero.pause')}
								title={isPaused ? t('hero.playTitle') : t('hero.pauseTitle')}
							>
								{isPaused ? (
									<Play className="h-4 w-4" aria-hidden />
								) : (
									<Pause className="h-4 w-4" aria-hidden />
								)}
							</button>
							<div className="flex gap-2" role="tablist" aria-label={t('hero.slides')}>
								{heroSlides.map((slide, index) => (
									<button
										key={slide.src}
										type="button"
										role="tab"
										aria-selected={index === activeIndex}
										aria-label={t('hero.showSlide', { n: index + 1, alt: slide.alt })}
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
