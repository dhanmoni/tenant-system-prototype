import { Info } from 'lucide-react'

/**
 * Example strip showing GIGW-aligned practices on the landing page (demo).
 */
function GigwNoticeBar() {
	return (
		<aside
			className="landing-gigw-notice border-b border-landing/20 bg-landing-cream px-4 py-2.5 sm:px-6"
			aria-label="Accessibility and quality notice"
		>
			<div className="mx-auto flex max-w-7xl items-start gap-2 text-sm text-slate-700 sm:items-center">
				<Info className="mt-0.5 h-4 w-4 shrink-0 text-landing sm:mt-0" aria-hidden />
				<p>
					<strong className="font-semibold text-landing-dark">GIGW 3.0 examples on this page:</strong>{' '}
					skip links, pause for moving images, last updated date, honest language labels, and an
					expanded accessibility menu. See{' '}
					<a
						href="https://guidelines.india.gov.in/introduction/"
						target="_blank"
						rel="noopener noreferrer"
						className="font-semibold text-landing underline-offset-2 hover:underline"
					>
						Indian Government Website Guidelines
					</a>
					.
				</p>
			</div>
		</aside>
	)
}

export default GigwNoticeBar
