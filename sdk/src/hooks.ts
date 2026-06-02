import { useReadContract, useWriteContract, useAccount, useBalance } from 'wagmi'
import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { didContract, registryContract, CERES_REGISTRY_ADDRESS } from './addresses'
import type { ProfileWithId, UseProfileResult } from './types'
import { LEVEL_NAMES } from './types'

// ─────────────────────────────────────────────────────
// Read Hooks
// ─────────────────────────────────────────────────────

/**
 * Read a full DID profile (name, bio, avatar, owner, level) by token ID.
 * Returns undefined when the profile doesn't exist.
 */
export function useProfile(tokenId: bigint | undefined): UseProfileResult {
  const result = useReadContract({
    ...didContract,
    functionName: 'profiles',
    args: tokenId != null ? [tokenId] : undefined,
    query: { enabled: tokenId != null },
  })
  const owner = useReadContract({
    ...didContract,
    functionName: 'ownerOf',
    args: tokenId != null ? [tokenId] : undefined,
    query: { enabled: tokenId != null },
  })
  const level = useReadContract({
    ...registryContract,
    functionName: 'getLevel',
    args: tokenId != null ? [tokenId] : undefined,
    query: { enabled: tokenId != null },
  })

  const name = (result.data as [string, string, string, bigint] | undefined)?.[0] ?? ''
  const bio = (result.data as [string, string, string, bigint] | undefined)?.[1] ?? ''
  const avatar = (result.data as [string, string, string, bigint] | undefined)?.[2] ?? ''
  const updatedAt = (result.data as [string, string, string, bigint] | undefined)?.[3] ?? 0n
  const levelVal = (level.data as number | undefined) ?? 0

  return {
    data: name
      ? ({
          tokenId,
          name,
          bio,
          avatar,
          updatedAt,
          owner: owner.data as `0x${string}` | undefined,
          level: levelVal,
          levelName: LEVEL_NAMES[levelVal] ?? 'Seed',
        } as ProfileWithId)
      : undefined,
    isLoading: result.isLoading || owner.isLoading || level.isLoading,
    isError: result.isError || owner.isError || level.isError,
  }
}

/**
 * Look up the inviter (parent) token ID for a given DID token.
 * Returns `0n` if the profile was created without an inviter (root node).
 */
export function useInviter(tokenId: bigint | undefined) {
  return useReadContract({
    ...registryContract,
    functionName: 'getInviter',
    args: tokenId != null ? [tokenId] : undefined,
    query: { enabled: tokenId != null },
  })
}

/**
 * Count the total number of descendants (direct + indirect invitees) of a DID token.
 */
export function useDescendantCount(tokenId: bigint | undefined) {
  return useReadContract({
    ...registryContract,
    functionName: 'getDescendantCount',
    args: tokenId != null ? [tokenId] : undefined,
    query: { enabled: tokenId != null },
  })
}

/**
 * Get the ERC-721 token balance (number of DIDs owned) for a given address.
 */
export function useBalanceOf(owner: `0x${string}` | undefined) {
  return useReadContract({
    ...didContract,
    functionName: 'balanceOf',
    args: owner ? [owner] : undefined,
    query: { enabled: !!owner },
  })
}

/**
 * Get the total number of profiles created across the entire system.
 */
export function useTotalProfiles() {
  return useReadContract({
    ...registryContract,
    functionName: 'totalProfiles',
  })
}

/**
 * Auto-detect the first token ID owned by the currently connected wallet.
 * Returns `undefined` when the wallet has no DID or is not connected.
 */
export function useUserTokenId(): bigint | undefined {
  const { address } = useAccount()
  const { data } = useReadContract({
    ...registryContract,
    functionName: 'tokenOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })
  const tokenId = data as bigint | undefined
  return tokenId && tokenId > 0n ? tokenId : undefined
}

/**
 * Get the total NFT supply (total minted ERC-721 tokens).
 */
export function useTotalSupply() {
  return useReadContract({
    ...didContract,
    functionName: 'totalSupply',
  })
}

/**
 * Get the DID count for the currently connected wallet.
 * Returns the number of Ceres NFTs held by `address`.
 */
export function useProfileCount() {
  const { address } = useAccount()
  return useReadContract({
    ...didContract,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })
}

/**
 * Get the current mint fee in wei.
 */
export function useMintFee() {
  return useReadContract({
    ...registryContract,
    functionName: 'mintFee',
  })
}

/**
 * Check whether mint fees are currently enabled.
 */
export function useMintFeeEnabled() {
  return useReadContract({
    ...registryContract,
    functionName: 'mintFeeEnabled',
  })
}

/**
 * Get the registry contract's native token balance (accumulated mint fees).
 */
export function useContractBalance() {
  return useBalance({
    address: CERES_REGISTRY_ADDRESS,
  })
}

/**
 * Get the owner of the CeresRegistry contract.
 */
export function useOwner() {
  return useReadContract({
    ...registryContract,
    functionName: 'owner',
  })
}

/**
 * Check whether the connected wallet is the registry owner.
 */
export function useIsOwner() {
  const { address } = useAccount()
  const { data: ownerAddr } = useOwner()
  return useMemo(() => {
    if (!address || !ownerAddr) return false
    return String(address).toLowerCase() === String(ownerAddr as string).toLowerCase()
  }, [address, ownerAddr])
}

/**
 * Get the level of a DID token.
 */
export function useLevel(tokenId: bigint | undefined) {
  return useReadContract({
    ...registryContract,
    functionName: 'getLevel',
    args: tokenId != null ? [tokenId] : undefined,
    query: { enabled: tokenId != null },
  })
}

/**
 * Get the ancestor chain of a DID token (up to `maxDepth` levels).
 */
export function useAncestors(tokenId: bigint | undefined, maxDepth: bigint = 10n) {
  return useReadContract({
    ...registryContract,
    functionName: 'getAncestors',
    args: tokenId != null ? [tokenId, maxDepth] : undefined,
    query: { enabled: tokenId != null },
  })
}

/**
 * Get the direct invitees (children) of a DID token.
 */
export function useDirectInvitees(tokenId: bigint | undefined) {
  return useReadContract({
    ...registryContract,
    functionName: 'getDirectInvitees',
    args: tokenId != null ? [tokenId] : undefined,
    query: { enabled: tokenId != null },
  })
}

// ─────────────────────────────────────────────────────
// Write Functions
// ─────────────────────────────────────────────────────

/**
 * Create a new Ceres DID profile (requires wallet interaction).
 */
export function useCreateProfile() {
  const { writeContractAsync } = useWriteContract()

  return useCallback(
    async (name: string, bio: string, avatar: string, urls: string[], inviterTokenId: bigint = 0n, value?: bigint) => {
      return writeContractAsync({
        ...registryContract,
        functionName: 'createProfile',
        args: [name, bio, avatar, urls, inviterTokenId],
        value,
      })
    },
    [writeContractAsync],
  )
}

/**
 * Update an existing DID profile (must be the owner).
 */
export function useUpdateProfile() {
  const { writeContractAsync } = useWriteContract()

  return useCallback(
    async (tokenId: bigint, name: string, bio: string, avatar: string, urls: string[]) => {
      return writeContractAsync({
        ...didContract,
        functionName: 'updateProfile',
        args: [tokenId, name, bio, avatar, urls],
      })
    },
    [writeContractAsync],
  )
}

/**
 * Set the mint fee (owner only).
 */
export function useSetMintFee() {
  const { writeContractAsync } = useWriteContract()

  return useCallback(
    async (feeInWei: bigint) => {
      return writeContractAsync({
        ...registryContract,
        functionName: 'setMintFee',
        args: [feeInWei],
      })
    },
    [writeContractAsync],
  )
}

/**
 * Toggle mint fee on/off (owner only).
 */
export function useToggleMintFee() {
  const { writeContractAsync } = useWriteContract()

  return useCallback(
    async (enabled: boolean) => {
      return writeContractAsync({
        ...registryContract,
        functionName: 'toggleMintFee',
        args: [enabled],
      })
    },
    [writeContractAsync],
  )
}

/**
 * Withdraw accumulated mint fees (owner only).
 */
export function useWithdrawFees() {
  const { writeContractAsync } = useWriteContract()

  return useCallback(
    async () => {
      return writeContractAsync({
        ...registryContract,
        functionName: 'withdrawFees',
      })
    },
    [writeContractAsync],
  )
}

// ─────────────────────────────────────────────────────
// Cache Invalidation
// ─────────────────────────────────────────────────────

/**
 * Invalidate all react-query queries related to a specific profile.
 */
export function useInvalidateProfile() {
  const queryClient = useQueryClient()

  return useCallback(
    (tokenId: bigint) => {
      queryClient.invalidateQueries({ queryKey: ['readContract', { functionName: 'profiles', args: [tokenId] }] })
      queryClient.invalidateQueries({ queryKey: ['readContract', { functionName: 'ownerOf', args: [tokenId] }] })
      queryClient.invalidateQueries({ queryKey: ['readContract', { functionName: 'getLevel', args: [tokenId] }] })
    },
    [queryClient],
  )
}

/**
 * Invalidate all contract read queries (nuclear option).
 */
export function useInvalidateAll() {
  const queryClient = useQueryClient()

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['readContract'] })
  }, [queryClient])
}

// ─────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────

/**
 * Get the human-readable name for a level number.
 */
export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] ?? 'Seed'
}

/**
 * Get the display colour for a level number.
 */
export function getLevelColor(level: number): string {
  const colors: Record<number, string> = {
    0: '#9CA3AF',
    1: '#CD7F32',
    2: '#C0C0C0',
    3: '#FFD700',
    4: '#A855F7',
    5: '#3B82F6',
  }
  return colors[level] ?? '#9CA3AF'
}
