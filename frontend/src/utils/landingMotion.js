/** Shared motion presets for landing section intros (respect reduced motion in components). */

export const easePlayful = [0.34, 1.45, 0.64, 1]

export const introContainerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.11, delayChildren: 0.05 },
	},
}

export const introEyebrowVariants = {
	hidden: { opacity: 0, y: 12, scale: 0.82, rotate: -4 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		rotate: 0,
		transition: { type: 'spring', stiffness: 440, damping: 15 },
	},
}

export const introTitleVariants = {
	hidden: { opacity: 0, y: 36, scale: 0.9, filter: 'blur(8px)' },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: 'blur(0px)',
		transition: { type: 'spring', stiffness: 300, damping: 18, mass: 0.85 },
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
	hidden: { opacity: 0, y: 20, x: -10 },
	visible: {
		opacity: 1,
		y: 0,
		x: 0,
		transition: { type: 'spring', stiffness: 260, damping: 22 },
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

/** Landing hero — one-time intro on copy; carousel slides horizontally */
const heroIntroEase = [0.22, 1, 0.36, 1]

export const heroSlideVariants = {
	enter: (direction = 1) => ({
		x: direction >= 0 ? '100%' : '-100%',
		opacity: 1,
	}),
	center: {
		x: 0,
		opacity: 1,
		transition: { duration: 0.95, ease: heroIntroEase },
	},
	exit: (direction = 1) => ({
		x: direction >= 0 ? '-100%' : '100%',
		opacity: 1,
		transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] },
	}),
}

export const heroCopyContainerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.14, delayChildren: 0.25 },
	},
}

export const heroTitleVariants = {
	hidden: { opacity: 0, x: -28 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.8, ease: heroIntroEase },
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
		transition: { duration: 0.65, ease: heroIntroEase, delay: 0.15 },
	},
}

/** Portal benefits — minimal list layout (left column) */
const benefitsEase = [0.22, 1, 0.36, 1]

export const benefitsListVariants = {
	hidden: { opacity: 0, x: -28 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.65,
			ease: benefitsEase,
			staggerChildren: 0.12,
			delayChildren: 0.06,
		},
	},
}

export const benefitsListRuleVariants = {
	hidden: { opacity: 0, scaleX: 0 },
	visible: {
		opacity: 1,
		scaleX: 1,
		transition: { duration: 0.6, ease: benefitsEase },
	},
}

export const benefitsItemVariants = {
	hidden: { opacity: 0, x: -24 },
	visible: {
		opacity: 1,
		x: 0,
		transition: {
			duration: 0.55,
			ease: benefitsEase,
			staggerChildren: 0.07,
			delayChildren: 0.05,
		},
	},
}

export const benefitsItemDividerVariants = {
	hidden: { opacity: 0, scaleX: 0 },
	visible: {
		opacity: 1,
		scaleX: 1,
		transition: { duration: 0.45, ease: benefitsEase },
	},
}

export const benefitsItemRowVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.08, delayChildren: 0.02 },
	},
}

export const benefitsItemIconVariants = {
	hidden: { opacity: 0, x: -14, scale: 0.85 },
	visible: {
		opacity: 1,
		x: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 380,
			damping: 26,
			mass: 0.8,
		},
	},
}

export const benefitsItemContentVariants = {
	hidden: { opacity: 0, x: -18 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.5, ease: benefitsEase },
	},
}

/** Portal benefits — cards + media split layout (legacy) */
export const benefitsBodyVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.2, delayChildren: 0.1 },
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

export const benefitsMediaVariants = {
	hidden: { opacity: 0, x: 48, scale: 0.9 },
	visible: {
		opacity: 1,
		x: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 280,
			damping: 26,
			mass: 0.95,
			delay: 0.12,
		},
	},
}

export const benefitsMediaFrameVariants = {
	hidden: { opacity: 0, scale: 1.06, y: 12 },
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: 'spring',
			stiffness: 320,
			damping: 28,
			delay: 0.28,
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
