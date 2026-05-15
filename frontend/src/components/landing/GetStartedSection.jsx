import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AuthPanel from './AuthPanel'
import welcomeImage from '../../assets/img/img1.png'
import keysImage from '../../assets/img/img6.png'

const getStartedSlides = [
	{
		src: welcomeImage,
		alt: 'Citizens registering a new tenancy and moving into their home',
		objectPosition: 'center 35%',
	},
	{
		src: keysImage,
		alt: 'Handing over keys after a successful tenancy registration',
		objectPosition: 'center center',
	},
]

function GetStartedImageCarousel() {
	const [activeIndex, setActiveIndex] = useState(0)

	useEffect(() => {
		const timer = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % getStartedSlides.length)
		}, 5500)
		return () => clearInterval(timer)
	}, [])

	return (
		<div
			className="get-started-carousel relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200/80"
			aria-roledescription="carousel"
			aria-label="Get started highlights"
		>
			<div className="relative h-48 sm:h-56 lg:h-64">
				{getStartedSlides.map((slide, index) => (
					<img
						key={slide.alt}
						src={slide.src}
						alt={slide.alt}
						className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
							index === activeIndex ? 'opacity-100' : 'opacity-0'
						}`}
						style={{ objectPosition: slide.objectPosition }}
						loading={index === 0 ? 'eager' : 'lazy'}
						aria-hidden={index !== activeIndex}
					/>
				))}
			</div>
			<div className="absolute inset-x-0 bottom-3 flex justify-center gap-2" role="tablist" aria-label="Carousel slides">
				{getStartedSlides.map((slide, index) => (
					<button
						key={slide.alt}
						type="button"
						role="tab"
						aria-selected={index === activeIndex}
						aria-label={`Go to slide ${index + 1}`}
						className={`get-started-carousel-dot ${index === activeIndex ? 'is-active' : ''}`}
						onClick={() => setActiveIndex(index)}
					/>
				))}
			</div>
		</div>
	)
}

function AudienceCard({ title, description, items }) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<h3 className="landing-card-title">{title}</h3>
			<p className="landing-card-text mt-3">{description}</p>
			<ul className="mt-4 space-y-2 text-sm text-slate-600">
				{items.map((item) => (
					<li key={item} className="flex items-start gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-landing" aria-hidden />
						{item}
					</li>
				))}
			</ul>
		</div>
	)
}

function GetStartedSection({ authPanelProps }) {
	return (
		<section
			id="portal-content"
			className="get-started-section relative z-10 -mt-6 bg-landing-cream pt-10 pb-12 sm:-mt-10 sm:pt-12 sm:pb-16 md:-mt-12 md:pb-20"
			aria-labelledby="get-started-heading"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:gap-10 xl:gap-12">
					<div className="order-2 min-w-0 space-y-8 sm:space-y-10 lg:order-1 lg:space-y-12">
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.4 }}
							className="max-w-2xl"
						>
							<p className="landing-section-eyebrow">Citizen access</p>
							<h2 id="get-started-heading" className="landing-section-title">
								Get started
							</h2>
							<p className="landing-section-lead">
								Register or sign in with your mobile number to apply for tenancy certificates and
								manage your applications online.
							</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.45 }}
						>
							<GetStartedImageCarousel />
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5 }}
						>
							<p className="landing-section-label">Who can use this portal</p>
							<div className="grid gap-6 sm:grid-cols-2">
								<AudienceCard
									title="For Tenants"
									description="Apply for tenancy certificates, track application status, and keep your property records digitally."
									items={[
										'Digital certificate access',
										'Application status tracking',
										'Online services 24x7',
									]}
								/>
								<AudienceCard
									title="For Owners"
									description="Register properties, manage tenant records, and stay aligned with tenancy regulations."
									items={[
										'Property and application dashboard',
										'Digital record management',
										'Status and compliance visibility',
									]}
								/>
							</div>
						</motion.div>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.08 }}
						className="order-1 min-w-0 lg:order-2 lg:sticky lg:top-6 xl:top-8"
					>
						<AuthPanel {...authPanelProps} />
					</motion.div>
				</div>
			</div>
		</section>
	)
}

export default GetStartedSection
