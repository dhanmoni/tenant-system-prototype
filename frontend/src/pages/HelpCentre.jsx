import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import { useLanguage } from '../i18n'

function HelpCentre() {
	const { t } = useLanguage()

	return (
		<PublicPageLayout
			title={t('help.title')}
			titleId="help-centre-heading"
			breadcrumbLabel={t('help.title')}
			lead={t('help.lead')}
		>
			<div className="gov-plain-page">
				<section>
					<h2>{t('help.apply.title')}</h2>
					<p>{t('help.apply.body')}</p>
					<p>
						<Link to="/services">{t('help.apply.services')}</Link>
						{' · '}
						<Link to="/#portal-guide">{t('help.apply.guide')}</Link>
					</p>
				</section>
				<section>
					<h2>{t('help.account.title')}</h2>
					<p>{t('help.account.body')}</p>
					<p>
						<Link to="/login">{t('help.account.login')}</Link>
					</p>
				</section>
				<section>
					<h2>{t('help.contact.title')}</h2>
					<p>{t('help.contact.body')}</p>
					<p>
						<Link to="/contact">{t('help.contact.link')}</Link>
						{' · '}
						<Link to="/feedback">{t('help.contact.feedback')}</Link>
					</p>
				</section>
			</div>
		</PublicPageLayout>
	)
}

export default HelpCentre
