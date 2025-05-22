
import React from 'react';
import { Product, CartItem } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  cartItem?: CartItem;
  onUpdateQuantity: (product: Product, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, cartItem, onUpdateQuantity }) => {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 0;
    onUpdateQuantity(product, quantity);
  };

  const handleIncrement = () => {
    const currentQuantity = cartItem?.quantity || 0;
    onUpdateQuantity(product, currentQuantity + 1);
  };

  const handleDecrement = () => {
    const currentQuantity = cartItem?.quantity || 0;
    if (currentQuantity > 0) {
      onUpdateQuantity(product, currentQuantity - 1);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="font-semibold text-lg">{product.modelo}</h3>
          <p className="text-sm text-muted-foreground">{product.qualidade}</p>
        </div>
        
        <div className="text-lg font-bold mb-4">
          {formatCurrency(product.valor)}
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleDecrement}
              disabled={(cartItem?.quantity || 0) <= 0}
              className="h-8 w-8"
            >
              <Minus size={16} />
            </Button>
            
            <Input
              type="number"
              min="0"
              value={(cartItem?.quantity || 0).toString()}
              onChange={handleQuantityChange}
              className="h-8 mx-2 text-center w-16"
              readOnly
            />
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleIncrement}
              className="h-8 w-8"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
