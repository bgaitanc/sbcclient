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
  Chip
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import HistoryIcon from '@mui/icons-material/History'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import { useRef, useState } from 'react'
import { useBulkImportActions } from '@modules/bulkImport/hooks/useBulkImportActions'

export default function Batch() {
  const { handleUpload, isUploading, history, isLoadingHistory } =
    useBulkImportActions()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const onUpload = async () => {
    if (selectedFile) {
      const result = await handleUpload(selectedFile)
      if (result.success) {
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'completado':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Completado"
            color="success"
            size="small"
          />
        )
      case 'failed':
      case 'fallido':
        return (
          <Chip
            icon={<ErrorIcon />}
            label="Fallido"
            color="error"
            size="small"
          />
        )
      default:
        return <Chip label={status} size="small" />
    }
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
            {selectedFile && (
              <Typography variant="body2" className="text-on-surface-variant">
                Archivo: <strong>{selectedFile.name}</strong> (
                {(selectedFile.size / 1024).toFixed(2)} KB)
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={onUpload}
              disabled={!selectedFile || isUploading}
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
                    {new Date(item.processedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{item.fileName}</TableCell>
                  <TableCell>{item.totalRecords}</TableCell>
                  <TableCell className="text-success-main">
                    {item.successRecords}
                  </TableCell>
                  <TableCell className="text-error-main">
                    {item.errorRecords}
                  </TableCell>
                  <TableCell>{getStatusChip(item.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
