import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress
} from '@mui/material'
import { useAccountingPeriodActions } from '../hooks/useAccountingPeriodActions'

interface CreatePeriodDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreatePeriodDialog = ({
  open,
  onClose,
  onSuccess
}: CreatePeriodDialogProps) => {
  const { createFormik, isLoading } = useAccountingPeriodActions(() => {
    onSuccess()
    onClose()
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Abrir Nuevo Periodo Contable</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={2}>
          <TextField
            fullWidth
            id="year"
            name="year"
            label="Año"
            type="number"
            value={createFormik.values.year}
            onChange={createFormik.handleChange}
            error={
              createFormik.touched.year === true &&
              Boolean(createFormik.errors.year)
            }
            helperText={
              createFormik.touched.year === true
                ? createFormik.errors.year
                : undefined
            }
          />

          <TextField
            fullWidth
            id="month"
            name="month"
            label="Mes"
            type="number"
            value={createFormik.values.month}
            onChange={createFormik.handleChange}
            error={
              createFormik.touched.month === true &&
              Boolean(createFormik.errors.month)
            }
            helperText={
              createFormik.touched.month === true
                ? createFormik.errors.month
                : undefined
            }
            slotProps={{
              htmlInput: { min: 1, max: 12 }
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            void createFormik.submitForm()
          }}
          disabled={isLoading || !createFormik.isValid}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          Abrir Periodo
        </Button>
      </DialogActions>
    </Dialog>
  )
}
