import { type PublicClient } from 'viem'
import { CeresDID_ABI } from './abis'
import { CeresRegistry_ABI } from './abis'
import { CERES_DID_ADDRESS, CERES_REGISTRY_ADDRESS } from './addresses'
import type { ProfileWithId } from './types'
import { LEVEL_NAMES } from './types'

/**
 * Fetch a full DID profile directly via a viem PublicClient (no React, no hooks).
 * Returns `undefined` if the token doesn't exist or has no name.
 *
 * @example
 * ```ts
 * import { createPublicClient, http } from 'viem'
 * import { sepolia } from 'viem/chains'
 * import { getProfile } from '@ceres/sdk'
 *
 * const client = createPublicClient({ chain: sepolia, transport: http() })
 * const profile = await getProfile(1n, client)
 * ```
 */
export async function getProfile(
  tokenId: bigint,
  publicClient: PublicClient,
): Promise<ProfileWithId | undefined> {
  const profile = await publicClient.readContract({
    address: CERES_DID_ADDRESS,
    abi: CeresDID_ABI,
    functionName: 'profiles',
    args: [tokenId],
  })
  const owner = await publicClient.readContract({
    address: CERES_DID_ADDRESS,
    abi: CeresDID_ABI,
    functionName: 'ownerOf',
    args: [tokenId],
  })
  const level = await publicClient.readContract({
    address: CERES_REGISTRY_ADDRESS,
    abi: CeresRegistry_ABI,
    functionName: 'getLevel',
    args: [tokenId],
  })

  const profileArr = profile as unknown as [string, string, string, bigint]
  const [name, bio, avatar, updatedAt] = profileArr
  if (!name) return undefined

  return {
    tokenId,
    name,
    bio,
    avatar,
    updatedAt,
    owner: owner as `0x${string}`,
    level: level as number,
    levelName: LEVEL_NAMES[level as number] ?? 'Seed',
  }
}

/**
 * Fetch the inviter token ID for a given DID token.
 * Returns `0n` if there is no inviter (root node).
 */
export async function getInviter(
  tokenId: bigint,
  publicClient: PublicClient,
): Promise<bigint> {
  const result = await publicClient.readContract({
    address: CERES_REGISTRY_ADDRESS,
    abi: CeresRegistry_ABI,
    functionName: 'getInviter',
    args: [tokenId],
  })
  return result as bigint
}

/**
 * Count the total number of descendants for a DID token.
 */
export async function getDescendantCount(
  tokenId: bigint,
  publicClient: PublicClient,
): Promise<bigint> {
  const result = await publicClient.readContract({
    address: CERES_REGISTRY_ADDRESS,
    abi: CeresRegistry_ABI,
    functionName: 'getDescendantCount',
    args: [tokenId],
  })
  return result as bigint
}

/**
 * Get the ERC-721 token balance for an address.
 */
export async function getBalanceOf(
  address: `0x${string}`,
  publicClient: PublicClient,
): Promise<bigint> {
  const result = await publicClient.readContract({
    address: CERES_DID_ADDRESS,
    abi: CeresDID_ABI,
    functionName: 'balanceOf',
    args: [address],
  })
  return result as bigint
}

/**
 * Get the total number of profiles registered in the system.
 */
export async function getTotalProfiles(
  publicClient: PublicClient,
): Promise<bigint> {
  const result = await publicClient.readContract({
    address: CERES_REGISTRY_ADDRESS,
    abi: CeresRegistry_ABI,
    functionName: 'totalProfiles',
  })
  return result as bigint
}

/**
 * Look up a token ID by address.
 * Returns `undefined` if the address does not own a Ceres DID.
 */
export async function getUserTokenId(
  address: `0x${string}`,
  publicClient: PublicClient,
): Promise<bigint | undefined> {
  const result = await publicClient.readContract({
    address: CERES_REGISTRY_ADDRESS,
    abi: CeresRegistry_ABI,
    functionName: 'tokenOf',
    args: [address],
  })
  const tokenId = result as bigint
  return tokenId && tokenId > 0n ? tokenId : undefined
}
