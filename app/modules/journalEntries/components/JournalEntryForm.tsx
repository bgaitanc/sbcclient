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
  const { formik, isLoading, validateBalance } = useJournalEntryActions(
    initialData,
    onSuccess
  )
  const { data: accountsResponse } = useGetAccountsTreeQuery()

  // Obtener lista plana de cuentas para el select
  const flattenAccounts = (accounts: Account[]): Account[] => {
    let result: Account[] = []
    accounts.forEach((acc) => {
      result.push(acc)
      const { children } = acc
      if (children != null && children.length > 0) {
        result = result.concat(flattenAccounts(children))
      }
    })
    return result
  }

  const accountList =
    accountsResponse?.data != null ? flattenAccounts(accountsResponse.data) : []

  const handleAddLine = () => {
    const newLines = [
      ...formik.values.lines,
      { accountId: '', debit: 0, credit: 0 }
    ]
    void formik.setFieldValue('lines', newLines)
  }

  const handleRemoveLine = (index: number) => {
    if (formik.values.lines.length <= 2) return
    const newLines = [...formik.values.lines]
    newLines.splice(index, 1)
    void formik.setFieldValue('lines', newLines)
  }

  const handleLineChange = (
    index: number,
    field: keyof CreateJournalEntryLineReq,
    value: string | number
  ) => {
    const newLines = [...formik.values.lines]
    const updatedLine = { ...newLines[index], [field]: value }

    // Si se edita el debe, el haber debería ser 0 (o viceversa)
    if (field === 'debit' && Number(value) > 0) {
      updatedLine.credit = 0
    } else if (field === 'credit' && Number(value) > 0) {
      updatedLine.debit = 0
    }

    newLines[index] = updatedLine
    void formik.setFieldValue('lines', newLines)
  }

  const totalDebit = formik.values.lines.reduce(
    (sum, l) => sum + (l.debit !== 0 ? Number(l.debit) : 0),
    0
  )
  const totalCredit = formik.values.lines.reduce(
    (sum, l) => sum + (l.credit !== 0 ? Number(l.credit) : 0),
    0
  )
  const isBalanced = validateBalance(formik.values.lines)

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {initialData != null
          ? 'Editar Asiento Contable'
          : 'Nuevo Asiento Contable'}
      </Typography>

      {formik.submitCount > 0 && !formik.isValid && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {Object.values(formik.errors).map((err, i) => (
            <div key={i}>
              {typeof err === 'string' ? err : 'Error en el formulario'}
            </div>
          ))}
        </Alert>
      )}

      <Stack spacing={3} mb={4}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            id="date"
            name="date"
            label="Fecha"
            type="date"
            value={formik.values.date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.date === true && formik.errors.date != null}
            helperText={
              formik.touched.date === true ? formik.errors.date : undefined
            }
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: { sm: '250px' } }}
          />
          <TextField
            fullWidth
            id="description"
            name="description"
            label="Descripción"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.description === true &&
              formik.errors.description != null
            }
            helperText={
              formik.touched.description === true
                ? formik.errors.description
                : undefined
            }
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
              {formik.values.lines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      name={`lines[${index}].accountId`}
                      value={line.accountId}
                      onChange={(e) => {
                        handleLineChange(index, 'accountId', e.target.value)
                      }}
                      error={
                        formik.touched.lines?.[index]?.accountId === true &&
                        formik.errors.lines?.[index] != null
                      }
                      helperText={
                        formik.touched.lines?.[index]?.accountId === true &&
                        typeof formik.errors.lines?.[index] === 'object' &&
                        formik.errors.lines[index] !== null
                          ? (
                              formik.errors.lines[index] as {
                                accountId?: string
                              }
                            ).accountId
                          : undefined
                      }
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
                      name={`lines[${index}].debit`}
                      value={line.debit}
                      onChange={(e) => {
                        handleLineChange(index, 'debit', Number(e.target.value))
                      }}
                      onBlur={formik.handleBlur}
                      slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      name={`lines[${index}].credit`}
                      value={line.credit}
                      onChange={(e) => {
                        handleLineChange(
                          index,
                          'credit',
                          Number(e.target.value)
                        )
                      }}
                      onBlur={formik.handleBlur}
                      slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => {
                        handleRemoveLine(index)
                      }}
                      disabled={formik.values.lines.length <= 2}
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
        {typeof formik.errors.lines === 'string' && (
          <Typography variant="caption" color="error">
            * {formik.errors.lines}
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
          disabled={isLoading || !isBalanced || !formik.isValid}
          startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {initialData != null ? 'Actualizar Asiento' : 'Guardar Asiento'}
        </Button>
      </Box>
    </Box>
  )
}
