import { describe, it, expect } from 'vitest'
import { isNegotiationParticipant } from '@/lib/api/negotiation-access'

describe('Negotiation Access', () => {
  describe('isNegotiationParticipant', () => {
    it('should return true for buyer', () => {
      const result = isNegotiationParticipant('buyer-1', 'buyer-1', 'seller-1')
      expect(result).toBe(true)
    })

    it('should return true for seller', () => {
      const result = isNegotiationParticipant('seller-1', 'buyer-1', 'seller-1')
      expect(result).toBe(true)
    })

    it('should return false for non-participant', () => {
      const result = isNegotiationParticipant('user-1', 'buyer-1', 'seller-1')
      expect(result).toBe(false)
    })
  })
})