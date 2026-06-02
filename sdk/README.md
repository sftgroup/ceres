# @ceres/sdk

TypeScript SDK for the **Ceres DID** protocol — a decentralised identity system on Sepolia testnet.

## Features

- **React hooks** for wallet-connected read operations (profile, inviter, descendants, balances)
- **Pure utility functions** that work with any viem `PublicClient` (no React required)
- **Pre-built contract ABIs** and Sepolia contract addresses
- **CeresProvider** to wire up Wagmi + React Query in one line

## Installation

```bash
npm install @ceres/sdk
```

### Peer dependencies

Make sure your project has these installed:

```bash
npm install wagmi viem @tanstack/react-query react
```

## Quick Start

Wrap your app with `CeresProvider`:

```tsx
import { CeresProvider } from '@ceres/sdk'

function App() {
  return (
    <CeresProvider>
      <YourApp />
    </CeresProvider>
  )
}
```

That's it — `CeresProvider` internally sets up `WagmiProvider` (with the Sepolia RPC config) and `QueryClientProvider`.

### Custom Wagmi Config

If you need a different chain or RPC endpoint, pass your own wagmi config:

```tsx
import { CeresProvider } from '@ceres/sdk'
import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'

const myConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://your-custom-rpc.example.com'),
  },
})

function App() {
  return (
    <CeresProvider wagmiConfig={myConfig}>
      <YourApp />
    </CeresProvider>
  )
}
```

## React Hooks

All hooks require a `WagmiProvider` + `QueryClientProvider` context (provided automatically by `<CeresProvider>`).

### useProfile

Read a full DID profile by token ID (name, bio, avatar, owner, level):

```tsx
import { useProfile } from '@ceres/sdk'

function ProfileCard({ tokenId }: { tokenId: bigint }) {
  const { data: profile, isLoading } = useProfile(tokenId)

  if (isLoading) return <div>Loading…</div>
  if (!profile) return <div>Profile not found</div>

  return (
    <div>
      <h2>{profile.name}</h2>
      <p>{profile.bio}</p>
      <img src={profile.avatar} alt={profile.name} />
      <span>Level: {profile.levelName} ({profile.level})</span>
      <span>Owner: {profile.owner}</span>
    </div>
  )
}
```

### useInviter

Look up the inviter (parent) token ID in the invitation tree:

```tsx
const { data: inviterTokenId } = useInviter(tokenId)
// → bigint (0n = root node / no inviter)
```

### useDescendantCount

Count all descendants (direct + indirect invitees):

```tsx
const { data: count } = useDescendantCount(tokenId)
// → bigint
```

### useBalanceOf

Get the ERC-721 balance for an address:

```tsx
const { data: balance } = useBalanceOf(address)
// → bigint
```

### useTotalProfiles

Total number of profiles ever created:

```tsx
const { data: totalProfiles } = useTotalProfiles()
// → bigint
```

### useUserTokenId

Auto-detect the first token ID owned by the connected wallet:

```tsx
const tokenId = useUserTokenId()  // → bigint | undefined
```

## Pure Utility Functions (no React)

Use these in server-side code, scripts, or any non-React context. Each function takes a viem `PublicClient` as the last argument.

```ts
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { getProfile, getInviter, getDescendantCount, getBalanceOf } from '@ceres/sdk'

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://sepolia.gateway.tenderly.co'),
})

// Fetch a full profile
const profile = await getProfile(1n, client)

// Look up invitation relationship
const inviterId = await getInviter(5n, client)

// Count descendants
const count = await getDescendantCount(3n, client)

// Get token balance of an address
const balance = await getBalanceOf('0x...', client)

// Get total profiles
const total = await getTotalProfiles(client)

// Look up token ID by address
const tokenId = await getUserTokenId('0x...', client)
```

## Contract ABIs & Addresses

Access the raw ABIs and addresses for direct integration:

```ts
import {
  CeresDID_ABI,
  CeresRegistry_ABI,
  CERES_DID_ADDRESS,
  CERES_REGISTRY_ADDRESS,
  didContract,
  registryContract,
} from '@ceres/sdk'
```

- **CeresDID**: ERC-721 NFT at `0x159f4001C8692A777A842f3F0A76f268aF1A8F39`
- **CeresRegistry**: Registry & invitation tree at `0x9043489CFFe56C1C5b5E1b8Fb1E4bc384B575116`

The `didContract` / `registryContract` exports are pre-built config objects with both `address` and `abi`, ready for wagmi `useReadContract` or viem `readContract`.

## Types

```ts
import type { Profile, ProfileWithId, UseProfileResult } from '@ceres/sdk'

interface Profile {
  name: string
  bio: string
  avatar: string
  updatedAt: bigint
}

interface ProfileWithId extends Profile {
  tokenId: bigint
  owner: `0x${string}`
  level: number
  levelName: string
}
```

## Level System

| Level | Name    | Color   |
|-------|---------|---------|
| 0     | Seed    | Gray    |
| 1     | Bronze  | Bronze  |
| 2     | Silver  | Silver  |
| 3     | Gold    | Gold    |
| 4     | Crystal | Purple  |
| 5     | Diamond | Blue    |

```ts
import { LEVEL_NAMES, LEVEL_COLORS } from '@ceres/sdk'

LEVEL_NAMES[3]   // → 'Gold'
LEVEL_COLORS[5]  // → '#3B82F6'
```

## License

MIT
