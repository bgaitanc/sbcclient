import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Stack,
  Button
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { BalanceSheetView } from '../modules/reports/components/BalanceSheetView'
import { IncomeStatementView } from '../modules/reports/components/IncomeStatementView'

const Reports = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const today = new Date().toISOString().split('T')[0]
  const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1)
    .toISOString()
    .split('T')[0]

  const [date, setDate] = useState(today)
  const [startDate, setStartDate] = useState(firstDayOfYear)
  const [endDate, setEndDate] = useState(today)

  const [appliedDate, setAppliedDate] = useState(today)
  const [appliedStartDate, setAppliedStartDate] = useState(firstDayOfYear)
  const [appliedEndDate, setAppliedEndDate] = useState(today)

  const handleApplyFilters = () => {
    if (tabIndex === 0) {
      setAppliedDate(date)
    } else {
      setAppliedStartDate(startDate)
      setAppliedEndDate(endDate)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Informes Financieros
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => {
            setTabIndex(newValue)
          }}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Balance General" />
          <Tab label="Estado de Resultados" />
        </Tabs>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
          >
            {tabIndex === 0 ? (
              <TextField
                type="date"
                label="Fecha de Corte"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                size="small"
              />
            ) : (
              <>
                <TextField
                  type="date"
                  label="Fecha Inicio"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  size="small"
                />
                <TextField
                  type="date"
                  label="Fecha Fin"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value)
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  size="small"
                />
              </>
            )}
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleApplyFilters}
            >
              Generar Informe
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Paper sx={{ minHeight: 400 }}>
        {tabIndex === 0 ? (
          <BalanceSheetView date={appliedDate} />
        ) : (
          <IncomeStatementView
            startDate={appliedStartDate}
            endDate={appliedEndDate}
          />
        )}
      </Paper>
    </Box>
  )
}

export default Reports
