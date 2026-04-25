import type { SumUpTransaction } from './client'
import type { TablesInsert } from '@/types/database'

type RegistroInsert = TablesInsert<'registros_financieros'>

const TASA_IVA = 0.19

export function mapSumUpTransactionToRegistro(
  tx: SumUpTransaction,
  organizacionId: string,
  sucursalId: string
): RegistroInsert {
  const montoTotal = tx.amount
  const montoNeto = Math.round(montoTotal / (1 + TASA_IVA))
  const montoImpuesto = montoTotal - montoNeto

  return {
    tipo_registro: 'ingreso',
    fuente: 'sumup',
    id_externo: tx.id,
    metadatos_externos: {
      transaction_code: tx.transaction_code,
      payment_type: tx.payment_type,
      status: tx.status,
      card: tx.card ?? null,
      receipt_no: tx.receipt_no ?? null,
    },
    tipo_documento: 'boleta',
    estado: 'pagado',
    fecha_emision: tx.timestamp.split('T')[0],
    moneda: tx.currency,
    monto_neto: montoNeto,
    monto_impuesto: montoImpuesto,
    monto_total: montoTotal,
    organizacion_id: organizacionId,
    sucursal_id: sucursalId,
  }
}
