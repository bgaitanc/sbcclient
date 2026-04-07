import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack
} from '@mui/material'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import PaymentsIcon from '@mui/icons-material/Payments'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import { useGetDashboardSummaryQuery } from '@/redux/api/apiSlice'

interface SummaryCardProps {
  title: string
  amount: number
  icon: React.ReactNode
  color: string
}

function SummaryCard({ title, amount, icon, color }: SummaryCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              p: 1,
              borderRadius: 2,
              display: 'flex'
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {amount.toLocaleString('es-NI', {
                style: 'currency',
                currency: 'NIO'
              })}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { data: response, isLoading } = useGetDashboardSummaryQuery()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  const summary = response?.data

  if (summary === undefined) {
    return <Typography>No hay datos disponibles.</Typography>
  }

  return (
    <Box sx={{ p: 1, width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard Financiero
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Total Activos"
            amount={summary.totalAssets}
            icon={<AccountBalanceIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Total Pasivos"
            amount={summary.totalLiabilities}
            icon={<PaymentsIcon />}
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Patrimonio"
            amount={summary.totalEquity}
            icon={<ReceiptLongIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title="Utilidad Neta"
            amount={summary.netIncome}
            icon={
              summary.netIncome >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />
            }
            color={summary.netIncome >= 0 ? 'info' : 'warning'}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Ingresos"
            amount={summary.totalRevenue}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Costos"
            amount={summary.totalCosts}
            icon={<TrendingDownIcon />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <SummaryCard
            title="Gastos"
            amount={summary.totalExpenses}
            icon={<TrendingDownIcon />}
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Movimientos Recientes
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Monto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.recentMovements.map((movement) => (
                  <TableRow key={movement.id} hover>
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {movement.code}
                    </TableCell>
                    <TableCell>
                      {new Date(movement.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{movement.description}</TableCell>
                    <TableCell align="right">
                      {movement.totalAmount.toLocaleString('es-NI', {
                        minimumFractionDigits: 2
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                {summary.recentMovements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      No hay movimientos recientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Cuentas con Mayor Actividad
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Cuenta</TableCell>
                  <TableCell align="right">Mov.</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summary.topAccounts.map((account) => (
                  <TableRow key={account.accountId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {account.accountName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {account.accountCode}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{account.movementCount}</TableCell>
                    <TableCell align="right">
                      {account.totalAmount.toLocaleString('es-NI', {
                        minimumFractionDigits: 2
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                {summary.topAccounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                      No hay actividad registrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  )
}
