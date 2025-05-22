
import { StyleSheet } from '@react-pdf/renderer'

// Estilos para o documento PDF
export const styles = StyleSheet.create({
  body: { padding: 24, fontSize: 12, fontFamily: 'Helvetica' },
  header: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  date: { fontSize: 10, marginBottom: 10 },
  tableContainer: { width: 'auto', marginBottom: 10 },
  tableRow: { flexDirection: 'row' },
  tableHeader: {
    width: '20%',
    fontWeight: 'bold',
    backgroundColor: '#f2f2f2',
    padding: 4,
    border: 1,
    borderColor: '#ddd',
  },
  tableCell: { width: '20%', padding: 4, border: 1, borderColor: '#ddd' },
  total: { marginTop: 10, fontWeight: 'bold', textAlign: 'right' },
  footer: { marginTop: 20, fontSize: 10, textAlign: 'center' },
})
