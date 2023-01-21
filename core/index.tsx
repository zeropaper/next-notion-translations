import useTranslation from 'next-translate/useTranslation'
import Layout from './Layout'

export default function Home() {
  const { t } = useTranslation()

  return (
    <Layout>
      {t('hello')}
    </Layout>
  )
}
