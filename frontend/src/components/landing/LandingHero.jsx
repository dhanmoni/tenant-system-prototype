import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import AuthNavLink from './AuthNavLink'
import heroBanner from '../../assets/img/banner.png'
import heroKeysSlide from '../../assets/img/img7.png'

const heroSlides = [
	{
		src: heroBanner,
		alt: 'Modern residential community representing tenancy and housing',
		objectPosition: 'center center',
	},
	{
		src: heroKeysSlide,
		alt: 'Ceremonial handover of keys for a registered tenancy in Assam',
		objectPosition: 'center 40%',
	},
]

const SLIDE_INTERVAL_MS = 6000

function LandingHero({ navSlot }) {
	const heroRef = useRef(null)
	const [activeIndex, setActiveIndex] = useState(0)
	const reduceMotion = useReducedMotion()
	const { scrollYProgress } = useScroll({
		target: heroRef,
		offset: ['start start', 'end start'],
	})
	const backgroundY = useTransform(scrollYProgress, (progress) =>
		reduceMotion ? 0 : progress * 140,
	)

	useEffect(() => {
		if (reduceMotion || heroSlides.length <= 1) return undefined
		const timer = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % heroSlides.length)
		}, SLIDE_INTERVAL_MS)
		return () => clearInterval(timer)
	}, [reduceMotion])

	const scrollToContent = () => {
		document.getElementById('portal-content')?.scrollIntoView({ behavior: 'smooth' })
	}

	const scrollToHowToApply = (e) => {
		e.preventDefault()
		document.getElementById('how-to-apply')?.scrollIntoView({ behavior: 'smooth' })
	}

	const activeSlide = heroSlides[activeIndex]

	const slideTransition = reduceMotion
		? { duration: 0 }
		: { duration: 1.1, ease: [0.4, 0, 0.2, 1] }

	return (
		<section
			ref={heroRef}
			className="landing-hero relative isolate min-h-[108dvh] min-h-screen overflow-hidden"
			aria-label="Portal introduction"
		>
			{navSlot}
			<motion.div
				className="absolute inset-x-0 top-[-12%] z-0 h-[124%] will-change-transform"
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
			<div
				className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0c1f3d]/92 via-[#0c1f3d]/55 to-[#0c1f3d]/20"
				aria-hidden
			/>
			<div
				className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0c1f3d]/40 via-transparent to-transparent"
				aria-hidden
			/>
			<div className="landing-hero-inner relative z-10 mx-auto flex min-h-[108dvh] min-h-screen max-w-7xl items-center px-4 pb-32 pt-[6.25rem] sm:px-6 sm:pb-40 sm:pt-28 md:pb-44 md:pt-32 lg:px-8">
				<motion.div
					initial={{ opacity: 0, x: -32 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, ease: 'easeOut' }}
					className="relative max-w-2xl"
				>
					<p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/80 sm:text-sm sm:tracking-[0.2em]">
						Government of Assam
					</p>
					<h1 className="text-2xl font-black uppercase leading-tight tracking-wide text-white sm:text-3xl md:text-4xl lg:text-5xl">
						Digital Tenancy Records for Assam
					</h1>
					<div className="mt-5 h-1.5 w-24 rounded-full bg-landing" aria-hidden />
					<p className="mt-6 text-lg font-medium text-white/90 sm:text-xl">
						A step towards a secured future
					</p>
					<p className="mt-4 max-w-xl text-base leading-relaxed text-white/75">
						Apply for tenancy certificates online, track your application status in real-time,
						and download digitally signed documents — all from one portal.
					</p>

					<div className="landing-hero-actions mt-8 flex w-full max-w-md flex-col gap-4 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
						<AuthNavLink
							mode="login"
							className="landing-hero-cta landing-hero-cta--primary w-full justify-center sm:w-auto"
						>
							Apply Now
						</AuthNavLink>
						<a
							href="#how-to-apply"
							onClick={scrollToHowToApply}
							className="landing-hero-cta-secondary text-sm font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline"
						>
							See how to apply
						</a>
					</div>
				</motion.div>
			</div>

			<div
				className="landing-hero-carousel-nav absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-28"
				role="tablist"
				aria-label="Hero background slides"
			>
				{heroSlides.map((slide, index) => (
					<button
						key={slide.src}
						type="button"
						role="tab"
						aria-selected={index === activeIndex}
						aria-label={`Show slide ${index + 1}: ${slide.alt}`}
						className={`landing-hero-carousel-dot ${index === activeIndex ? 'is-active' : ''}`}
						onClick={() => setActiveIndex(index)}
					/>
				))}
			</div>

			<button
				type="button"
				onClick={scrollToContent}
				className="landing-hero-scroll absolute bottom-14 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1 sm:bottom-16"
				aria-label="Scroll down to explore the portal"
			>
				<span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
				<ChevronDown className="h-7 w-7 animate-bounce" aria-hidden />
			</button>
		</section>
	)
}

export default LandingHero
