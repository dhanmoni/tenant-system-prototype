import PublicPageLayout from '../components/landing/PublicPageLayout'
import { useLanguage } from '../i18n'

function Policies() {
	const { t } = useLanguage()

	return (
		<PublicPageLayout
			title={t('policies.title')}
			titleId="policies-heading"
			breadcrumbLabel={t('policies.title')}
			lead={t('policies.lead')}
		>
			<div className="gov-plain-page">
				<section>
					<h2>{t('policies.terms.title')}</h2>
					<p>{t('policies.terms.p1')}</p>
					<p>{t('policies.terms.p2')}</p>
				</section>

				<section>
					<h2>{t('policies.privacy.title')}</h2>
					<p>{t('policies.privacy.p1')}</p>
				</section>
			</div>
		</PublicPageLayout>
	)
}

export default Policies
