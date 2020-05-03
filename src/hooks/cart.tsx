import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const asProducts = await AsyncStorage.getItem('@GoMarketplace:products');
      if (asProducts) {
        setProducts(JSON.parse(asProducts));
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    // TODO ADD A NEW ITEM TO THE CART
    const asProducts: Product[] = JSON.parse(
      (await AsyncStorage.getItem('@GoMarketplace:products')) || '[]',
    );

    const findProduct = asProducts.find(item => item.id === product.id);
    if (findProduct) {
      // findProduct.quantity += 1;
      const indice = asProducts.findIndex(item => item.id === product.id);
      const newProducts = [...asProducts];
      newProducts.splice(indice, 1);
      newProducts.push(findProduct);
      await AsyncStorage.removeItem('@GoMarketplace:products');
      console.log('xxxxxxxxxxxxxxxxxxxaddCartnewProducts', newProducts);
      setProducts([...newProducts]);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([...newProducts]),
      );
    } else {
      const newProduct = { ...product };
      newProduct.quantity = 0;
      const newProducts = [...asProducts];
      console.log('xxxxxxxxxxxxxxxxxxxaddCart123', [
        ...newProducts,
        newProduct,
      ]);
      setProducts([...newProducts, newProduct]);
      await AsyncStorage.removeItem('@GoMarketplace:products');
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([...newProducts, newProduct]),
      );
    }
  }, []);

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    const asProducts: Product[] = JSON.parse(
      (await AsyncStorage.getItem('@GoMarketplace:products')) || '[]',
    );
    const newProducts = await asProducts.map(product => {
      const modifyProduct = { ...product };
      if (modifyProduct.id === id) {
        modifyProduct.quantity += 1;
      }
      return modifyProduct;
    });
    if (newProducts) {
      setProducts([...newProducts]);
      // if (newProducts.length > 0) {
      await AsyncStorage.removeItem('@GoMarketplace:products');
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
      // }
    }
    console.log('xxxxxxxxincrement', newProducts.length);
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    const asProducts: Product[] = JSON.parse(
      (await AsyncStorage.getItem('@GoMarketplace:products')) || '[]',
    );
    let removeElement;
    let newProducts = await asProducts.map(product => {
      const modifyProduct = { ...product };
      if (modifyProduct.id === id) {
        if (modifyProduct.quantity > 1) {
          modifyProduct.quantity -= 1;
          // } else {
          //   removeElement = { ...modifyProduct };
        }
      }
      return modifyProduct;
    });
    if (removeElement) {
      newProducts = newProducts.filter(product => product.id !== id);
    }

    if (newProducts) {
      setProducts([...newProducts]);
      await AsyncStorage.removeItem('@GoMarketplace:products');
      // if (newProducts.length > 0) {
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
      // }
    }
    console.log(
      'xxxxxxxxdecrement',
      asProducts,
      newProducts,
      newProducts.length,
      newProducts.length,
    );
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
