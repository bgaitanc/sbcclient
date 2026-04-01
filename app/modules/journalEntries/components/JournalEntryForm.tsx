import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import type {
  JournalEntry,
  CreateJournalEntryLineReq
} from '@shared/types/journalEntries/journalEntryTypes'
import { useJournalEntryActions } from '../hooks/useJournalEntryActions'
import { useGetAccountsTreeQuery } from '@/redux/api/apiSlice'
import type { Account } from '@shared/types/accounts/accountTypes'

interface JournalEntryFormProps {
  initialData?: JournalEntry | null
  onSuccess: () => void
  onCancel: () => void
}

export const JournalEntryForm = ({
  initialData,
  onSuccess,
  onCancel
}: JournalEntryFormProps) => {
  const { handleCreate, handleUpdate, isLoading } = useJournalEntryActions()
  const { data: accountsResponse } = useGetAccountsTreeQuery()

  const [date, setDate] = useState(
    initialData?.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [lines, setLines] = useState<CreateJournalEntryLineReq[]>(
    initialData?.lines.map((l) => ({
      accountId: l.accountId,
      debit: l.debit,
      credit: l.credit
    })) ?? [
      { accountId: '', debit: 0, credit: 0 },
      { accountId: '', debit: 0, credit: 0 }
    ]
  )

  const [error, setError] = useState<string | null>(null)

  // Obtener lista plana de cuentas para el select
  const flattenAccounts = (accounts: Account[]): Account[] => {
    let result: Account[] = []
    accounts.forEach((acc) => {
      result.push(acc)
      if (acc.children && acc.children.length > 0) {
        result = result.concat(flattenAccounts(acc.children))
      }
    })
    return result
  }

  const accountList = accountsResponse?.data
    ? flattenAccounts(accountsResponse.data)
    : []

  const handleAddLine = () => {
    setLines([...lines, { accountId: '', debit: 0, credit: 0 }])
  }

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return
    const newLines = [...lines]
    newLines.splice(index, 1)
    setLines(newLines)
  }

  const handleLineChange = (
    index: number,
    field: keyof CreateJournalEntryLineReq,
    value: string | number
  ) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }

    // Si se edita el debe, el haber debería ser 0 (o viceversa) en la mayoría de los casos simples
    // Pero permitimos ambos para casos complejos si fuera necesario.
    // Aquí implementamos una lógica simple de "limpiar el otro campo" para facilitar la entrada.
    if (field === 'debit' && Number(value) > 0) {
      newLines[index].credit = 0
    } else if (field === 'credit' && Number(value) > 0) {
      newLines[index].debit = 0
    }

    setLines(newLines)
  }

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!description) {
      setError('La descripción es obligatoria')
      return
    }

    if (!isBalanced) {
      setError('El asiento no está balanceado (Partida Doble)')
      return
    }

    if (lines.some((l) => !l.accountId)) {
      setError('Todas las líneas deben tener una cuenta seleccionada')
      return
    }

    if (lines.some((l) => l.debit === 0 && l.credit === 0)) {
      setError('Todas las líneas deben tener un monto en el Debe o en el Haber')
      return
    }

    try {
      if (initialData) {
        await handleUpdate({
          id: initialData.id,
          date,
          description,
          lines: lines.map((l, index) => ({
            ...l,
            id: initialData.lines[index]?.id // Intentar mapear IDs existentes si es posible
          }))
        })
      } else {
        await handleCreate({
          date,
          description,
          lines
        })
      }
      onSuccess()
    } catch (err: any) {
      setError(err.data?.message || 'Ocurrió un error al guardar el asiento')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {initialData ? 'Editar Asiento Contable' : 'Nuevo Asiento Contable'}
      </Typography>

      {error != null && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3} mb={4}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Fecha"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
            }}
            InputLabelProps={{ shrink: true }}
            required
            sx={{ width: { sm: '250px' } }}
          />
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
            }}
            fullWidth
            required
          />
        </Stack>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="40%">Cuenta</TableCell>
                <TableCell align="right">Debe</TableCell>
                <TableCell align="right">Haber</TableCell>
                <TableCell width="50px"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      value={line.accountId}
                      onChange={(e) => {
                        handleLineChange(index, 'accountId', e.target.value)
                      }}
                      required
                    >
                      {accountList.map((acc) => (
                        <MenuItem key={acc.id} value={acc.id}>
                          {acc.code} - {acc.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={line.debit}
                      onChange={(e) => {
                        handleLineChange(index, 'debit', Number(e.target.value))
                      }}
                      inputProps={{ step: '0.01', min: '0' }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={line.credit}
                      onChange={(e) => {
                        handleLineChange(
                          index,
                          'credit',
                          Number(e.target.value)
                        )
                      }}
                      inputProps={{ step: '0.01', min: '0' }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => {
                        handleRemoveLine(index)
                      }}
                      disabled={lines.length <= 2}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddLine}
                    size="small"
                  >
                    Agregar Línea
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="subtitle2"
                    color={isBalanced ? 'success.main' : 'error.main'}
                  >
                    {totalDebit.toLocaleString(undefined, {
                      minimumFractionDigits: 2
                    })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="subtitle2"
                    color={isBalanced ? 'success.main' : 'error.main'}
                  >
                    {totalCredit.toLocaleString(undefined, {
                      minimumFractionDigits: 2
                    })}
                  </Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {!isBalanced && (
          <Typography variant="caption" color="error">
            * El total del Debe debe ser igual al total del Haber. Diferencia:{' '}
            {(totalDebit - totalCredit).toFixed(2)}
          </Typography>
        )}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={isLoading || !isBalanced}
          startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {initialData ? 'Actualizar Asiento' : 'Guardar Asiento'}
        </Button>
      </Box>
    </Box>
  )
}
