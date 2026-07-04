import { FileText } from 'lucide-react'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import { resourceDraftGroups } from '../data/resourceDrafts'

function Resources() {
	return (
		<PublicPageLayout
			title="Resources"
			titleId="resources-heading"
			breadcrumbLabel="Resources"
			lead="Download agreement drafts, notice formats, and application checklists. Draft files are placeholders until official formats are published by the department."
		>
			<div className="gov-plain-page gov-resources">
				<p className="gov-resources__notice" role="status">
					Downloads are not yet available. The items below show what will be offered
					when official draft formats are released.
				</p>

				{resourceDraftGroups.map((group) => (
					<section key={group.id} className="gov-resources__group" aria-labelledby={`${group.id}-heading`}>
						<h2 id={`${group.id}-heading`}>{group.title}</h2>
						<p>{group.description}</p>

						<ul className="gov-resources__list">
							{group.items.map((item) => (
								<li key={item.id} className="gov-resources__item">
									<div className="gov-resources__item-icon" aria-hidden>
										<FileText className="gov-resources__item-icon-svg" strokeWidth={1.75} />
									</div>
									<div className="gov-resources__item-body">
										<h3 className="gov-resources__item-title">{item.title}</h3>
										<p className="gov-resources__item-desc">{item.description}</p>
										<p className="gov-resources__item-meta">
											Format: {item.format}
											<span className="gov-resources__item-sep" aria-hidden>
												·
											</span>
											<span className="gov-resources__item-status">Coming soon</span>
										</p>
									</div>
									<button
										type="button"
										className="gov-resources__download"
										disabled
										aria-disabled="true"
										title="Download not available yet"
									>
										Download
									</button>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</PublicPageLayout>
	)
}

export default Resources
