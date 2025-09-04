import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCart } from '../cart'

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    act(() => {
      useCart.setState({ items: [] })
    })
  })

  describe('estado inicial', () => {
    it('deve inicializar com carrinho vazio quando localStorage está vazio', () => {
      const { result } = renderHook(() => useCart())
      expect(result.current.items).toEqual([])
    })

    it('deve carregar itens do localStorage', () => {
      const mockItems = [
        {
          productId: '1',
          name: 'Cupcake de Chocolate',
          priceCents: 500,
          quantity: 2,
          image: null,
        },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockItems))

      act(() => {
        useCart.setState({ items: mockItems })
      })

      const { result } = renderHook(() => useCart())
      expect(result.current.items).toEqual(mockItems)
    })

    it('deve normalizar dados inválidos do localStorage', () => {
      const invalidItems = [
        {
          productId: 1,
          name: null,
          priceCents: -100,
          quantity: 0,
        },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(invalidItems))

      act(() => {
        useCart.setState({ items: [] })
      })

      const { result } = renderHook(() => useCart())
      expect(result.current.items).toEqual([])
    })
  })

  describe('add', () => {
    it('deve adicionar novo item ao carrinho', () => {
      const { result } = renderHook(() => useCart())

      const newItem = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: 500,
        image: null,
      }

      act(() => {
        result.current.add(newItem, 2)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0]).toEqual({
        ...newItem,
        quantity: 2,
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'cart_items',
        JSON.stringify([{ ...newItem, quantity: 2 }])
      )
    })

    it('deve incrementar quantidade de item existente', () => {
      const { result } = renderHook(() => useCart())

      const item = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: 500,
        image: null,
      }

      act(() => {
        result.current.add(item, 1)
      })

      act(() => {
        result.current.add(item, 2)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(3)
    })

    it('deve usar quantidade padrão 1 quando não especificada', () => {
      const { result } = renderHook(() => useCart())

      const item = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: 500,
        image: null,
      }

      act(() => {
        result.current.add(item)
      })

      expect(result.current.items[0].quantity).toBe(1)
    })

    it('deve normalizar valores inválidos', () => {
      const { result } = renderHook(() => useCart())

      const item = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: -100,
        image: null,
      }

      act(() => {
        result.current.add(item, -5)
      })

      expect(result.current.items[0].priceCents).toBe(0)
      expect(result.current.items[0].quantity).toBe(1)
    })
  })

  describe('remove', () => {
    it('deve remover item do carrinho', () => {
      const { result } = renderHook(() => useCart())

      const item = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: 500,
        image: null,
      }

      act(() => {
        result.current.add(item)
      })
      expect(result.current.items).toHaveLength(1)

      act(() => {
        result.current.remove('1')
      })

      expect(result.current.items).toHaveLength(0)
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
        'cart_items',
        JSON.stringify([])
      )
    })

    it('não deve afetar outros itens', () => {
      const { result } = renderHook(() => useCart())

      const item1 = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: 500,
        image: null,
      }

      const item2 = {
        productId: '2',
        name: 'Cupcake de Morango',
        priceCents: 450,
        image: null,
      }

      act(() => {
        result.current.add(item1)
        result.current.add(item2)
      })
      expect(result.current.items).toHaveLength(2)

      act(() => {
        result.current.remove('1')
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].productId).toBe('2')
    })
  })

  describe('setQty', () => {
    it('deve alterar quantidade de item existente', () => {
      const { result } = renderHook(() => useCart())

      const item = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: 500,
        image: null,
      }

      act(() => {
        result.current.add(item, 2)
      })

      act(() => {
        result.current.setQty('1', 5)
      })

      expect(result.current.items[0].quantity).toBe(5)
    })

    it('não deve remover item quando quantidade for 0 ou negativa (normaliza para 1)', () => {
      const { result } = renderHook(() => useCart())

      const item = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: 500,
        image: null,
      }

      act(() => {
        result.current.add(item, 2)
      })

      act(() => {
        result.current.setQty('1', 0)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(1)
    })

    it('deve garantir quantidade mínima de 1', () => {
      const { result } = renderHook(() => useCart())

      const item = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: 500,
        image: null,
      }

      act(() => {
        result.current.add(item, 2)
      })

      act(() => {
        result.current.setQty('1', -5)
      })

      expect(result.current.items[0].quantity).toBe(1)
    })
  })

  describe('clear', () => {
    it('deve limpar todos os itens do carrinho', () => {
      const { result } = renderHook(() => useCart())

      const item1 = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: 500,
        image: null,
      }

      const item2 = {
        productId: '2',
        name: 'Cupcake de Morango',
        priceCents: 450,
        image: null,
      }

      act(() => {
        result.current.add(item1)
        result.current.add(item2)
      })
      expect(result.current.items).toHaveLength(2)

      act(() => {
        result.current.clear()
      })

      expect(result.current.items).toHaveLength(0)
      expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
        'cart_items',
        JSON.stringify([])
      )
    })
  })

  describe('subtotal', () => {
    it('deve calcular subtotal corretamente', () => {
      const { result } = renderHook(() => useCart())

      const item1 = {
        productId: '1',
        name: 'Cupcake de Chocolate',
        priceCents: 500,
        image: null,
      }

      const item2 = {
        productId: '2',
        name: 'Cupcake de Morango',
        priceCents: 450,
        image: null,
      }

      act(() => {
        result.current.add(item1, 2)
        result.current.add(item2, 1)
      })

      expect(result.current.subtotal()).toBe(1450)
    })

    it('deve retornar 0 para carrinho vazio', () => {
      const { result } = renderHook(() => useCart())
      expect(result.current.subtotal()).toBe(0)
    })
  })
})
