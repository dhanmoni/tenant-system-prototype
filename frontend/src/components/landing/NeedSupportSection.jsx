import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { ScrollFadeUp } from './ScrollFadeUp'
import { useLanguage } from '../../i18n'

function NeedSupportSection() {
	const { t } = useLanguage()

	return (
		<section
			id="need-support"
			className="landing-need-support scroll-mt-28 text-white"
			aria-labelledby="need-support-heading"
		>
			<ScrollFadeUp>
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
					<div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
						<div className="max-w-xl">
							<h2 id="need-support-heading" className="text-2xl font-bold sm:text-3xl">
								{t('home.support.title')}
							</h2>
							<p className="mt-3 text-base text-white/75 sm:text-lg">
								{t('home.support.lead')}
							</p>
						</div>
						<Link
							to="/contact"
							className="need-support-contact-link inline-flex shrink-0 items-center gap-2 rounded-md border border-white/90 bg-transparent px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
						>
							{t('home.support.cta')}
							<ArrowUpRight className="h-4 w-4" aria-hidden />
						</Link>
					</div>
				</div>
			</ScrollFadeUp>
		</section>
	)
}

export default NeedSupportSection
