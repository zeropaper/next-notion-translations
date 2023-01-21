// // This would not play nice with next-translate
// export { default } from 'product/pages/catalog'

// // This is not what we want
// import useTranslation from 'next-translate/useTranslation'
// import Layout from 'core/Layout'

// export default function ProductCatalog() {
//   const { t } = useTranslation('common')

//   return (
//     <Layout>
//       <h2>{t('hello')} </h2>
//     </Layout>
//   )
// }

// // First, things need to be imported
import Page from '@product/pages/catalog'

// // Then, we need to export
export default Page