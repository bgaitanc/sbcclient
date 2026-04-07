import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Paper
} from '@mui/material'
import { useGetBalanceSheetQuery } from '@redux/api/apiSlice'
import { FinancialTable } from './FinancialTable'

interface BalanceSheetViewProps {
  date: string
  includeUnposted?: boolean
}

export const BalanceSheetView = ({
  date,
  includeUnposted = false
}: BalanceSheetViewProps) => {
  const { data, isLoading, isError, error } = useGetBalanceSheetQuery(
    { date, includeUnposted },
    {
      skip: date === ''
    }
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
        Error al cargar el Balance General: {JSON.stringify(error)}
      </Alert>
    )
  }

  const report = data?.data

  if (report === undefined) {
    return (
      <Alert severity="info">No hay datos para la fecha seleccionada.</Alert>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
        Balance General
      </Typography>
      <Typography variant="subtitle1" align="center" gutterBottom>
        Al {new Date(report.date).toLocaleDateString()}
      </Typography>
      <Divider sx={{ my: 3 }} />

      <FinancialTable
        title="Activos"
        lines={report.assets}
        total={report.totalAssets}
        totalLabel="Total Activos"
      />

      <FinancialTable
        title="Pasivos"
        lines={report.liabilities}
        total={report.totalLiabilities}
        totalLabel="Total Pasivos"
      />

      <FinancialTable
        title="Patrimonio"
        lines={report.equity}
        total={report.totalEquity}
        netIncome={report.netIncome}
        totalWithNetIncome={report.totalEquity + report.netIncome}
        totalLabel="Total Patrimonio"
      />

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mt: 4,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            Total Pasivo + Patrimonio
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {report.totalLiabilitiesAndEquity.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
