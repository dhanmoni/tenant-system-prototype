function DemoDocsAttachButton({ loading, onClick, t }) {
	return (
		<div className="tenancy-docs-step__demo">
			<p className="tenancy-docs-step__demo-hint">{t('ws.uin.demo.hint')}</p>
			<button
				type="button"
				className="ws-btn ws-btn--outline"
				disabled={loading}
				onClick={onClick}
			>
				{loading ? t('ws.uin.demo.attaching') : t('ws.uin.demo.attach')}
			</button>
		</div>
	)
}

export default DemoDocsAttachButton
