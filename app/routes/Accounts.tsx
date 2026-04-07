import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Button,
  Stack
} from '@mui/material'
import { RichTreeView } from '@mui/x-tree-view/RichTreeView'
import { useGetAccountsTreeQuery } from '@redux/api/apiSlice'
import { useState, useCallback, useMemo } from 'react'
import type { Account } from '@shared/types/accounts/accountTypes'
import { AccountForm } from '@/modules/accounts/components/AccountForm'
import AddIcon from '@mui/icons-material/Add'

export default function Accounts() {
  const { data: response, isLoading, isError } = useGetAccountsTreeQuery()
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  )
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [isAddingRoot, setIsAddingRoot] = useState(false)

  const accounts = useMemo(() => response?.data ?? [], [response])

  // Helper to find account by ID recursively
  const findAccount = useCallback(
    (nodes: Account[], id: string): Account | null => {
      const search = (currentNodes: Account[]): Account | null => {
        for (const node of currentNodes) {
          if (node.id === id) return node
          if (node.children.length > 0) {
            const found = search(node.children)
            if (found != null) return found
          }
        }
        return null
      }
      return search(nodes)
    },
    []
  )

  const selectedAccount = useMemo(() => {
    if (selectedAccountId == null) return null
    return findAccount(accounts, selectedAccountId)
  }, [accounts, selectedAccountId, findAccount])

  const handleItemSelection = (
    _event: React.SyntheticEvent | null,
    itemId: string | null
  ) => {
    setSelectedAccountId(itemId)
    setIsAddingChild(false)
    setIsAddingRoot(false)
  }

  const handleAddChild = () => {
    setIsAddingChild(true)
    setIsAddingRoot(false)
  }

  const handleAddRoot = () => {
    setSelectedAccountId(null)
    setIsAddingChild(false)
    setIsAddingRoot(true)
  }

  const handleSuccess = () => {
    setSelectedAccountId(null)
    setIsAddingChild(false)
    setIsAddingRoot(false)
  }

  const handleCancel = () => {
    setIsAddingChild(false)
    setIsAddingRoot(false)
    if (isAddingRoot) {
      setSelectedAccountId(null)
    }
  }

  return (
    <Box sx={{ p: 1, width: '100%' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Plan de Cuentas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddRoot}
        >
          Nueva Cuenta Raíz
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2, height: 'calc(100vh - 250px)', overflow: 'auto' }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Typography color="error">
                Error al cargar el árbol de cuentas.
              </Typography>
            ) : (
              <RichTreeView
                items={accounts}
                getItemLabel={(item) => `${item.code} - ${item.name}`}
                onSelectedItemsChange={handleItemSelection}
                selectedItems={selectedAccountId}
                sx={{ height: 'fit-content', flexGrow: 1 }}
              />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, minHeight: '300px' }}>
            {selectedAccount != null || isAddingRoot ? (
              <Box>
                {!isAddingChild && !isAddingRoot && (
                  <Box
                    sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddChild}
                    >
                      Agregar Cuenta Hija
                    </Button>
                  </Box>
                )}
                <AccountForm
                  selectedAccount={selectedAccount}
                  isAddingChild={isAddingChild}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.secondary',
                  p: 5
                }}
              >
                <Typography>
                  Seleccione una cuenta para editar o agregar subcuentas.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
