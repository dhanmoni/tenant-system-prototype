import heroCommunityHomes from '../assets/img/HeroBanner10.1.webp'
import heroBannerTwelve from '../assets/img/HeroBanner12.1.webp'
import heroBannerFourteen from '../assets/img/HeroBanner5.1.webp'

/** Stable public URL so index.html can preload / paint before JS */
export const HERO_LCP_SRC = '/hero-lcp.webp'

export const HERO_SLIDE_DEFS = [
	{
		src: HERO_LCP_SRC,
		altKey: 'hero.slide5Alt',
		objectPosition: 'center center',
		lcp: true,
	},
	{
		src: heroCommunityHomes,
		altKey: 'hero.slide1Alt',
		objectPosition: 'center 42%',
	},
	{
		src: heroBannerFourteen,
		altKey: 'hero.slide6Alt',
		objectPosition: 'center center',
	},
	{
		src: heroBannerTwelve,
		altKey: 'hero.slide4Alt',
		objectPosition: 'center 42%',
	},
	{
		src: '/hero-slide-last.webp',
		altKey: 'hero.slide3Alt',
		objectPosition: 'center center',
	},
]
