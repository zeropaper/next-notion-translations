import useTranslation from 'next-translate/useTranslation'
import Layout from 'core/Layout'

export default function ProductCatalog() {
  const { t } = useTranslation('product/pages/catalog')

  return (
    <Layout>
      <h2>{t('title')}</h2>
      {t('description')}
    </Layout>
  )
}
