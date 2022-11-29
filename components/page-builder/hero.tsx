import { SanityImageSource } from '@sanity/image-url/lib/types/types'
import React from 'react'
import { KeyedObject } from 'sanity'

import { Link } from '../../types'
import Button from '../button'
import Container from '../container'

type HeroProps = KeyedObject & {
  _type: 'hero'
  title?: string
  subtitle?: string
  links: (KeyedObject & Link)[]
  image?: SanityImageSource
}

export default function PageBuilderHero(props: HeroProps) {
  const { title, subtitle, links } = props

  return (
    <Container>
      <div className="flex flex-col gap-3 py-10 md:py-20 pr-10 lg:w-1/2 lg:gap-5">
        {title ? (
          <h2 className="text-4xl font-bold leading-none tracking-tighter md:text-5xl lg:text-6xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className="text-lg text-gray-600 md:w-full md:text-2xl md:pr-20">
            {subtitle}
          </p>
        ) : null}
        {links && links.length > 0 ? (
          <div className="flex items-center gap-5">
            {links.map((link, linkIndex) => (
              <Button
                key={link._key}
                mode={linkIndex > 0 ? `ghost` : `default`}
                icon
                {...link}
              />
            ))}
          </div>
        ) : null}
      </div>
    </Container>
  )
}
