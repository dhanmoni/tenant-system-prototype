import PublicPageLayout from '../components/landing/PublicPageLayout'
import { useLanguage } from '../i18n'

function Resources() {
	const { t } = useLanguage()

	return (
		<PublicPageLayout
			title={t('resources.title')}
			titleId="resources-heading"
			breadcrumbLabel={t('resources.title')}
		>
			<div className="gov-plain-page gov-resources gov-resources--soon">
				<p className="gov-resources__soon" role="status">
					{t('resources.comingSoon')}
				</p>
			</div>
		</PublicPageLayout>
	)
}

export default Resources
