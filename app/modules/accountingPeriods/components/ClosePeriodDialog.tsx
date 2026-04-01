import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  CircularProgress
} from '@mui/material'
import { useAccountingPeriodActions } from '../hooks/useAccountingPeriodActions'
import { useEffect } from 'react'

interface ClosePeriodDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  period: { year: number; month: number } | null
}

export const ClosePeriodDialog = ({
  open,
  onClose,
  onSuccess,
  period
}: ClosePeriodDialogProps) => {
  const { closeFormik, isLoading, equityAccounts } = useAccountingPeriodActions(
    () => {
      onSuccess()
      onClose()
    }
  )

  useEffect(() => {
    if (open && period != null) {
      void closeFormik.setValues({
        year: period.year,
        month: period.month,
        equityAccountId: ''
      })
    }
  }, [open, period])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cerrar Periodo Contable</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          <Typography variant="body1">
            Se cerrará el periodo{' '}
            <strong>
              {period?.year} / {period?.month}
            </strong>
            . Esta acción generará un asiento de cierre y no permitirá más
            cambios en este periodo.
          </Typography>

          <TextField
            select
            fullWidth
            id="equityAccountId"
            name="equityAccountId"
            label="Cuenta de Patrimonio para Cierre"
            value={closeFormik.values.equityAccountId}
            onChange={closeFormik.handleChange}
            error={
              closeFormik.touched.equityAccountId === true &&
              Boolean(closeFormik.errors.equityAccountId)
            }
            helperText={
              closeFormik.touched.equityAccountId === true
                ? closeFormik.errors.equityAccountId
                : 'Seleccione la cuenta donde se registrará la utilidad/pérdida'
            }
          >
            {equityAccounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.code} - {account.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => {
            void closeFormik.submitForm()
          }}
          disabled={isLoading || !closeFormik.isValid}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          Confirmar Cierre
        </Button>
      </DialogActions>
    </Dialog>
  )
}
