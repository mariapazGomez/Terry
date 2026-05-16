export type SumupTransaction = {
  id: string
  amount: number
  currency: string
  status: string
  payment_type: "POS" | "CASH" | string
  card_type?: string
  timestamp: string
  transaction_code: string
  type: string
}
