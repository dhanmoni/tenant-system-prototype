/** Shared motion presets for landing section intros (respect reduced motion in components). */

export const easePlayful = [0.34, 1.45, 0.64, 1]
export const easeOutExpo = [0.22, 1, 0.36, 1]

/** Shared landing section entrance — large fade-in-up */
export const fadeInUpBigVariants = {
	hidden: { opacity: 0, y: 80 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 1.05,
			ease: easeOutExpo,
			when: 'beforeChildren',
			staggerChildren: 0.12,
			delayChildren: 0.1,
		},
	},
}

/* ── Modern scroll intros (Services / Stats / Benefits) ── */
export const scrollSectionVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.14,
			delayChildren: 0.02,
		},
	},
}

export const scrollHeaderVariants = {
	hidden: { opacity: 0, y: 36 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.58,
			ease: easeOutExpo,
			staggerChildren: 0.1,
			delayChildren: 0.04,
		},
	},
}

export const servicesTitleWordVariants = {
	hidden: { opacity: 0, y: 22, rotate: -4, scale: 0.86 },
	visible: {
		opacity: 1,
		y: 0,
		rotate: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 380,
			damping: 16,
			mass: 0.72,
		},
	},
}

export const servicesTitleAccentVariants = {
	hidden: { opacity: 0, y: 28, scale: 0.68, rotate: -7 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 420,
			damping: 13,
			mass: 0.62,
			delay: 0.1,
		},
	},
}

export const scrollCtaVariants = {
	hidden: { opacity: 0, y: 18, scale: 0.96 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 320,
			damping: 24,
		},
	},
}

export const scrollGridVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.06,
		},
	},
}

export const scrollCardVariants = {
	hidden: { opacity: 0, y: 48, scale: 0.92 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 260,
			damping: 22,
			mass: 0.9,
		},
	},
}

/** Shared ladder timing for cards + connector paths */
export const SERVICES_LADDER = {
	delayChildren: 0.12,
	stagger: 0.42,
	/** Connector draws after its left-hand card lands */
	segmentLead: 0.28,
	segmentDuration: 0.48,
}

/** Portal services — ladder climb low → high */
export const servicesGridVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: SERVICES_LADDER.stagger,
			delayChildren: SERVICES_LADDER.delayChildren,
		},
	},
}

export const servicesCardVariants = {
	hidden: (i = 0) => ({
		opacity: 0,
		y: 64 + (3 - i) * 36,
		scale: 0.9,
	}),
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 240,
			damping: 20,
			mass: 0.92,
		},
	},
}

export const servicesCardHover = {
	y: -8,
	transition: { type: 'spring', stiffness: 380, damping: 22 },
}

export const servicesCardTap = {
	y: -2,
	scale: 0.985,
	transition: { type: 'spring', stiffness: 480, damping: 28 },
}

/** Portal benefits — one-by-one cascade into view */
export const benefitsModernGridVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.28,
			delayChildren: 0.22,
		},
	},
}

export const benefitsModernCardVariants = {
	hidden: (i = 0) => ({
		opacity: 0,
		x: 48,
		y: 32 + i * 12,
		scale: 0.92,
	}),
	visible: {
		opacity: 1,
		x: 0,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 220,
			damping: 18,
			mass: 0.88,
		},
	},
}

export const benefitsModernCardHover = {
	y: -6,
	x: 4,
	transition: { type: 'spring', stiffness: 380, damping: 22 },
}

export const benefitsModernCardTap = {
	scale: 0.985,
	transition: { type: 'spring', stiffness: 480, damping: 28 },
}

export const benefitsIntroVariants = {
	hidden: { opacity: 0, y: 36 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: easeOutExpo,
			staggerChildren: 0.1,
			delayChildren: 0.04,
		},
	},
}

export const benefitsTitleWordVariants = {
	hidden: { opacity: 0, y: 22, rotate: -5, scale: 0.86 },
	visible: {
		opacity: 1,
		y: 0,
		rotate: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 380,
			damping: 16,
			mass: 0.72,
		},
	},
}

export const benefitsTitleAccentVariants = {
	hidden: { opacity: 0, y: 28, scale: 0.68, rotate: 8 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 420,
			damping: 13,
			mass: 0.62,
			delay: 0.12,
		},
	},
}

/** How it works — timeline cascade (numbers pop, steps slide along a path) */
export const guideSectionVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.16,
			delayChildren: 0.04,
		},
	},
}

export const guideIntroVariants = {
	hidden: { opacity: 0, y: 36 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.62,
			ease: easeOutExpo,
			staggerChildren: 0.1,
			delayChildren: 0.04,
		},
	},
}

export const guideTitleWordVariants = {
	hidden: { opacity: 0, y: 22, rotate: -4, scale: 0.86 },
	visible: {
		opacity: 1,
		y: 0,
		rotate: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 380,
			damping: 16,
			mass: 0.72,
		},
	},
}

export const guideTitleAccentVariants = {
	hidden: { opacity: 0, y: 28, scale: 0.7, rotate: -8 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 420,
			damping: 14,
			mass: 0.65,
			delay: 0.12,
		},
	},
}

export const guideStepsVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.22,
			delayChildren: 0.18,
		},
	},
}

export const guideStepVariants = {
	hidden: {
		opacity: 0,
		x: -42,
		y: 18,
		scale: 0.96,
	},
	visible: {
		opacity: 1,
		x: 0,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 240,
			damping: 20,
			mass: 0.9,
			staggerChildren: 0.1,
			delayChildren: 0.04,
		},
	},
}

export const guideStepNumVariants = {
	hidden: { opacity: 0, scale: 0.25, rotate: -24 },
	visible: {
		opacity: 1,
		scale: 1,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 460,
			damping: 14,
			mass: 0.65,
		},
	},
}

export const guideStepCopyVariants = {
	hidden: { opacity: 0, x: -16 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			type: 'spring',
			stiffness: 280,
			damping: 24,
		},
	},
}

export const guideAccessVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.14,
			delayChildren: 0.06,
		},
	},
}

export const guideAsideVariants = {
	hidden: { opacity: 0, x: -40, y: 16 },
	visible: {
		opacity: 1,
		x: 0,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 260,
			damping: 24,
			mass: 0.9,
		},
	},
}

export const guidePanelVariants = {
	hidden: { opacity: 0, x: 40, y: 16 },
	visible: {
		opacity: 1,
		x: 0,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 260,
			damping: 24,
			mass: 0.9,
			staggerChildren: 0.08,
			delayChildren: 0.12,
		},
	},
}

export const guideActionVariants = {
	hidden: { opacity: 0, y: 18, scale: 0.96 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 320,
			damping: 22,
		},
	},
}

/** FAQ — accordion stack (items unfold downward on scroll) */
export const faqSectionVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.14,
			delayChildren: 0.04,
		},
	},
}

export const faqIntroVariants = {
	hidden: { opacity: 0, y: 34 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.58,
			ease: easeOutExpo,
			staggerChildren: 0.1,
			delayChildren: 0.04,
		},
	},
}

export const faqTitleWordVariants = {
	hidden: { opacity: 0, y: 20, scale: 0.88 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 360,
			damping: 17,
			mass: 0.72,
		},
	},
}

export const faqTitleAccentVariants = {
	hidden: { opacity: 0, y: 26, scale: 0.72, rotate: 6 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 400,
			damping: 14,
			mass: 0.65,
			delay: 0.1,
		},
	},
}

export const faqListVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.14,
			delayChildren: 0.14,
		},
	},
}

export const faqItemVariants = {
	hidden: {
		opacity: 0,
		y: -36,
		scale: 0.96,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 280,
			damping: 20,
			mass: 0.82,
		},
	},
}

export const scrollStatSectionVariants = fadeInUpBigVariants

export const scrollStatRailVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.14,
			delayChildren: 0.22,
		},
	},
}

export const scrollStatItemVariants = {
	hidden: { opacity: 0, y: 42 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.85,
			ease: easeOutExpo,
			staggerChildren: 0.08,
			delayChildren: 0.04,
		},
	},
}

export const scrollStatIconVariants = {
	hidden: { opacity: 0, y: 22 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.7,
			ease: easeOutExpo,
		},
	},
}

export const scrollStatLabelVariants = {
	hidden: { opacity: 0, y: 18 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.7,
			ease: easeOutExpo,
		},
	},
}

export const introContainerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08, delayChildren: 0.04 },
	},
}

export const introEyebrowVariants = {
	hidden: { opacity: 0, y: 14, scale: 0.88 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: 'spring', stiffness: 400, damping: 18 },
	},
}

export const introTitleVariants = {
	hidden: { opacity: 0, y: 28, scale: 0.97 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: 'spring', stiffness: 360, damping: 26, mass: 0.8 },
	},
}

export const introLineVariants = {
	hidden: { scaleX: 0, opacity: 0 },
	visible: {
		scaleX: 1,
		opacity: 1,
		transition: { duration: 0.6, ease: easePlayful, delay: 0.12 },
	},
}

export const introLeadVariants = {
	hidden: { opacity: 0, y: 18 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 360, damping: 26, mass: 0.8 },
	},
}

export const introSparkVariants = {
	hidden: { opacity: 0, scale: 0 },
	visible: (i = 0) => ({
		opacity: 1,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 520,
			damping: 12,
			delay: 0.28 + i * 0.08,
		},
	}),
}

export const promoItemVariants = {
	hidden: { opacity: 0, y: 22, x: 16, rotate: 1.5 },
	visible: {
		opacity: 1,
		y: 0,
		x: 0,
		rotate: 0,
		transition: { type: 'spring', stiffness: 320, damping: 20 },
	},
}

export const cardPopVariants = {
	hidden: { opacity: 0, y: 28, scale: 0.92, rotate: -2 },
	visible: (i = 0) => ({
		opacity: 1,
		y: 0,
		scale: 1,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 340,
			damping: 19,
			delay: i * 0.08,
		},
	}),
}

/** Portal services showcase — two-column card grid */
export const showcaseGridVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.2, delayChildren: 0.12 },
	},
}

export const showcaseColumnVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.11, delayChildren: 0.04 },
	},
}

export const showcaseCardFromLeftVariants = {
	hidden: { opacity: 0, x: -44, y: 36, scale: 0.86, rotate: -5 },
	visible: (i = 0) => ({
		opacity: 1,
		x: 0,
		y: 0,
		scale: 1,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 380,
			damping: 24,
			mass: 0.88,
			delay: i * 0.1,
		},
	}),
}

export const showcaseCardFromRightVariants = {
	hidden: { opacity: 0, x: 44, y: 36, scale: 0.86, rotate: 5 },
	visible: (i = 0) => ({
		opacity: 1,
		x: 0,
		y: 0,
		scale: 1,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 380,
			damping: 24,
			mass: 0.88,
			delay: 0.06 + i * 0.1,
		},
	}),
}

export const showcaseCardHover = {
	y: -10,
	scale: 1.03,
	transition: { type: 'spring', stiffness: 420, damping: 22 },
}

/** Landing hero — one-time intro on copy; carousel crossfades */
const heroIntroEase = [0.22, 1, 0.36, 1]

export const heroSlideVariants = {
	enter: {
		opacity: 0,
	},
	center: {
		opacity: 1,
		transition: { duration: 0.4, ease: heroIntroEase },
	},
	exit: {
		opacity: 0,
		transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
	},
}

export const heroCopyContainerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.2, delayChildren: 0.4 },
	},
}

export const heroTitleVariants = {
	hidden: { opacity: 0, x: -28 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 1.55, ease: heroIntroEase },
	},
}

export const heroLeadVariants = {
	hidden: { opacity: 0, x: -18 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.7, ease: heroIntroEase },
	},
}

export const heroActionsContainerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.1, delayChildren: 0.06 },
	},
}

export const heroActionItemVariants = {
	hidden: { opacity: 0, y: 14 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease: heroIntroEase },
	},
}

export const heroAccentLineVariants = {
	hidden: { scaleX: 0, opacity: 0 },
	visible: {
		scaleX: 1,
		opacity: 1,
		transition: { duration: 1.2, ease: heroIntroEase, delay: 0.35 },
	},
}

/** Portal benefits — whole-section entrance on scroll */
export const benefitsSectionVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 520,
			damping: 32,
			mass: 0.75,
			when: 'beforeChildren',
			staggerChildren: 0.06,
			delayChildren: 0,
		},
	},
}

export const benefitsIntroWrapVariants = {
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 520,
			damping: 30,
			mass: 0.75,
		},
	},
}

/** Portal benefits — left column: soft slide-in after right media */
const benefitsListEase = [0.22, 1, 0.36, 1]

export const benefitsListVariants = {
	hidden: { opacity: 0, x: -28 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			type: 'spring',
			stiffness: 220,
			damping: 28,
			mass: 1.05,
			staggerChildren: 0.14,
			delayChildren: 0.22,
		},
	},
}

export const benefitsListRuleVariants = {
	hidden: { opacity: 0, scaleX: 0, originX: 0 },
	visible: {
		opacity: 1,
		scaleX: 1,
		transition: { duration: 0.22, ease: benefitsListEase },
	},
}

export const benefitsItemVariants = {
	hidden: { opacity: 0, x: -24, y: 12 },
	visible: (i = 0) => ({
		opacity: 1,
		x: 0,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 240,
			damping: 28,
			mass: 1,
			delay: i * 0.1,
			staggerChildren: 0.06,
			delayChildren: 0.04,
		},
	}),
}

export const benefitsItemDividerVariants = {
	hidden: { opacity: 0, scaleX: 0, originX: 0 },
	visible: {
		opacity: 1,
		scaleX: 1,
		transition: { duration: 0.18, ease: benefitsListEase },
	},
}

export const benefitsItemRowVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.03, delayChildren: 0 },
	},
}

export const benefitsItemIconVariants = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 260,
			damping: 26,
			mass: 0.95,
		},
	},
}

export const benefitsItemContentVariants = {
	hidden: { opacity: 0, x: -10 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			type: 'spring',
			stiffness: 240,
			damping: 28,
			mass: 1,
		},
	},
}

export const benefitsItemHover = {
	y: -4,
	transition: { type: 'spring', stiffness: 420, damping: 22 },
}

export const benefitsItemIconHover = {
	scale: 1.12,
	rotate: 6,
	transition: { type: 'spring', stiffness: 480, damping: 14 },
}

/** Portal benefits — cards + media split layout (right media first, then left list) */
export const benefitsBodyVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.72,
			delayChildren: 0.06,
		},
	},
}

export const benefitsCardsGridVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.1, delayChildren: 0.06 },
	},
}

export const benefitsCardVariants = {
	hidden: (i = 0) => ({
		opacity: 0,
		y: 40,
		x: i % 2 === 0 ? -36 : 36,
		scale: 0.88,
		rotate: i % 2 === 0 ? -4 : 4,
	}),
	visible: (i = 0) => ({
		opacity: 1,
		y: 0,
		x: 0,
		scale: 1,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 380,
			damping: 24,
			mass: 0.9,
			delay: i * 0.09,
		},
	}),
}

/** Diagram pop — same spring language as Portal Services showcase tiles */
export const benefitsMediaVariants = {
	hidden: { opacity: 0, scale: 0.92, y: 16, rotate: 2 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		rotate: 0,
		transition: {
			type: 'spring',
			stiffness: 480,
			damping: 28,
			mass: 0.75,
			when: 'beforeChildren',
			staggerChildren: 0.04,
			delayChildren: 0,
		},
	},
}

/** Rings expand in softly after the diagram frame pops */
export const benefitsSymbolsRingVariants = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 480,
			damping: 28,
			mass: 0.75,
		},
	},
}

/** Orbit icons — quick staggered spring pop */
export const benefitsSymbolVariants = {
	hidden: { opacity: 0, scale: 0.75, y: 10 },
	visible: (i = 0) => ({
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 520,
			damping: 26,
			mass: 0.75,
			delay: 0.02 + i * 0.04,
		},
	}),
}

export const benefitsOrbitVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			duration: 0.15,
			staggerChildren: 0.03,
			delayChildren: 0.02,
		},
	},
}

export const benefitsSymbolHover = {
	scale: 1.1,
	transition: { type: 'spring', stiffness: 480, damping: 14 },
}

export const benefitsMediaFrameVariants = {
	hidden: { opacity: 0, scale: 0.96, y: 10 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 520,
			damping: 28,
			delay: 0,
		},
	},
}

export const benefitsCardHover = {
	y: -6,
	scale: 1.02,
	transition: { type: 'spring', stiffness: 450, damping: 24 },
}

export const benefitsIconHover = {
	scale: 1.1,
	rotate: -4,
	transition: { type: 'spring', stiffness: 500, damping: 16 },
}
