import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Stack,
  Button,
  FormControlLabel,
  Checkbox,
  Chip,
  ButtonGroup,
  Tooltip,
  CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { BalanceSheetView } from '../modules/reports/components/BalanceSheetView'
import { IncomeStatementView } from '../modules/reports/components/IncomeStatementView'
import { useReportActions } from '../modules/reports/hooks/useReportActions'

const Reports = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const [today] = new Date().toISOString().split('T')
  const [firstDayOfYear] = new Date(new Date().getFullYear(), 0, 1)
    .toISOString()
    .split('T')

  const [date, setDate] = useState(today)
  const [startDate, setStartDate] = useState(firstDayOfYear)
  const [endDate, setEndDate] = useState(today)
  const [includeUnposted, setIncludeUnposted] = useState(false)

  const [appliedDate, setAppliedDate] = useState(today)
  const [appliedStartDate, setAppliedStartDate] = useState(firstDayOfYear)
  const [appliedEndDate, setAppliedEndDate] = useState(today)
  const [appliedIncludeUnposted, setAppliedIncludeUnposted] = useState(false)

  const {
    handleDownloadBalanceSheetExcel,
    handleDownloadBalanceSheetPdf,
    handleDownloadIncomeStatementExcel,
    handleDownloadIncomeStatementPdf,
    isDownloading
  } = useReportActions()

  const handleApplyFilters = () => {
    setAppliedIncludeUnposted(includeUnposted)
    if (tabIndex === 0) {
      setAppliedDate(date)
    } else {
      setAppliedStartDate(startDate)
      setAppliedEndDate(endDate)
    }
  }

  return (
    <Box sx={{ p: 1, width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Informes Financieros
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue: number) => {
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeUnposted}
                  onChange={(e) => {
                    setIncludeUnposted(e.target.checked)
                  }}
                />
              }
              label="Incluir no publicados (Provisional)"
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleApplyFilters}
            >
              Generar Informe
            </Button>
            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Exportar a Excel">
                <Button
                  onClick={() => {
                    if (tabIndex === 0) {
                      void handleDownloadBalanceSheetExcel(
                        appliedDate,
                        appliedIncludeUnposted
                      )
                    } else {
                      void handleDownloadIncomeStatementExcel(
                        appliedStartDate,
                        appliedEndDate,
                        appliedIncludeUnposted
                      )
                    }
                  }}
                  disabled={isDownloading}
                  color="success"
                >
                  {isDownloading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <FileDownloadIcon />
                  )}
                  Excel
                </Button>
              </Tooltip>
              <Tooltip title="Exportar a PDF">
                <Button
                  onClick={() => {
                    if (tabIndex === 0) {
                      void handleDownloadBalanceSheetPdf(
                        appliedDate,
                        appliedIncludeUnposted
                      )
                    } else {
                      void handleDownloadIncomeStatementPdf(
                        appliedStartDate,
                        appliedEndDate,
                        appliedIncludeUnposted
                      )
                    }
                  }}
                  disabled={isDownloading}
                  color="error"
                >
                  {isDownloading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <PictureAsPdfIcon />
                  )}
                  PDF
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Stack>
        </Box>
      </Paper>

      <Paper sx={{ minHeight: 400 }}>
        {appliedIncludeUnposted && (
          <Box sx={{ p: 2, pb: 0 }}>
            <Chip
              icon={<WarningAmberIcon />}
              label="Informe Provisional: Incluye transacciones no publicadas"
              color="warning"
              variant="outlined"
              sx={{ width: '100%', justifyContent: 'flex-start' }}
            />
          </Box>
        )}
        {tabIndex === 0 ? (
          <BalanceSheetView
            date={appliedDate}
            includeUnposted={appliedIncludeUnposted}
          />
        ) : (
          <IncomeStatementView
            startDate={appliedStartDate}
            endDate={appliedEndDate}
            includeUnposted={appliedIncludeUnposted}
          />
        )}
      </Paper>
    </Box>
  )
}

export default Reports
