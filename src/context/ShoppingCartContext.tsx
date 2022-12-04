import { createContext, ReactNode, useContext, useState } from 'react'

type ShoppingCartProviderProps = {
    children: ReactNode
}

type CartItem = {
    id: number,
    quantity: number
}

type ShoppingCartContext = {
    getItemQuantity: (id: number) => number
    increaseQuantity: (id: number) => void
    decreaseQuantity: (id: number) => void
    removeFromCart: (id: number) => void
}

const ShoppingCartContext = createContext({} as ShoppingCartContext)

export function useShoppingCart() {
    return useContext(ShoppingCartContext)
}

export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
    const [carItems, setCarItems] = useState<CartItem[]>([])

    function getItemQuantity(id: number) {
        return carItems.find(item => item.id === id)?.quantity || 0
    }

    function increaseQuantity(id: number) {
        setCarItems(currentItems => {
            /* 判斷商品是否已被加入購物車，
            ** null 代表尚未被加入至購物車中，
            ** 便加入該商品至 carItems 的陣列裡，
            ** 並預設為 1 單位。
            */
            if (currentItems.find(item => item.id === id) == null) {
                return [...currentItems, { id, quantity: 1 }]
            } else {
                return currentItems.map(item => {
                    if (item.id === id) {
                        return { ...item, quantity: item.quantity + 1 }
                    } else {
                        return item
                    }
                })
            }
        })
    }

    function decreaseQuantity(id: number) {
        setCarItems(currentItems => {
            /* 若商品再被刪減數量前的值為1，
            ** 則確定刪減該數量後，
            ** 便排除該商品於 carItems 的陣列之外。
            */
            if (currentItems.find(item => item.id === id)?.quantity === 1) {
                return currentItems.filter(item => item.id !== id)
            } else {
                return currentItems.map(item => {
                    if (item.id === id) {
                        return { ...item, quantity: item.quantity - 1 }
                    } else {
                        return item
                    }
                })
            }
        })
    }

    function removeFromCart(id: number) {
        setCarItems(currentItems => {
            return currentItems.filter(item => item.id !== id)
        })
    }

    return (
        <ShoppingCartContext.Provider
            value={{
                getItemQuantity,
                increaseQuantity,
                decreaseQuantity,
                removeFromCart
            }}
        >
            {children}
        </ShoppingCartContext.Provider>
    )
}