import { Client } from '@notionhq/client';
// see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import * as dotenv from 'dotenv'
import { basename, dirname, resolve, sep } from 'path'
import glob from "glob"
import { detailedDiff } from 'deep-object-diff'
import { readFileSync } from 'fs';
import { mkdir, stat, readFile, writeFile } from 'fs/promises';
import { createHash } from 'crypto'

const projectRoot = process.cwd()

dotenv.config()

const client = new Client({ auth: process.env.NOTION_API_KEY });

type LanguageCode = 'en' | 'de'
type Language = {
  [ns: string]: {
    [id: string]: string
  }
}
interface Translations extends Record<LanguageCode, Language> { }
interface RichText {
  type: 'text'
  text: {
    content: string
    link: string | null
  }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  plain_text: string
  href: string | null
}
interface NotiontranslationsResponse {
  results: [{
    id: string
    properties: {
      id: {
        title: [{
          plain_text: string
        }]
      }
      namespace: {
        select: {
          name: string
        }
      }
      used: {
        checkbox: boolean
      }
    } & Record<LanguageCode, {
      rich_text: RichText[]
    }>
  }]
}


const languages: LanguageCode[] = ['en', 'de']


function makeTranslationsObject(): Translations {
  return languages.reduce((obj, lang) => {
    obj[lang] = {}
    return obj
  }, {} as Translations)
}

async function populateCodeLocales(): Promise<{ [ns: string]: string[] }> {
  const includes = ['core', 'product']

  return new Promise((res, rej) =>
    glob(`{${includes.join(',')}}/**/*.locales.json`, {
      cwd: projectRoot,
    }, async (err, results) => {
      if (err) {
        rej(err)
        return
      }

      const objects = await Promise.all(results.map(async (filepath) => {
        const ns = dirname(filepath)
        const parts = basename(filepath).split('.')
        const filename = parts[0]

        return {
          [[ns, filename !== 'index' && filename].filter(Boolean).join('/')]: JSON.parse(await readFile(filepath, 'utf8'))
        }
      }))
      const result = objects.reduce((acc, obj) => ({
        ...acc,
        ...obj
      }), {})
      res(result)
    })
  )
}

async function populateLocales() {
  const codeLocales = await populateCodeLocales()
  // console.info('code locales declarations', JSON.stringify(codeLocales, null, 2))
  await Promise.all(languages.map(async (lang) => {
    await Promise.all(Object.entries(codeLocales).map(async ([ns, keys]) => {
      const dest = `locales${sep}${lang}${sep}${ns}.json`
      await mkdir(resolve(projectRoot, dirname(dest)), { recursive: true })
      const data = keys.reduce((obj, key) => {
        obj[key] = `${lang} ${key}`
        return obj
      }, {} as Record<string, string>)
      await writeFile(resolve(projectRoot, dest), JSON.stringify(data, null, 2), 'utf-8')
    }))
  }))
}

function processNotionData(data: any): Translations {
  const translations = makeTranslationsObject()
  for (const page of data.results) {
    const id = page.properties.id.title.map((rt: RichText) => rt.plain_text).join('');
    const ns = page.properties.namespace.select?.name || 'core';
    for (const lang of languages) {
      translations[lang][ns] = translations[lang][ns] || {}
      translations[lang][ns][id] = page.properties[lang].rich_text.map((rt: RichText) => rt.plain_text).join('')
    }
  }
  return translations
}

async function loadNotionTranslations(): Promise<NotiontranslationsResponse> {
  return client.databases.query({
    database_id: process.env.NEXT_PUBLIC_NOTION_TRANSLATION_DB_ID!,
  }) as unknown as Promise<NotiontranslationsResponse>;
}

async function loadLocalTranslations(): Promise<Translations> {
  const translations = makeTranslationsObject()

  return new Promise((res, rej) => glob('locales/**/*.json', {
    cwd: projectRoot
  }, async (err: any, files: string[]) => {
    if (err) {
      rej(err)
      return
    }
    res(files.reduce((obj, file) => {
      const lang = file.split(sep)[1] as LanguageCode
      const ns = file.split(sep).slice(2).join('/').replace('.json', '')
      obj[lang][ns] = obj[lang][ns] || {}
      obj[lang][ns] = JSON.parse(readFileSync(file, 'utf8'))
      return obj
    }, translations))
  }))
}

function findNotionPage(data: NotiontranslationsResponse, ns: string, id: string): NotiontranslationsResponse['results'][number] | void {
  for (const page of data.results) {
    if (page.properties.namespace.select?.name === ns && page.properties.id.title[0].plain_text === id) {
      return page
    }
  }
}

async function flagNotionPageUsage(pageId: string, used: boolean): Promise<any> {
  return client.pages.update({
    page_id: pageId,
    properties: {
      used: { checkbox: true },
    }
  })
}

populateLocales().then(async () => {
  const codeLocales = await populateCodeLocales()
  const localTranslations = await loadLocalTranslations()
  const notionData = await loadNotionTranslations()
  const notionTranslations = processNotionData(notionData)

  const { added, deleted }: {
    added: any
    deleted: any
  } = detailedDiff(notionTranslations, localTranslations)

  const ops: (() => Promise<any>)[] = []
  // the "added" translations need to be added to the Notion database
  if (typeof added.en === 'object') {
    Object.keys(added.en).forEach((ns) => {
      Object.keys(added.en[ns]).forEach((id) => {
        console.info(`Adding ${id} to ${ns} in Notion`)

        ops.push(() => {
          return client.pages.create({
            parent: { database_id: process.env.NEXT_PUBLIC_NOTION_TRANSLATION_DB_ID! },
            properties: {
              id: { title: [{ text: { content: id } }] },
              namespace: { select: { name: ns } },
              en: { rich_text: [{ text: { content: added.en[ns][id] } }] },
              de: { rich_text: [{ text: { content: added.de[ns][id] } }] },
              used: { checkbox: true },
            }
          })
        })
      })
    })
  }

  // all other changes need to be written in the local files
  languages.forEach((lang) => {
    const namespaces = notionTranslations[lang as LanguageCode]
    if (typeof namespaces !== 'object') return;

    Object.keys(namespaces).forEach((ns) => {
      const locales = namespaces[ns];
      if (typeof locales !== 'object') return;

      ops.push(() => writeFile(`locales/${lang}/${ns}.json`, JSON.stringify(locales, null, 2), 'utf-8'))

      if (lang !== 'en' || !process.env.CI) return;

      Object.keys(locales).forEach((id) => {
        const notionPage = findNotionPage(notionData, ns, id)
        if (notionPage) {
          const isUsed = !!codeLocales[ns]?.includes(id)

          if (
            (!notionPage.properties.used.checkbox && isUsed)
            // || (notionPage.properties.used.checkbox && !isUsed)
          ) {
            console.info('flagging', ns, id, 'as used', isUsed)

            ops.push(() => {
              return flagNotionPageUsage(notionPage.id, isUsed)
            })
          }
        }
      })
    })
  })

  // the deleted translations need to be flagged in the Notion database
  if (deleted.en && process.env.CI) {
    Object.keys(deleted.en).forEach((ns) => {
      Object.keys(deleted.en[ns] || {}).forEach((id) => {
        const notionPage = findNotionPage(notionData, ns, id)
        if (!notionPage || !notionPage.properties.used.checkbox) return;

        console.info('flagging', ns, id, 'as unused')
        ops.push(() => {
          return flagNotionPageUsage(notionPage.id, false)
        })
      })
    })
  }

  return Promise.all(ops.map((op) => op()))
})