import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import { useLanguage } from '../i18n'

function AccessibilityStatement() {
	const { t } = useLanguage()

	return (
		<PublicPageLayout
			title={t('a11yPage.title')}
			titleId="accessibility-statement-heading"
			breadcrumbLabel={t('a11yPage.title')}
			lead={t('a11yPage.lead')}
		>
			<div className="gov-plain-page">
				<section>
					<h2>{t('a11yPage.commitment.title')}</h2>
					<p>{t('a11yPage.commitment.body')}</p>
				</section>
				<section>
					<h2>{t('a11yPage.features.title')}</h2>
					<p>{t('a11yPage.features.body')}</p>
				</section>
				<section>
					<h2>{t('a11yPage.help.title')}</h2>
					<p>{t('a11yPage.help.body')}</p>
					<p>
						<Link to="/feedback">{t('a11yPage.feedback')}</Link>
						{' · '}
						<Link to="/contact">{t('a11yPage.contact')}</Link>
					</p>
				</section>
			</div>
		</PublicPageLayout>
	)
}

export default AccessibilityStatement
