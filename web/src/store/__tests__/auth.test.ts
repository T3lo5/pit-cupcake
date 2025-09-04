import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockLocalStorage = {
  getItem: vi.fn() as vi.Mock,
  setItem: vi.fn() as vi.Mock,
  removeItem: vi.fn() as vi.Mock,
}

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

async function loadUseAuthOnly() {
  vi.resetModules()
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
  vi.doMock('../../lib/api', () => ({ api: { post: vi.fn() } }))
  const mod = await import('../auth')
  return mod.useAuth as typeof import('../auth').useAuth
}

async function loadUseAuthWithApi() {
  vi.resetModules()
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

  const apiMock = { post: vi.fn() }

  vi.doMock('../../lib/api', () => ({ api: apiMock }))

  const mod = await import('../auth')
  return { useAuth: mod.useAuth as typeof import('../auth').useAuth, apiMock }
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReset()
    mockLocalStorage.setItem.mockReset()
    mockLocalStorage.removeItem.mockReset()
  })

  describe('estado inicial', () => {
    it('deve inicializar com dados do localStorage', async () => {
      const mockUser = { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER', createdAt: '2023-01-01' }

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify(mockUser)
        if (key === 'access_token') return 'access-token'
        if (key === 'refresh_token') return 'refresh-token'
        return null
      })

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.accessToken).toBe('access-token')
      expect(result.current.refreshToken).toBe('refresh-token')
    })

    it('deve inicializar com valores null quando localStorage está vazio', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.refreshToken).toBeNull()
    })
  })

  describe('setAuth', () => {
    it('deve definir dados de autenticação e salvar no localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      const authData = {
        user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER' as const, createdAt: '2023-01-01' },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }

      act(() => {
        result.current.setAuth(authData)
      })

      expect(result.current.user).toEqual(authData.user)
      expect(result.current.accessToken).toBe('new-access-token')
      expect(result.current.refreshToken).toBe('new-refresh-token')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(authData.user))
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'new-access-token')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token')
    })

    it('deve manter refresh token existente quando não fornecido', async () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'user') return null
        if (key === 'access_token') return null
        if (key === 'refresh_token') return 'existing-refresh-token'
        return null
      })

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      const authData = {
        user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER' as const, createdAt: '2023-01-01' },
        accessToken: 'new-access-token',
      } as any

      act(() => {
        result.current.setAuth(authData)
      })

      expect(result.current.refreshToken).toBe('existing-refresh-token')
      expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('refresh_token', expect.any(String))
    })
  })

  describe('logout', () => {
    it('deve limpar dados de autenticação e localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.setAuth({
          user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER', createdAt: '2023-01-01' },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        } as any)
      })

      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.refreshToken).toBeNull()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('access_token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refresh_token')
    })
  })

  describe('isAdmin', () => {
    it('true para admin', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.setAuth({
          user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN', createdAt: '2023-01-01' },
          accessToken: 'access-token',
        } as any)
      })

      expect(result.current.isAdmin()).toBe(true)
    })

    it('false para customer', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.setAuth({
          user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER', createdAt: '2023-01-01' },
          accessToken: 'access-token',
        } as any)
      })

      expect(result.current.isAdmin()).toBe(false)
    })

    it('false quando não há usuário', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      expect(result.current.isAdmin()).toBe(false)
    })
  })

  describe('isLogged', () => {
    it('true quando há access token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.setAuth({
          user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER', createdAt: '2023-01-01' },
          accessToken: 'access-token',
        } as any)
      })

      expect(result.current.isLogged()).toBe(true)
    })

    it('false quando não há access token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      expect(result.current.isLogged()).toBe(false)
    })
  })

  describe('refreshAccessToken', () => {
    it('renova access token com sucesso', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { useAuth, apiMock } = await loadUseAuthWithApi()

      apiMock.post.mockResolvedValue({ data: { accessToken: 'new-access-token' } })

      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.setAuth({
          user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER', createdAt: '2023-01-01' },
          accessToken: 'old-access-token',
          refreshToken: 'refresh-token',
        } as any)
      })

      expect(result.current.refreshToken).toBe('refresh-token')

      const newToken = await result.current.refreshAccessToken()

      expect(newToken).toBe('new-access-token')
      expect(result.current.accessToken).toBe('new-access-token')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'new-access-token')
      expect(apiMock.post).toHaveBeenCalledWith(
        '/auth/refresh',
        { refreshToken: 'refresh-token' },
        { headers: { Authorization: '' } }
      )
    })

    it('retorna null quando não há refresh token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const useAuth = await loadUseAuthOnly()
      const { result } = renderHook(() => useAuth())

      const newToken = await result.current.refreshAccessToken()
      expect(newToken).toBeNull()
    })

    it('faz logout quando refresh falha', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const { useAuth, apiMock } = await loadUseAuthWithApi()
      apiMock.post.mockRejectedValue(new Error('Refresh failed'))

      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.setAuth({
          user: { id: '1', name: 'João', email: 'joao@test.com', role: 'CUSTOMER', createdAt: '2023-01-01' },
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        } as any)
      })

      const newToken = await result.current.refreshAccessToken()

      expect(newToken).toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.refreshToken).toBeNull()
    })
  })
})
