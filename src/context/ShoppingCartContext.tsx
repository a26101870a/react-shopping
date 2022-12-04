import { createContext, ReactNode, useContext, useState } from 'react'
import { ShoppingCart } from '../components/ShoppingCart'
import { useLocalStorage } from '../hooks/useLocalStorage'

type ShoppingCartProviderProps = {
    children: ReactNode
}

type CartItem = {
    id: number,
    quantity: number
}

type ShoppingCartContext = {
    openCart: () => void
    closeCart: () => void
    getItemQuantity: (id: number) => number
    increaseQuantity: (id: number) => void
    decreaseQuantity: (id: number) => void
    removeFromCart: (id: number) => void
    cartQuantity: number
    cartItems: CartItem[]
}

const ShoppingCartContext = createContext({} as ShoppingCartContext)

export function useShoppingCart() {
    return useContext(ShoppingCartContext)
}

export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('shopping-cart', []);

    const cartQuantity = cartItems.reduce(
        (quantity, item) => item.quantity + quantity,
        0
    )

    const openCart = () => setIsOpen(true)
    const closeCart = () => setIsOpen(false)

    function getItemQuantity(id: number) {
        return cartItems.find(item => item.id === id)?.quantity || 0
    }
    function increaseQuantity(id: number) {
        setCartItems(currentItems => {
            /* 判斷商品是否已被加入購物車，
            ** null 代表尚未被加入至購物車中，
            ** 便加入該商品至 cartItems 的陣列裡，
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
        setCartItems(currentItems => {
            /* 若商品再被刪減數量前的值為1，
            ** 則確定刪減該數量後，
            ** 便排除該商品於 cartItems 的陣列之外。
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
        setCartItems(currentItems => {
            return currentItems.filter(item => item.id !== id)
        })
    }

    return (
        <ShoppingCartContext.Provider
            value={{
                getItemQuantity,
                increaseQuantity,
                decreaseQuantity,
                removeFromCart,
                openCart,
                closeCart,
                cartItems,
                cartQuantity,
            }}
        >
            {children}
            <ShoppingCart isOpen={isOpen} />
        </ShoppingCartContext.Provider>
    )
}