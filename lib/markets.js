// In this format so ./next.config.js can consume them
const markets = [
  {
    flag: `🇳🇱`,
    name: `NL`,
    title: `Netherlands`,
    languages: [{id: `nl`, title: `Dutch`}],
  },
  {
    flag: `🇬🇧`,
    name: `UK`,
    title: `United Kingdom`,
    languages: [{id: `en`, title: `English`}],
  },
]

exports.markets = markets

exports.uniqueLanguages = Array.from(
  new Set(
    markets
      .map((market) =>
        market.languages.map((language) => [language.id, market.name].join(`-`))
      )
      .flat()
  )
)
