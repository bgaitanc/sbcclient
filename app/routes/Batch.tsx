import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  TablePagination
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import HistoryIcon from '@mui/icons-material/History'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { useRef, useState } from 'react'
import { useBulkImportActions } from '@modules/bulkImport/hooks/useBulkImportActions'

export default function Batch() {
  const {
    handleUpload,
    isUploading,
    history,
    isLoadingHistory,
    totalCount,
    pageNumber,
    pageSize,
    handlePageChange,
    handlePageSizeChange
  } = useBulkImportActions()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file !== undefined) {
      setSelectedFile(file)
    }
  }

  const onUpload = async () => {
    if (selectedFile !== null) {
      const result = await handleUpload(selectedFile)
      if (result.success) {
        setSelectedFile(null)
        if (fileInputRef.current !== null) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const getStatusChip = (errorCount: number, successCount: number) => {
    if (errorCount === 0) {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Completado"
          color="success"
          size="small"
        />
      )
    }

    if (successCount > 0) {
      return (
        <Chip
          icon={<ErrorIcon />}
          label="Parcial"
          color="warning"
          size="small"
        />
      )
    }

    return (
      <Chip icon={<ErrorIcon />} label="Fallido" color="error" size="small" />
    )
  }

  return (
    <Box className="p-6">
      <Typography variant="h4" className="mb-6 font-bold text-primary">
        Carga Masiva de Asientos
      </Typography>

      <Card className="mb-8 border border-outline-variant shadow-sm">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Subir Archivo Excel
          </Typography>
          <Box className="flex flex-col md:flex-row items-center gap-4">
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              className="w-full md:w-auto"
            >
              Seleccionar Archivo
              <input
                type="file"
                hidden
                accept=".xlsx, .xls"
                onChange={onFileChange}
                ref={fileInputRef}
              />
            </Button>
            {selectedFile !== null && (
              <Typography variant="body2" className="text-on-surface-variant">
                Archivo: <strong>{selectedFile.name}</strong> (
                {(selectedFile.size / 1024).toFixed(2)} KB)
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={() => {
                void onUpload()
              }}
              disabled={selectedFile === null || isUploading}
              className="w-full md:w-auto"
            >
              {isUploading ? <CircularProgress size={24} /> : 'Procesar Carga'}
            </Button>
          </Box>
          <Typography variant="caption" className="mt-4 block text-outline">
            * El archivo debe ser un formato Excel (.xlsx) con la estructura de
            asientos contables definida.
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h5" className="mb-4 flex items-center gap-2">
        <HistoryIcon /> Historial de Cargas
      </Typography>

      <TableContainer
        component={Paper}
        className="border border-outline-variant"
      >
        <Table>
          <TableHead className="bg-surface-container">
            <TableRow>
              <TableCell className="font-bold">Fecha/Hora</TableCell>
              <TableCell className="font-bold">Archivo</TableCell>
              <TableCell className="font-bold">Registros</TableCell>
              <TableCell className="font-bold">Éxito</TableCell>
              <TableCell className="font-bold">Error</TableCell>
              <TableCell className="font-bold">Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingHistory ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-8">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="py-8">
                  No hay registros de cargas masivas.
                </TableCell>
              </TableRow>
            ) : (
              history.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{item.fileName}</TableCell>
                  <TableCell>{item.totalCount}</TableCell>
                  <TableCell sx={{ color: 'success.main' }}>
                    {item.successCount}
                  </TableCell>
                  <TableCell sx={{ color: 'error.main' }}>
                    {item.errorCount}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(item.errorCount, item.successCount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount}
        page={pageNumber - 1}
        onPageChange={(_e, page) => {
          handlePageChange(page + 1)
        }}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(e) => {
          handlePageSizeChange(parseInt(e.target.value, 10))
        }}
        labelRowsPerPage="Filas por página"
      />
    </Box>
  )
}
