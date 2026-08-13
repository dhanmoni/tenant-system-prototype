import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { HERO_SLIDE_DEFS } from '../../data/heroSlides'
import { useLanguage } from '../../i18n'

const SLIDE_INTERVAL_MS = 3000

function logicalFromTrack(trackIndex, count) {
	if (count <= 1) return 0
	if (trackIndex === 0) return count - 1
	if (trackIndex === count + 1) return 0
	return trackIndex - 1
}

function LandingHero() {
	const { t } = useLanguage()
	const [trackIndex, setTrackIndex] = useState(1)
	const [instant, setInstant] = useState(false)
	const [isPaused, setIsPaused] = useState(false)
	const [slideProgress, setSlideProgress] = useState(0)
	const progressRef = useRef(0)
	const reduceMotion = useReducedMotion()

	const heroSlides = useMemo(
		() =>
			HERO_SLIDE_DEFS.map((slide) => ({
				...slide,
				alt: t(slide.altKey),
			})),
		[t],
	)

	const count = heroSlides.length
	const looped = count > 1
	const logicalIndex = logicalFromTrack(trackIndex, count)
	const activeSlide = heroSlides[logicalIndex] ?? heroSlides[0]

	const trackSlides = useMemo(() => {
		if (!looped) {
			return heroSlides.map((slide, realIndex) => ({
				...slide,
				key: `real-${realIndex}`,
				realIndex,
			}))
		}
		const last = heroSlides[count - 1]
		const first = heroSlides[0]
		return [
			{ ...last, key: 'clone-start', realIndex: count - 1 },
			...heroSlides.map((slide, realIndex) => ({
				...slide,
				key: `real-${realIndex}`,
				realIndex,
			})),
			{ ...first, key: 'clone-end', realIndex: 0 },
		]
	}, [heroSlides, looped, count])

	const goToLogical = (index) => {
		const next =
			((index % count) + count) % count
		if (next === logicalIndex && trackIndex > 0 && trackIndex < count + 1) return
		setTrackIndex(next + 1)
	}

	const goToNextSlide = () => {
		if (!looped) return
		setTrackIndex((prev) => Math.min(prev + 1, count + 1))
	}

	const goToPreviousSlide = () => {
		if (!looped) return
		setTrackIndex((prev) => Math.max(prev - 1, 0))
	}

	useEffect(() => {
		if (instant) return undefined
		progressRef.current = 0
		setSlideProgress(0)
		return undefined
	}, [logicalIndex, instant])

	useLayoutEffect(() => {
		if (!instant) return undefined
		const frame = requestAnimationFrame(() => {
			requestAnimationFrame(() => setInstant(false))
		})
		return () => cancelAnimationFrame(frame)
	}, [instant])

	useEffect(() => {
		if (!looped) return undefined
		if (trackIndex !== 0 && trackIndex !== count + 1) return undefined
		if (reduceMotion) {
			setInstant(true)
			setTrackIndex(trackIndex === 0 ? count : 1)
			return undefined
		}
		const timer = window.setTimeout(() => {
			setInstant(true)
			setTrackIndex((prev) => {
				if (prev === count + 1) return 1
				if (prev === 0) return count
				return prev
			})
		}, 1180)
		return () => window.clearTimeout(timer)
	}, [trackIndex, looped, count, reduceMotion])

	useEffect(() => {
		if (reduceMotion || !looped || isPaused || instant) return undefined

		let frameId = 0
		let lastTs = performance.now()

		const tick = (now) => {
			const delta = now - lastTs
			lastTs = now
			const next = Math.min(1, progressRef.current + delta / SLIDE_INTERVAL_MS)
			progressRef.current = next
			setSlideProgress(next)

			if (next >= 1) {
				setTrackIndex((prev) => Math.min(prev + 1, count + 1))
				return
			}

			frameId = requestAnimationFrame(tick)
		}

		frameId = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(frameId)
	}, [reduceMotion, isPaused, looped, count, logicalIndex, instant])

	const snapIfClone = () => {
		if (!looped) return
		if (trackIndex === count + 1) {
			setInstant(true)
			setTrackIndex(1)
		} else if (trackIndex === 0) {
			setInstant(true)
			setTrackIndex(count)
		}
	}

	const progressForIndex = (index) => {
		if (reduceMotion) return index === logicalIndex ? 1 : 0
		if (index < logicalIndex) return 1
		if (index === logicalIndex) return slideProgress
		return 0
	}

	const displayIndex = looped ? trackIndex : 0

	return (
		<section
			id="landing-hero"
			className="landing-hero relative isolate overflow-hidden"
			aria-label={t('hero.aria')}
		>
			<div className="landing-hero-media">
				<div
					className={`landing-hero-track${
						reduceMotion || instant ? ' is-instant' : ''
					}`}
					style={{ transform: `translate3d(-${displayIndex * 100}%, 0, 0)` }}
					onTransitionEnd={(event) => {
						if (event.target !== event.currentTarget) return
						if (event.propertyName && event.propertyName !== 'transform') return
						snapIfClone()
					}}
				>
					{trackSlides.map((slide) => (
						<div
							key={slide.key}
							className="landing-hero-slide"
							aria-hidden={slide.realIndex !== logicalIndex}
						>
							<img
								src={slide.src}
								alt=""
								fetchPriority={slide.lcp ? 'high' : 'low'}
								className="landing-hero-slide-img"
								style={{ objectPosition: slide.objectPosition }}
							/>
						</div>
					))}
				</div>
				<h1 id="hero-heading" className="sr-only">
					{t('gov.portalSystem')}
				</h1>
				<span className="sr-only">{activeSlide.alt}</span>
				<div className="landing-hero-overlay landing-hero-overlay--lr" aria-hidden />
				<div className="landing-hero-overlay landing-hero-overlay--tb" aria-hidden />

				{looped ? (
					<div className="landing-hero-controls">
						<button
							type="button"
							className="landing-hero-carousel-arrow landing-hero-carousel-arrow--prev"
							onClick={goToPreviousSlide}
							aria-label={t('hero.prevSlide', {
								alt: heroSlides[(logicalIndex - 1 + count) % count].alt,
							})}
						>
							<ChevronLeft className="landing-hero-carousel-arrow-icon" aria-hidden />
						</button>
						<button
							type="button"
							className="landing-hero-carousel-arrow landing-hero-carousel-arrow--next"
							onClick={goToNextSlide}
							aria-label={t('hero.nextSlide', {
								alt: heroSlides[(logicalIndex + 1) % count].alt,
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
							<div
								className="landing-hero-carousel-progress-list"
								role="tablist"
								aria-label={t('hero.slides')}
							>
								{heroSlides.map((slide, index) => {
									const fill = progressForIndex(index)
									return (
										<button
											key={slide.src}
											type="button"
											role="tab"
											aria-selected={index === logicalIndex}
											aria-label={t('hero.showSlide', {
												n: index + 1,
												alt: slide.alt,
											})}
											className={`landing-hero-carousel-progress${
												index === logicalIndex ? ' is-active' : ''
											}${fill >= 1 ? ' is-complete' : ''}`}
											onClick={() => goToLogical(index)}
										>
											<span
												className="landing-hero-carousel-progress__fill"
												style={{ transform: `scaleX(${fill})` }}
												aria-hidden
											/>
										</button>
									)
								})}
							</div>
						</div>
					</div>
				) : null}
			</div>
		</section>
	)
}

export default LandingHero
