export default function Developers() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e0e0e8] font-mono">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[#2a2a40]">
        <div className="absolute inset-0 bg-grid-dots opacity-30" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-[#10b981]">@ceres</span>
            <span className="text-[#e0e0e8]">/sdk</span>
          </h1>
          <p className="text-[#808090] text-lg max-w-2xl mx-auto">
            React hooks + pure functions to read/write Ceres DID identities, invitation trees, and on-chain social profiles.
            Drop into any wagmi + React project in minutes.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a href="https://github.com/sftgroup/ceres/tree/master/sdk"
               className="px-6 py-3 bg-[#1a1a2e] border border-[#333355] rounded-lg text-[#a0a0b0] hover:border-[#10b981] hover:text-[#10b981] transition-colors text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <a href="#quickstart"
               className="px-6 py-3 bg-[#10b981] text-[#0a0a0f] rounded-lg font-semibold text-sm hover:bg-[#059669] transition-colors">
              Quick Start →
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '⚡', title: 'Zero Config', desc: 'One provider, all hooks. Works with any wagmi v3 setup on Sepolia.' },
          { icon: '🧩', title: 'Pure Functions', desc: 'Read profiles and invite trees without React. Perfect for Node.js backends, bots, and scripts.' },
          { icon: '🔗', title: 'Full API', desc: 'Profiles, levels, ancestors, descendants, invite URLs, mint fees — all in one package.' },
        ].map(f => (
          <div key={f.title} className="glass-panel p-6 rounded-lg">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="text-[#e0e0e8] font-semibold mb-2">{f.title}</h3>
            <p className="text-[#6b6b80] text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Start */}
      <div id="quickstart" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-[#e0e0e8] mb-8 flex items-center gap-3">
          <span className="text-[#10b981]">▸</span> Quick Start
        </h2>

        <div className="space-y-8">
          {/* Step 1: Install */}
          <Section title="1. Install" emoji="📦">
            <CodeBlock>
{`npm install @ceres/sdk
# or
yarn add @ceres/sdk
# or
pnpm add @ceres/sdk`}
            </CodeBlock>
          </Section>

          {/* Step 2: Setup Provider */}
          <Section title="2. Wrap with CeresProvider" emoji="🏗️">
            <CodeBlock lang="tsx">
{`import { CeresProvider } from '@ceres/sdk'
import { WagmiProvider } from 'wagmi'
import { config } from './wagmi-config'

function App() {
  return (
    <WagmiProvider config={config}>
      <CeresProvider>
        {/* Your app routes / components */}
      </CeresProvider>
    </WagmiProvider>
  )
}`}
            </CodeBlock>
          </Section>

          {/* Step 3: Read Profile */}
          <Section title="3. Read a DID Profile" emoji="👤">
            <CodeBlock lang="tsx">
{`import { useProfile, useInviter, useDescendantCount } from '@ceres/sdk'

function ProfileCard({ tokenId }: { tokenId: bigint }) {
  const { data: profile } = useProfile(tokenId)
  const { data: inviterId } = useInviter(tokenId)
  const { data: descendants } = useDescendantCount(tokenId)

  if (!profile) return <div>Loading...</div>
  return (
    <div>
      <h2>{profile.name}</h2>
      <p>{profile.bio}</p>
      <span>Level: {profile.level}</span>
      <span>Descendants: {descendants ?? 0}</span>
    </div>
  )
}`}
            </CodeBlock>
          </Section>

          {/* Step 4: Invite Tree */}
          <Section title="4. Query Invite Tree" emoji="🌳">
            <CodeBlock lang="tsx">
{`import { useDirectInvitees, useAncestors } from '@ceres/sdk'

function InviteTree({ tokenId }: { tokenId: bigint }) {
  const { data: children } = useDirectInvitees(tokenId)
  const { data: ancestors } = useAncestors(tokenId, 3) // up to 3 levels up

  return (
    <div>
      <h3>Ancestors (Chain of Inviters)</h3>
      {ancestors?.map(a => (
        <TokenLink key={a.id} id={a.id} name={a.name} />
      ))}
      <h3>Direct Invitees ({children?.length ?? 0})</h3>
      {children?.map(c => (
        <TokenLink key={String(c)} id={c} />
      ))}
    </div>
  )
}`}
            </CodeBlock>
          </Section>

          {/* Step 5: Pure Functions (no React) */}
          <Section title="5. Use Pure Functions (No React)" emoji="🖥️">
            <CodeBlock lang="ts">
{`import { getProfile, getInviter, getDescendantCount } from '@ceres/sdk'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
})

// Read profile in a Node.js script, API route, or bot
const profile = await getProfile(client, 1n)
console.log('DID #1:', profile?.name)

const inviterId = await getInviter(client, 1n)
console.log('Inviter tokenId:', inviterId)

const count = await getDescendantCount(client, 1n)
console.log('Total descendants:', count)`}
            </CodeBlock>
          </Section>
        </div>
      </div>

      {/* API Reference Table */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-[#e0e0e8] mb-8 flex items-center gap-3">
          <span className="text-[#10b981]">▸</span> API Reference
        </h2>
        <div className="overflow-hidden glass-panel rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a40]">
                <th className="text-left px-4 py-3 text-[#10b981] font-semibold">Hook / Function</th>
                <th className="text-left px-4 py-3 text-[#10b981] font-semibold">Type</th>
                <th className="text-left px-4 py-3 text-[#808090]">Description</th>
              </tr>
            </thead>
            <tbody className="text-[#a0a0b0]">
              {[
                ['useProfile(tokenId)', 'React Hook', 'Full DID profile (name, bio, avatar, owner, level)'],
                ['useInviter(tokenId)', 'React Hook', 'Token ID of the inviter (parent)'],
                ['useDescendantCount(tokenId)', 'React Hook', 'Number of descendants in tree'],
                ['useBalanceOf(address)', 'React Hook', 'Number of DIDs owned by address'],
                ['useTotalProfiles()', 'React Hook', 'Total number of minted DIDs'],
                ['useAncestors(tokenId, depth)', 'React Hook', 'Chain of inviters up N levels'],
                ['useDirectInvitees(tokenId)', 'React Hook', 'Immediate children (direct invitees)'],
                ['useLevel(tokenId)', 'React Hook', 'Level number (0-5)'],
                ['useTotalSupply()', 'React Hook', 'Total tokens minted (ERC721)'],
                ['getProfile(client, id)', 'Pure Function', 'Read profile without React'],
                ['getInviter(client, id)', 'Pure Function', 'Read inviter without React'],
                ['getDescendantCount(client, id)', 'Pure Function', 'Read count without React'],
                ['getUserTokenId(client, addr)', 'Pure Function', 'Token ID owned by address'],
              ].map((row, i) => (
                <tr key={i} className="border-b border-[#1a1a2e] hover:bg-[#16162a] transition-colors">
                  <td className="px-4 py-3 font-mono text-[#e0e0e8] text-xs">{row[0]}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#0a2e1a] text-[#10b981] font-medium">
                      {row[1]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contracts */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl font-bold text-[#e0e0e8] mb-8 flex items-center gap-3">
          <span className="text-[#10b981]">▸</span> Contracts (Sepolia)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'CeresRegistry', addr: '0x9043489CFFe56C1C5b5E1b8Fb1E4bc384B575116', desc: 'Profiles, levels, invitees, minting' },
            { name: 'CeresDID', addr: '0x159f4001C8692A777A842f3F0A76f268aF1A8F39', desc: 'ERC-721 DID NFT token' },
          ].map(c => (
            <div key={c.name} className="glass-panel p-5 rounded-lg">
              <h3 className="text-[#e0e0e8] font-semibold mb-1">{c.name}</h3>
              <p className="text-[#6b6b80] text-xs mb-3">{c.desc}</p>
              <a href={`https://sepolia.etherscan.io/address/${c.addr}`}
                 target="_blank" rel="noopener noreferrer"
                 className="font-mono text-xs text-[#10b981] hover:text-[#34d399] break-all transition-colors">
                {c.addr}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ────────────────────────────────────── */

function Section({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-[#e0e0e8] mb-4">
        {emoji} {title}
      </h3>
      {children}
    </div>
  )
}

function CodeBlock({ children, lang }: { children: string; lang?: string }) {
  return (
    <div className="glass-panel rounded-lg border border-[#2a2a40] overflow-hidden">
      {lang && (
        <div className="px-4 py-2 bg-[#0a0a0f] border-b border-[#2a2a40] flex items-center justify-between">
          <span className="text-xs text-[#555570] font-mono">{lang}</span>
          <button
            onClick={() => navigator.clipboard.writeText(children.trim())}
            className="text-xs text-[#555570] hover:text-[#10b981] transition-colors"
          >
            Copy
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed">
        <code className="text-[#a0a0b0]">{children.trim()}</code>
      </pre>
    </div>
  )
}
