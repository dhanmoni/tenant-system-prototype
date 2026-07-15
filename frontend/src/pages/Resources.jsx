import { useMemo } from 'react'
import { FileText } from 'lucide-react'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import { resourceDraftGroups } from '../data/resourceDrafts'
import { useLanguage } from '../i18n'

const groupKeys = {
	agreements: {
		title: 'resources.agreements.title',
		description: 'resources.agreements.desc',
		items: {
			'residential-tenancy': {
				title: 'resources.residential.title',
				description: 'resources.residential.desc',
			},
			'commercial-lease': {
				title: 'resources.commercial.title',
				description: 'resources.commercial.desc',
			},
			'joint-tenancy': {
				title: 'resources.joint.title',
				description: 'resources.joint.desc',
			},
		},
	},
	notices: {
		title: 'resources.notices.title',
		description: 'resources.notices.desc',
		items: {
			'tenant-notice': {
				title: 'resources.tenantNotice.title',
				description: 'resources.tenantNotice.desc',
			},
			'landlord-reply': {
				title: 'resources.landlordReply.title',
				description: 'resources.landlordReply.desc',
			},
		},
	},
	forms: {
		title: 'resources.forms.title',
		description: 'resources.forms.desc',
		items: {
			'uin-checklist': {
				title: 'resources.uinChecklist.title',
				description: 'resources.uinChecklist.desc',
			},
			'application-cover': {
				title: 'resources.cover.title',
				description: 'resources.cover.desc',
			},
			affidavit: {
				title: 'resources.affidavit.title',
				description: 'resources.affidavit.desc',
			},
		},
	},
}

function Resources() {
	const { t } = useLanguage()

	const groups = useMemo(
		() =>
			resourceDraftGroups.map((group) => {
				const keys = groupKeys[group.id]
				return {
					...group,
					title: keys ? t(keys.title) : group.title,
					description: keys ? t(keys.description) : group.description,
					items: group.items.map((item) => {
						const itemKeys = keys?.items?.[item.id]
						return {
							...item,
							title: itemKeys ? t(itemKeys.title) : item.title,
							description: itemKeys ? t(itemKeys.description) : item.description,
						}
					}),
				}
			}),
		[t],
	)

	return (
		<PublicPageLayout
			title={t('resources.title')}
			titleId="resources-heading"
			breadcrumbLabel={t('resources.title')}
			lead={t('resources.lead')}
		>
			<div className="gov-plain-page gov-resources">
				<p className="gov-resources__notice" role="status">
					{t('resources.notice')}
				</p>

				{groups.map((group) => (
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
											{t('resources.format')} {item.format}
											<span className="gov-resources__item-sep" aria-hidden>
												·
											</span>
											<span className="gov-resources__item-status">{t('resources.comingSoon')}</span>
										</p>
									</div>
									<button
										type="button"
										className="gov-resources__download"
										disabled
										aria-disabled="true"
										title={t('resources.downloadDisabled')}
									>
										{t('resources.download')}
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
