import { ChevronUp } from 'lucide-react'
import { useLanguage } from '../../i18n'

/** Back-to-top only; accessibility uses the official UX4G widget. */
function LandingFab({ showBackToTop, onBackToTop }) {
	const { t } = useLanguage()
	if (!showBackToTop) return null

	return (
		<button
			type="button"
			className="landing-fab-top"
			aria-label={t('home.fab.backToTop')}
			onClick={onBackToTop}
		>
			<ChevronUp className="h-5 w-5" aria-hidden />
		</button>
	)
}

export default LandingFab
