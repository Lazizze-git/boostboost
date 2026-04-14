/**
 * Génère des IDs de bracelets en masse et les insère dans Supabase.
 * Usage: node scripts/generate-bracelets.mjs <nombre>
 * Exemple: node scripts/generate-bracelets.mjs 500
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY     = process.env.VITE_SUPABASE_ANON_KEY
const COUNT            = parseInt(process.argv[2] ?? '100', 10)
const CHARS            = 'abcdefghijklmnopqrstuvwxyz0123456789'
const ID_LENGTH        = 8

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Manque VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY dans les variables d\'environnement.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function randomId() {
  return Array.from({ length: ID_LENGTH }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

async function main() {
  console.log(`Génération de ${COUNT} bracelets...`)

  // Récupère les IDs existants pour éviter les doublons
  const { data: existing } = await supabase.from('bracelets').select('tap_id')
  const existingSet = new Set((existing ?? []).map(r => r.tap_id))

  const toInsert = []
  while (toInsert.length < COUNT) {
    const id = randomId()
    if (!existingSet.has(id)) {
      existingSet.add(id)
      toInsert.push({ tap_id: id })
    }
  }

  // Insertion par batch de 100
  const BATCH = 100
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)
    const { error } = await supabase.from('bracelets').insert(batch)
    if (error) {
      console.error('Erreur:', error.message)
      process.exit(1)
    }
    console.log(`  ✓ ${Math.min(i + BATCH, COUNT)}/${COUNT}`)
  }

  console.log('\nURLs générées (exemple) :')
  toInsert.slice(0, 5).forEach(b =>
    console.log(`  https://boostboost.vercel.app/tap/${b.tap_id}`)
  )
  console.log(`  ... et ${COUNT - 5} autres`)
  console.log('\nDone.')
}

main()
