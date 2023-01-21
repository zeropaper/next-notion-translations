import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import setLanguage from 'next-translate/setLanguage'
import i18nConfig from '../i18n.json'
import { useRouter } from 'next/router.js'

const { locales } = i18nConfig

export default function ChangeLanguage() {
  const { t, lang } = useTranslation('i18n')
  const route = useRouter()
  return (
    <>
      {locales.map((lng) => {
        if (lng === lang) return null

        return (
          <Link href="/" locale={lng} key={lng}>
            {t(`language-name-${lng}`)}
          </Link>
        )
      })}
    </>
  )
}