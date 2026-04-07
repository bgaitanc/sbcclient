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
  TablePagination,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import { useGetLogsQuery } from '@/redux/api/apiSlice'
import { TransactionStatus } from '@shared/types/logs/logTypes'

export default function Logs() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState<TransactionStatus | ''>('')
  const [action, setAction] = useState('')

  const { data: response, isLoading } = useGetLogsQuery({
    pageNumber: page + 1,
    pageSize,
    status: status !== '' ? status : undefined,
    action: action !== '' ? action : undefined
  })

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getStatusChip = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Success:
        return <Chip label="Éxito" color="success" size="small" />
      case TransactionStatus.Failure:
        return <Chip label="Error" color="error" size="small" />
      case TransactionStatus.Warning:
        return <Chip label="Advertencia" color="warning" size="small" />
    }
    return <Chip label={status} size="small" />
  }

  return (
    <Box sx={{ p: 1, width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Logs de Transacciones
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Acción"
            size="small"
            value={action}
            onChange={(e) => {
              setAction(e.target.value)
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={status}
              label="Estado"
              onChange={(e) => {
                setStatus(e.target.value as TransactionStatus | '')
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value={TransactionStatus.Success}>Éxito</MenuItem>
              <MenuItem value={TransactionStatus.Failure}>Error</MenuItem>
              <MenuItem value={TransactionStatus.Warning}>Advertencia</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha/Hora</TableCell>
                <TableCell>Acción</TableCell>
                <TableCell>Entidad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Detalles</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {response?.data.items.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    {new Date(log.logDate).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {log.entityName}{' '}
                    {log.entityId !== undefined && `(${log.entityId})`}
                  </TableCell>
                  <TableCell>{getStatusChip(log.status)}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {log.errorMessage ?? log.details}
                  </TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                </TableRow>
              ))}
              {(response?.data.items.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No se encontraron logs.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={response?.data.totalCount ?? 0}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
    </Box>
  )
}
