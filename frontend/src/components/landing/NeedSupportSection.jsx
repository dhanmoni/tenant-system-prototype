import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import supportImage from '../../assets/img/img1.png'

function NeedSupportSection() {
	const sectionRef = useRef(null)
	const reduceMotion = useReducedMotion()
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	})
	const backgroundY = useTransform(scrollYProgress, (progress) =>
		reduceMotion ? 0 : (progress - 0.5) * 100,
	)

	return (
		<section
			ref={sectionRef}
			className="relative overflow-hidden bg-[#111111] text-white"
			aria-labelledby="need-support-heading"
		>
			<motion.div
				className="pointer-events-none absolute inset-x-0 top-[-15%] z-0 h-[130%] scale-105 bg-cover bg-center bg-no-repeat will-change-transform"
				style={{
					backgroundImage: `url(${supportImage})`,
					y: backgroundY,
				}}
				aria-hidden
			/>
			<div className="pointer-events-none absolute inset-0 z-[1] bg-[#111111]/82 sm:bg-gradient-to-r sm:from-[#111111]/95 sm:via-[#111111]/88 sm:to-[#111111]/55" aria-hidden />
			<div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-14 sm:flex-row sm:items-center sm:px-6 sm:py-16 lg:px-8">
				<div className="max-w-xl">
					<h2 id="need-support-heading" className="text-3xl font-bold sm:text-4xl">
						Need Support?
					</h2>
					<p className="mt-3 text-base text-white/75 sm:text-lg">
						Reach out to us and we will get back to you
					</p>
				</div>
				<Link
					to="/contact"
					className="inline-flex shrink-0 items-center gap-2 rounded-md border border-white/90 bg-transparent px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
				>
					Get in touch
					<ArrowUpRight className="h-4 w-4" aria-hidden />
				</Link>
			</div>
		</section>
	)
}

export default NeedSupportSection
