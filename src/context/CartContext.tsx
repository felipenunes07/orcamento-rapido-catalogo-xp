
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  updateQuantity: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateProductPrices: (products: Product[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Função para verificar se o produto é DOC DE CARGA
  const isDocDeCarga = (product: Product): boolean => {
    return product.modelo.toUpperCase().includes('DOC DE CARGA');
  };

  // Função para ajustar a quantidade para múltiplos de 5 para produtos DOC DE CARGA
  const adjustQuantityForDocDeCarga = (product: Product, quantity: number): number => {
    if (isDocDeCarga(product)) {
      // Se for menor que 5, ajusta para 5
      if (quantity < 5) return 5;
      
      // Arredonda para o múltiplo de 5 mais próximo
      const remainder = quantity % 5;
      return remainder === 0 ? quantity : quantity + (5 - remainder);
    }
    return quantity;
  };

  const addToCart = (product: Product, quantity: number) => {
    if (quantity <= 0) return;

    // Ajusta a quantidade para DOC DE CARGA
    const adjustedQuantity = isDocDeCarga(product) ? adjustQuantityForDocDeCarga(product, quantity) : quantity;

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + adjustedQuantity;
        
        // Ajusta a quantidade total para DOC DE CARGA
        const finalQuantity = isDocDeCarga(product) 
          ? adjustQuantityForDocDeCarga(product, newQuantity) 
          : newQuantity;
        
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: finalQuantity,
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity: adjustedQuantity }];
      }
    });
  };

  const updateQuantity = (product: Product, quantity: number) => {
    // Se a quantidade for 0 ou menos, remove o item
    if (quantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => item.product.id !== product.id));
      return;
    }

    // Ajusta a quantidade para DOC DE CARGA
    const adjustedQuantity = isDocDeCarga(product) ? adjustQuantityForDocDeCarga(product, quantity) : quantity;

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.product.id === product.id);

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: adjustedQuantity,
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity: adjustedQuantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateProductPrices = (products: Product[]) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        // Encontra o produto atualizado na lista de produtos
        const updatedProduct = products.find(p => p.id === item.product.id)
        if (updatedProduct) {
          // Atualiza o produto no carrinho com os novos valores
          return {
            ...item,
            product: updatedProduct
          }
        }
        return item
      })
    })
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        updateProductPrices,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
