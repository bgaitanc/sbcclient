import * as yup from 'yup'

export const journalEntryLineSchema = yup.object().shape({
  accountId: yup.string().required('La cuenta es obligatoria'),
  debit: yup
    .number()
    .min(0, 'El monto no puede ser negativo')
    .required('El debe es obligatorio'),
  credit: yup
    .number()
    .min(0, 'El monto no puede ser negativo')
    .required('El haber es obligatorio')
})

export const journalEntrySchema = yup.object().shape({
  date: yup.string().required('La fecha es obligatoria'),
  description: yup.string().required('La descripción es obligatoria'),
  lines: yup
    .array()
    .of(journalEntryLineSchema)
    .min(2, 'Debe haber al menos dos líneas en el asiento')
    .test(
      'is-balanced',
      'El asiento no está balanceado (Partida Doble)',
      (lines) => {
        if (lines == null) return false
        const totalDebit = lines.reduce(
          (sum, line) => sum + (line.debit !== 0 ? Number(line.debit) : 0),
          0
        )
        const totalCredit = lines.reduce(
          (sum, line) => sum + (line.credit !== 0 ? Number(line.credit) : 0),
          0
        )
        return Math.abs(totalDebit - totalCredit) < 0.01
      }
    )
    .test(
      'not-empty-lines',
      'Todas las líneas deben tener un monto en el Debe o en el Haber',
      (lines) => {
        if (lines == null) return false
        return lines.every((l) => l.debit > 0 || l.credit > 0)
      }
    )
    .required('Las líneas son obligatorias')
})
