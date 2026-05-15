import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

function NeedSupportSection() {
	return (
		<section
			className="relative overflow-hidden bg-[#111111] text-white"
			aria-labelledby="need-support-heading"
		>
			<div
				className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-[0.12]"
				aria-hidden
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cpath fill='none' stroke='%23ffffff' stroke-width='1' d='M0 60 Q30 20 60 60 T120 60'/%3E%3Cpath fill='none' stroke='%23ffffff' stroke-width='1' d='M0 80 Q30 40 60 80 T120 80'/%3E%3Cpath fill='none' stroke='%23ffffff' stroke-width='1' d='M0 40 Q30 0 60 40 T120 40'/%3E%3C/svg%3E")`,
					backgroundSize: '120px 120px',
				}}
			/>
			<div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-14 sm:flex-row sm:items-center sm:px-6 sm:py-16 lg:px-8">
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
