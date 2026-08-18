import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import ContactMap from '../components/landing/ContactMap'
import { supportContact, supportMailto, supportMapsUrl, supportTel } from '../data/supportContact'
import { useLanguage } from '../i18n'

function Contact() {
	const { t } = useLanguage()
	const addressLines = t('contact.addressLines').split('\n')

	return (
		<PublicPageLayout
			title={t('contact.title')}
			titleId="contact-heading"
			breadcrumbLabel={t('contact.title')}
			lead={t('contact.lead')}
		>
			<div className="gov-plain-page">
				<div className="gov-plain-page__columns">
					<div className="gov-plain-page__col">
						<section>
							<h2>{t('contact.helpdesk')}</h2>
							<p>
								<strong>{t('contact.phoneLabel')}</strong>{' '}
								<a href={supportTel}>{supportContact.phoneDisplay}</a>
							</p>
							<p>
								<strong>{t('contact.emailLabel')}</strong>{' '}
								<a href={supportMailto}>{supportContact.email}</a>
							</p>
							<p>
								<strong>{t('contact.hoursLabel')}</strong> {t('contact.hoursValue')}
							</p>
						</section>
					</div>

					<div className="gov-plain-page__col">
						<section>
							<h2>{t('contact.officeAddress')}</h2>
							<p>
								{addressLines.map((line, index) => (
									<span key={line}>
										{index > 0 ? <br /> : null}
										{line}
									</span>
								))}
							</p>
						</section>
					</div>
				</div>

				<section className="gov-plain-page__map" aria-labelledby="contact-map-heading">
					<h2 id="contact-map-heading">{t('contact.mapTitle')}</h2>
					<p>{t('contact.mapAddress')}</p>
					<ContactMap />
					<p className="gov-plain-page__map-note">
						<a href={supportMapsUrl} target="_blank" rel="noopener noreferrer">
							{t('contact.openMaps')}
						</a>
					</p>
				</section>

				<p className="gov-plain-page__meta">{t('contact.meta')}</p>

				<p className="gov-plain-page__links">
					<Link to="/login">{t('contact.signIn')}</Link>
					{' · '}
					<a href={supportContact.tcpContactPage} target="_blank" rel="noopener noreferrer">
						{t('contact.tcpSite')}
					</a>
				</p>
			</div>
		</PublicPageLayout>
	)
}

export default Contact
