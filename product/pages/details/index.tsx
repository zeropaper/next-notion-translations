import useTranslation from 'next-translate/useTranslation'
import Layout from 'core/Layout'

export default function ProductDetails() {
  const { t } = useTranslation('product/pages/details')

  return (
    <Layout>
      <h1>{t('title')}</h1>

      <div>
        {t('specifications')}
      </div>
    </Layout>
  )
}
