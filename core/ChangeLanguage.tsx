import React from 'react'
import useTranslation from 'next-translate/useTranslation'
import i18nConfig from '../i18n.json'
import Link from './Link'
import { useRouter } from 'next/router'

const { locales } = i18nConfig

export default function ChangeLanguage() {
  const { t, lang } = useTranslation('core/i18n')
  const router = useRouter()
  return (
    <>
      {locales.map((lng) => {
        if (lng === lang) return null

        return (
          <Link href={router.pathname} locale={lng} key={lng}>
            {t(`language-name-${lng}`)}
          </Link>
        )
      })}
    </>
  )
}