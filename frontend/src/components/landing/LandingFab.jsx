import { ChevronUp } from 'lucide-react'

/** Back-to-top only; accessibility uses {@link AccessibilityWidget} in App. */
function LandingFab({ showBackToTop, onBackToTop }) {
	if (!showBackToTop) return null

	return (
		<button
			type="button"
			className="landing-fab-top"
			aria-label="Back to top"
			onClick={onBackToTop}
		>
			<ChevronUp className="h-5 w-5" aria-hidden />
		</button>
	)
}

export default LandingFab
