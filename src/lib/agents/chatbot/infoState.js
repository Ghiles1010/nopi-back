import { z } from 'zod'

// Zod schema (Pydantic-like) for the investment info
export const InfoStateSchema = z.object({
  prix_achat: z.number().nullable().default(null),
  loyer_mensuel: z.number().nullable().default(null),
  charges_annuelles: z.number().nullable().default(null),
  duree: z.number().nullable().default(null),
})

export class InfoState {
  constructor(initial = {}) {
    const parsed = InfoStateSchema.partial().parse(initial)
    this.data = {
      prix_achat: null,
      loyer_mensuel: null,
      charges_annuelles: null,
      duree: null,
      ...parsed,
    }
  }

  // Merge and validate partial updates
  update(partial) {
    const parsed = InfoStateSchema.partial().parse(partial ?? {})
    this.data = { ...this.data, ...parsed }
  }

  // Minimal JSON view
  toJSON() {
    return { ...this.data }
  }
}

export default InfoState


