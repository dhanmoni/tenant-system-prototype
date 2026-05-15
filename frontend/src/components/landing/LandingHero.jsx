import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const HERO_IMAGE = '/TCP-Images/TCP-Office.jpg'

function LandingHero({ navSlot }) {
	const scrollToContent = () => {
		document.getElementById('portal-content')?.scrollIntoView({ behavior: 'smooth' })
	}

	return (
		<section
			className="relative isolate min-h-screen overflow-hidden"
			aria-label="Portal introduction"
		>
			{navSlot}
			<div
				className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: `url(${HERO_IMAGE})` }}
				role="img"
				aria-label="Assam landscape and rural development backdrop"
			/>
			<div
				className="absolute inset-0 z-[1] bg-gradient-to-r from-black/85 via-black/55 to-black/10"
				aria-hidden
			/>
			<div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-40 pt-32 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, x: -32 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6, ease: 'easeOut' }}
					className="relative max-w-2xl"
				>
					<p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
						Government of Assam
					</p>
					<h1 className="text-3xl font-black uppercase leading-tight tracking-wide text-white sm:text-4xl lg:text-5xl">
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
				</motion.div>
			</div>

			<button
				type="button"
				onClick={scrollToContent}
				className="landing-hero-scroll absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1"
				aria-label="Scroll down to explore the portal"
			>
				<span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
				<ChevronDown className="h-7 w-7 animate-bounce" aria-hidden />
			</button>
		</section>
	)
}

export default LandingHero
