export type ChainId = 1 | 10 | 100 | 137 | 250 | 8453 | 42161;

export const CHAIN_ID_TO_NAME: Record<number, string> = {
    1: 'Mainnet',
    10: 'Optimism',
    100: 'GnosisChain',
    137: 'Polygon',
    250: 'Fantom',
    8453: 'Base',
    42161: 'Arbitrum',
}