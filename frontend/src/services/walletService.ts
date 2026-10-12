import type { Wallet } from '../types/wallet'
import { request } from './http'

export const walletService = {
  mine() {
    return request<Wallet>('/my-vault/me')
  },
}
