// A very basic language detector based on common keywords
// In a real app, you'd use a more robust NLP library or backend service.

const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  tamil: ["tamil", "kollywood", "kuthu", "ar rahman", "anirudh"],
  hindi: ["hindi", "bollywood", "punjabi", "arijit singh", "neha kakkar"],
  telugu: ["telugu", "tollywood", "devi sri prasad", "ss thaman"],
  malayalam: ["malayalam", "mollywood", "sushin syam", "gopi sundar"],
  english: ["english", "pop", "rock", "hip hop", "r&b", "indie"],
}

export function inferLanguageFromText(text: string): string | null {
  const lowerText = text.toLowerCase()
  let detectedLanguage: string | null = null
  let maxMatches = 0

  for (const lang in LANGUAGE_KEYWORDS) {
    let matches = 0
    for (const keyword of LANGUAGE_KEYWORDS[lang]) {
      if (lowerText.includes(keyword)) {
        matches++
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches
      detectedLanguage = lang
    }
  }
  return detectedLanguage
}

export function inferDominantLanguage(texts: string[]): string | null {
  const languageCounts: Record<string, number> = {}
  texts.forEach((text) => {
    const lang = inferLanguageFromText(text)
    if (lang) {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1
    }
  })

  let dominantLanguage: string | null = null
  let maxCount = 0

  for (const lang in languageCounts) {
    if (languageCounts[lang] > maxCount) {
      maxCount = languageCounts[lang]
      dominantLanguage = lang
    }
  }
  return dominantLanguage
}
