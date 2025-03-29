// Crie este arquivo na pasta types ou na raiz do seu projeto

interface ElectronAPI {
    invoke: (channel: string, data: any) => Promise<any>
    detachTimers: (timers: any[]) => Promise<{ success: boolean; error?: string }>
    isTimerWindow: () => boolean
    onTimerUpdate: (callback: (timers: any[]) => void) => (() => void) | undefined
    onInitTimerWindow: (callback: (data: { timers: any[] }) => void) => (() => void) | undefined
    onTimerWindowClosed: (callback: () => void) => (() => void) | undefined
    updateTimers: (timers: any[]) => Promise<{ success: boolean; error?: string }>
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI
    }
  }
  
  export {}
  
  