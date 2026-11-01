import { useEffect, useState } from 'react'
import { walletService } from '../services/walletService'
import type { Wallet } from '../types/wallet'
import { toErrorMessage } from '../utils/errors'

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    walletService
      .mine()
      .then((data) => {
        if (active) setWallet(data)
      })
      .catch((err: unknown) => {
        if (active) setError(toErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { wallet, loading, error }
}
