import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Paper
} from '@mui/material'
import { useGetIncomeStatementQuery } from '@redux/api/apiSlice'
import { FinancialTable } from './FinancialTable'

interface IncomeStatementViewProps {
  startDate: string
  endDate: string
}

export const IncomeStatementView = ({
  startDate,
  endDate
}: IncomeStatementViewProps) => {
  const { data, isLoading, isError, error } = useGetIncomeStatementQuery(
    { startDate, endDate },
    { skip: startDate === '' || endDate === '' }
  )

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Alert severity="error">
        Error al cargar el Estado de Resultados: {JSON.stringify(error)}
      </Alert>
    )
  }

  const report = data?.data

  if (report === undefined) {
    return (
      <Alert severity="info">No hay datos para el período seleccionado.</Alert>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
        Estado de Resultados
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Del {new Date(report.startDate).toLocaleDateString()} al{' '}
        {new Date(report.endDate).toLocaleDateString()}
      </Typography>
      <Divider sx={{ my: 3 }} />

      <FinancialTable
        title="Ingresos"
        lines={report.revenues}
        total={report.totalRevenues}
        totalLabel="Total Ingresos"
      />

      <FinancialTable
        title="Costos"
        lines={report.costs}
        total={report.totalCosts}
        totalLabel="Total Costos"
      />

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 4,
          bgcolor: 'action.selected',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Utilidad Bruta
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {report.grossProfit.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </Typography>
      </Paper>

      <FinancialTable
        title="Gastos"
        lines={report.expenses}
        total={report.totalExpenses}
        totalLabel="Total Gastos"
      />

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mt: 4,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Utilidad Neta
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {report.netIncome.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </Typography>
      </Paper>
    </Box>
  )
}
