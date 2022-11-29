import ErrorPage from 'next/error'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

import Container from '../components/container'
import Layout from '../components/layout'
import Page from '../components/page'
import PostTitle from '../components/post-title'
import { globalDataQuery, pageQuery, pageSlugsQuery } from '../sanity/queries'
import { usePreviewSubscription } from '../sanity/sanity'
import { getClient } from '../sanity/sanity.server'
import { GlobalDataProps, PageProps, PageQueryParams } from '../types'
import { getLanguageFromNextLocale, getMarketFromNextLocale } from '.'

interface Props {
  data: PageProps
  preview: boolean
  query: string | null
  queryParams: PageQueryParams
  globalData: GlobalDataProps
}

export default function Slug(props: Props) {
  const { data: initialData, preview, query, queryParams, globalData } = props
  const router = useRouter()

  const { data } = usePreviewSubscription(query, {
    params: queryParams,
    initialData: initialData,
    enabled: preview,
  })
  const { title = 'Marketing.' } = globalData?.settings || {}

  if (!router.isFallback && !data) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <Layout preview={preview} queryParams={queryParams} globalData={globalData}>
      {router.isFallback ? (
        <Container>
          <PostTitle>Loading…</PostTitle>
        </Container>
      ) : (
        <>
          <Head>
            <title>{`${data.title} | ${title}`}</title>
          </Head>
          <Page {...data} />
        </>
      )}
    </Layout>
  )
}

export async function getStaticProps({
  params,
  locale,
  preview = false,
  previewData,
}) {
  // These query params are used to power this preview
  // And fed into <Alert /> to create ✨ DYNAMIC ✨ params!
  const queryParams: PageQueryParams = {
    // Necessary to query for the right page
    // And used by the preview route to redirect back to it
    slug: params.slug,
    // This demo uses a "market" field to separate documents
    // So that content does not leak between markets, we always include it in the query
    market: getMarketFromNextLocale(locale) ?? `US`,
    // Only markets with more than one language are likely to have a language field value
    language: getLanguageFromNextLocale(locale) ?? null,
    // In preview mode we can set the audience
    // In production this should be set in a session cookie
    audience:
      preview && previewData?.audience
        ? previewData?.audience
        : Math.round(Math.random()),
    // Some Page Builder blocks are set to display only on specific times
    // In preview mode, we can set this to preview the page as if it were a different time
    // By default, set `null` here and the query will use GROQ's cache-friendly `now()` function
    // Do not pass a dynamic value like `new Date()` as it will uniquely cache every request!
    date: preview && previewData?.date ? previewData.date : null,
  }

  const page = await getClient(preview).fetch(pageQuery, queryParams)
  const globalData = await getClient(preview).fetch(globalDataQuery, {
    settingsId: `${queryParams.market}-settings`.toLowerCase(),
    menuId: `${queryParams.market}-menu`.toLowerCase(),
    language: queryParams.language,
  })

  return {
    props: {
      preview,
      data: page,
      query: preview ? pageQuery : null,
      queryParams: preview ? queryParams : null,
      globalData,
    },
    // If webhooks isn't setup then attempt to re-generate in 1 minute intervals
    revalidate: process.env.SANITY_REVALIDATE_SECRET ? undefined : 60,
  }
}

export async function getStaticPaths() {
  // The context here only has access to ALL locales
  // Not the current one we're looking at
  // So sadly, we have to fetch all slugs for all locales
  const paths = await getClient(false).fetch(pageSlugsQuery)
  return {
    paths: paths.map((slug) => ({ params: { slug } })),
    fallback: true,
  }
}
