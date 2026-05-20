import { useEffect, useState } from 'react'
import bannerImage from '../../assets/img/banner.png'
import welcomeImage from '../../assets/img/img1.png'
import aboutImage from '../../assets/img/img4.png'

const defaultSlides = [
	{
		title: 'Property & tenancy records',
		subtitle:
			'Register properties, manage landlord–tenant records, and stay aligned with housing department guidelines — in one place.',
		image: aboutImage,
	},
	{
		title: 'Digital Tenancy Registration',
		subtitle:
			'Apply for tenancy certificates online, track your application status in real-time, and download digitally signed documents.',
		image: bannerImage,
	},
	{
		title: 'Transparent, accessible services',
		subtitle:
			'Citizen-centric workflows, status tracking, and digital records built for tenants, owners, and public authorities.',
		image: welcomeImage,
	},
	{
		title: 'Housing & tenancy in one place',
		subtitle:
			'Register tenancies, manage landlord–tenant records, and access department services with a modern, citizen-friendly portal.',
		image: '/TCP-Images/TCP-Office2.jpg',
	},
]

const SLIDE_INTERVAL_MS = 5000

function PublicPageHero({ slides = defaultSlides }) {
	const [slideIndex, setSlideIndex] = useState(0)

	useEffect(() => {
		if (slides.length <= 1) return undefined
		const timer = setInterval(() => {
			setSlideIndex((prev) => (prev + 1) % slides.length)
		}, SLIDE_INTERVAL_MS)
		return () => clearInterval(timer)
	}, [slides.length])

	return (
		<section className="public-page-hero" aria-label="Page highlights">
			<div className="public-page-hero__banner">
				{slides.map((slide, index) => (
					<div
						key={slide.title}
						className={`public-page-hero__slide ${index === slideIndex ? 'is-active' : ''}`}
						aria-hidden={index !== slideIndex}
					>
						<div
							className="public-page-hero__bg"
							style={{ backgroundImage: `url(${slide.image})` }}
						/>
						<div className="public-page-hero__scrim" aria-hidden />
						<div className="public-page-hero__inner">
							<div className="public-page-hero__copy">
								<p className="public-page-hero__eyebrow">Highlights</p>
								<h2 className="public-page-hero__title">{slide.title}</h2>
								<p className="public-page-hero__subtitle">{slide.subtitle}</p>
								<div
									className="public-page-hero__dots"
									role="tablist"
									aria-label="Highlight slides"
								>
									{slides.map((_, dotIndex) => (
										<button
											key={`dot-${dotIndex}`}
											type="button"
											className={`public-page-hero__dot ${dotIndex === slideIndex ? 'is-active' : ''}`}
											onClick={() => setSlideIndex(dotIndex)}
											aria-label={`Go to slide ${dotIndex + 1}`}
											aria-selected={dotIndex === slideIndex}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}

export default PublicPageHero
