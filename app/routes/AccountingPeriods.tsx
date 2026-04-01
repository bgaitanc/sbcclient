import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useGetAccountingPeriodsQuery } from '../redux/api/apiSlice'
import { CreatePeriodDialog } from '../modules/accountingPeriods/components/CreatePeriodDialog'
import { ClosePeriodDialog } from '../modules/accountingPeriods/components/ClosePeriodDialog'

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

const AccountingPeriods = () => {
  const { data, isLoading, refetch } = useGetAccountingPeriodsQuery()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedPeriodToClose, setSelectedPeriodToClose] = useState<{
    year: number
    month: number
  } | null>(null)

  const handleCloseSuccess = () => {
    void refetch()
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  const periods = data?.data ?? []

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h4">Periodos Contables</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setIsCreateOpen(true)
          }}
        >
          Abrir Nuevo Periodo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Año</TableCell>
              <TableCell>Mes</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Cerrado el</TableCell>
              <TableCell>Cerrado por</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {periods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay periodos contables registrados.
                </TableCell>
              </TableRow>
            ) : (
              periods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>{period.year}</TableCell>
                  <TableCell>{monthNames[period.month - 1]}</TableCell>
                  <TableCell>
                    {period.isClosed ? (
                      <Chip
                        label="Cerrado"
                        color="error"
                        size="small"
                        icon={<LockIcon />}
                      />
                    ) : (
                      <Chip label="Abierto" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {period.closedAt != null
                      ? new Date(period.closedAt).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell>{period.closedBy ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      {period.isClosed &&
                        period.closingJournalEntryId != null && (
                          <Tooltip title="Ver Asiento de Cierre">
                            <IconButton size="small">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      {!period.isClosed && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<LockIcon />}
                          onClick={() => {
                            setSelectedPeriodToClose({
                              year: period.year,
                              month: period.month
                            })
                          }}
                        >
                          Cerrar
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CreatePeriodDialog
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false)
        }}
        onSuccess={handleCloseSuccess}
      />

      <ClosePeriodDialog
        open={selectedPeriodToClose != null}
        onClose={() => {
          setSelectedPeriodToClose(null)
        }}
        onSuccess={handleCloseSuccess}
        period={selectedPeriodToClose}
      />
    </Box>
  )
}

export default AccountingPeriods
