/// <reference types="vite/client" />

declare module '@contracts/taxonomy/*.json' {
  const value: Record<string, unknown>
  export default value
}
