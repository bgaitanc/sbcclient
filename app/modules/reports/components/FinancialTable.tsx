import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material'
import type { BalanceSheetLine } from '@shared/types/reports/reportTypes'

interface FinancialTableProps {
  title: string
  lines: BalanceSheetLine[]
  total: number
  netIncome?: number
  totalWithNetIncome?: number
  totalLabel?: string
}

export const FinancialTable = ({
  title,
  lines,
  total,
  netIncome,
  totalWithNetIncome,
  totalLabel = 'Total'
}: FinancialTableProps) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" gutterBottom color="primary">
      {title}
    </Typography>
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Cuenta</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              Monto
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.accountId}>
              <TableCell>{line.accountCode}</TableCell>
              <TableCell>{line.accountName}</TableCell>
              <TableCell align="right">
                {line.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </TableCell>
            </TableRow>
          ))}
          {netIncome !== undefined && (
            <TableRow sx={{ fontStyle: 'italic' }}>
              <TableCell />
              <TableCell>Utilidad del Ejercicio</TableCell>
              <TableCell align="right">
                {netIncome.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </TableCell>
            </TableRow>
          )}
          <TableRow sx={{ bgcolor: 'action.selected' }}>
            <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
              {totalLabel}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
              {(totalWithNetIncome ?? total).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)
