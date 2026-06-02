import { useReadContract, useWriteContract, useAccount, useBalance } from 'wagmi'
import { CERES_DID_ADDRESS, CERES_REGISTRY_ADDRESS } from '../contracts/addresses'
import { CeresDID_ABI } from '../contracts/CeresDID'
import { CeresRegistry_ABI } from '../contracts/CeresRegistry'
import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export interface Profile {
  name: string
  bio: string
  avatar: string
  updatedAt: bigint
}

export interface ProfileWithId extends Profile {
  tokenId: bigint
  owner: `0x${string}`
  level: number
  levelName: string
}

const LEVEL_NAMES: Record<number, string> = {
  0: 'Seed',
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Crystal',
  5: 'Diamond',
}

const didContract = { address: CERES_DID_ADDRESS as `0x${string}`, abi: CeresDID_ABI }
const registryContract = { address: CERES_REGISTRY_ADDRESS as `0x${string}`, abi: CeresRegistry_ABI }

export function useCeres() {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  // --- Read Hooks ---

  function useProfileCount() {
    return useReadContract({
      ...didContract,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      query: { enabled: !!address },
    })
  }

  function useProfile(tokenId: bigint | undefined) {
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

  function useTotalProfiles() {
    return useReadContract({
      ...registryContract,
      functionName: 'totalProfiles',
    })
  }

  function useTotalSupply() {
    return useReadContract({
      ...didContract,
      functionName: 'totalSupply',
    })
  }

  function useInviter(tokenId: bigint | undefined) {
    return useReadContract({
      ...registryContract,
      functionName: 'getInviter',
      args: tokenId != null ? [tokenId] : undefined,
      query: { enabled: tokenId != null },
    })
  }

  function useAncestors(tokenId: bigint | undefined, maxDepth: bigint = 10n) {
    return useReadContract({
      ...registryContract,
      functionName: 'getAncestors',
      args: tokenId != null ? [tokenId, maxDepth] : undefined,
      query: { enabled: tokenId != null },
    })
  }

  function useDirectInvitees(tokenId: bigint | undefined) {
    return useReadContract({
      ...registryContract,
      functionName: 'getDirectInvitees',
      args: tokenId != null ? [tokenId] : undefined,
      query: { enabled: tokenId != null },
    })
  }

  function useDescendantCount(tokenId: bigint | undefined) {
    return useReadContract({
      ...registryContract,
      functionName: 'getDescendantCount',
      args: tokenId != null ? [tokenId] : undefined,
      query: { enabled: tokenId != null },
    })
  }

  function useLevel(tokenId: bigint | undefined) {
    return useReadContract({
      ...registryContract,
      functionName: 'getLevel',
      args: tokenId != null ? [tokenId] : undefined,
      query: { enabled: tokenId != null },
    })
  }

  function useBalanceOf(owner: `0x${string}` | undefined) {
    return useReadContract({
      ...didContract,
      functionName: 'balanceOf',
      args: owner ? [owner] : undefined,
      query: { enabled: !!owner },
    })
  }

  function useMintFee() {
    return useReadContract({
      ...registryContract,
      functionName: 'mintFee',
    })
  }

  function useMintFeeEnabled() {
    return useReadContract({
      ...registryContract,
      functionName: 'mintFeeEnabled',
    })
  }

  function useContractBalance() {
    return useBalance({
      address: CERES_REGISTRY_ADDRESS as `0x${string}`,
    })
  }

  function useOwner() {
    return useReadContract({
      ...registryContract,
      functionName: 'owner',
    })
  }

  function useIsOwner() {
    const { data: ownerAddr } = useOwner()
    return useMemo(() => {
      if (!address || !ownerAddr) return false
      return String(address).toLowerCase() === String(ownerAddr).toLowerCase()
    }, [address, ownerAddr])
  }

  /** Auto-detect the first token ID owned by the connected wallet */
  function useUserTokenId(): bigint | undefined {
    const { data } = useReadContract({
      ...registryContract,
      functionName: 'tokenOf',
      args: address ? [address] : undefined,
      query: { enabled: !!address },
    })
    const tokenId = (data as bigint | undefined)
    return tokenId && tokenId > 0n ? tokenId : undefined
  }

  // --- Write Hooks ---

  const { writeContractAsync } = useWriteContract()

  const createProfile = useCallback(
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

  const updateProfile = useCallback(
    async (tokenId: bigint, name: string, bio: string, avatar: string, urls: string[]) => {
      return writeContractAsync({
        ...didContract,
        functionName: 'updateProfile',
        args: [tokenId, name, bio, avatar, urls],
      })
    },
    [writeContractAsync],
  )

  const setMintFee = useCallback(
    async (feeInWei: bigint) => {
      return writeContractAsync({
        ...registryContract,
        functionName: 'setMintFee',
        args: [feeInWei],
      })
    },
    [writeContractAsync],
  )

  const toggleMintFee = useCallback(
    async (enabled: boolean) => {
      return writeContractAsync({
        ...registryContract,
        functionName: 'toggleMintFee',
        args: [enabled],
      })
    },
    [writeContractAsync],
  )

  const withdrawFees = useCallback(
    async () => {
      return writeContractAsync({
        ...registryContract,
        functionName: 'withdrawFees',
      })
    },
    [writeContractAsync],
  )

  // --- Helpers ---

  const getLevelName = useCallback((level: number) => {
    return LEVEL_NAMES[level] ?? 'Seed'
  }, [])

  const getLevelColor = useCallback((level: number) => {
    const colors: Record<number, string> = {
      0: '#9CA3AF', // Gray
      1: '#CD7F32', // Bronze
      2: '#C0C0C0', // Silver
      3: '#FFD700', // Gold
      4: '#A855F7', // Crystal
      5: '#3B82F6', // Diamond
    }
    return colors[level] ?? '#9CA3AF'
  }, [])

  const invalidateProfile = useCallback(
    (tokenId: bigint) => {
      queryClient.invalidateQueries({ queryKey: ['readContract', { functionName: 'profiles', args: [tokenId] }] })
      queryClient.invalidateQueries({ queryKey: ['readContract', { functionName: 'ownerOf', args: [tokenId] }] })
      queryClient.invalidateQueries({ queryKey: ['readContract', { functionName: 'getLevel', args: [tokenId] }] })
    },
    [queryClient],
  )

  return {
    address,
    useProfileCount,
    useProfile,
    useTotalProfiles,
    useTotalSupply,
    useInviter,
    useAncestors,
    useDirectInvitees,
    useDescendantCount,
    useLevel,
    useBalanceOf,
    useMintFee,
    useMintFeeEnabled,
    useContractBalance,
    useOwner,
    useIsOwner,
    useUserTokenId,
    setMintFee,
    toggleMintFee,
    withdrawFees,
    createProfile,
    updateProfile,
    getLevelName,
    getLevelColor,
    invalidateProfile,
    LEVEL_NAMES,
  }
}
