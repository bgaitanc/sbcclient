import { useState, Fragment } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Stack,
  Collapse,
  TablePagination
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useGetJournalEntriesQuery } from '@/redux/api/apiSlice'
import { JournalEntryForm } from '@/modules/journalEntries/components/JournalEntryForm'
import type { JournalEntry } from '@shared/types/journalEntries/journalEntryTypes'
import { useJournalEntryActions } from '@/modules/journalEntries/hooks/useJournalEntryActions'

interface RowProps {
  entry: JournalEntry
  onEdit: (entry: JournalEntry) => void
  onDelete: (id: string) => void
}

function Row({ entry, onEdit, onDelete }: RowProps) {
  const [open, setOpen] = useState(false)

  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell width="50px">
          <IconButton
            size="small"
            onClick={() => {
              setOpen(!open)
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{entry.code}</TableCell>
        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
        <TableCell>{entry.description}</TableCell>
        <TableCell align="right">
          {entry.totalDebit.toLocaleString(undefined, {
            minimumFractionDigits: 2
          })}
        </TableCell>
        <TableCell align="center">
          <Chip
            label={entry.isPosted ? 'Posteado' : 'Borrador'}
            color={entry.isPosted ? 'success' : 'warning'}
            size="small"
          />
        </TableCell>
        <TableCell align="right">
          <IconButton
            size="small"
            onClick={() => {
              onEdit(entry)
            }}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              onDelete(entry.id)
            }}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto">
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Detalles del Asiento
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Código Cuenta</TableCell>
                    <TableCell>Nombre Cuenta</TableCell>
                    <TableCell align="right">Debe</TableCell>
                    <TableCell align="right">Haber</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entry.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.accountCode}</TableCell>
                      <TableCell>{line.accountName}</TableCell>
                      <TableCell align="right">
                        {line.debit > 0
                          ? line.debit.toLocaleString(undefined, {
                              minimumFractionDigits: 2
                            })
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {line.credit > 0
                          ? line.credit.toLocaleString(undefined, {
                              minimumFractionDigits: 2
                            })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

export default function JournalEntries() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const {
    data: response,
    isLoading,
    refetch
  } = useGetJournalEntriesQuery(
    {
      pageNumber: page + 1,
      pageSize
    },
    {
      refetchOnMountOrArgChange: true
    }
  )
  const { handleDelete } = useJournalEntryActions()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  const handleAddNew = () => {
    setSelectedEntry(null)
    setIsFormOpen(true)
  }

  const handleEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsFormOpen(true)
  }

  const onDelete = async (id: string) => {
    // eslint-disable-next-line no-alert -- Confirmación nativa
    if (window.confirm('¿Está seguro de eliminar este asiento?')) {
      try {
        await handleDelete(id)
        void refetch()
      } catch (error) {
        // eslint-disable-next-line no-console -- Error en eliminación
        console.error('Error al eliminar el asiento:', error)
      }
    }
  }

  const handleDeleteClick = (id: string) => {
    void onDelete(id)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedEntry(null)
    void refetch()
  }

  return (
    <Box sx={{ p: 1, width: '100%' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Asientos Contables</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Nuevo Asiento
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Código</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Monto Total</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(response?.data.items ?? []).map((entry) => (
                <Row
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
              {(response?.data.items.length ?? 0) === 0 && (
                <TableRow key="no-entries">
                  <TableCell colSpan={7} align="center">
                    No hay asientos contables registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={response?.data.totalCount ?? 0}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(_e, newPage) => {
              setPage(newPage)
            }}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10))
              setPage(0)
            }}
          />
        </TableContainer>
      )}

      <Dialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <JournalEntryForm
            initialData={selectedEntry}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
}
