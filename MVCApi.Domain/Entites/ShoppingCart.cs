using System;
using System.Collections.Generic;
using System.Linq;
using MVCApi.Domain.Enums;
using MVCApi.Domain.Exceptions;

namespace MVCApi.Domain.Entites
{
    public class ShoppingCart : BaseEntity
    {
        public virtual ICollection<ProductCart> Products { get; private set; }

        public ShoppingCartState State { get; private set; }

        protected ShoppingCart()
        {
            Products = new List<ProductCart>();
            State = ShoppingCartState.Operable;
        }

        public static ShoppingCart Create()
        {
            return new ShoppingCart();
        }

        public void AddProduct(Product product, int count)
        {
            if (count < 1)
                throw new InvalidProductCount();

            if (this.Products.Any(x => x.ProductId == product.Id))
                throw new ProductAlreadyInCartException(this.Id, product.Id);

            if (State != ShoppingCartState.Operable)
                return; //TODO: Throw

            Products.Add(new ProductCart(product, this, count));
        }

        public void RemoveProduct(Guid productId)
        {
            if (State != ShoppingCartState.Operable)
                return; //TODO: Throw

            foreach (var item in Products)
            {
                if (item.Product.Id == productId)
                {
                    Products.Remove(item);
                    break;
                }
            }
        }

        public void ChangeProductCount(Guid productId, int count)
        {
            if (State != ShoppingCartState.Operable)
                return; //TODO: Throw

            var product = Products.FirstOrDefault(x => x.ProductId == productId);
            if (product != null)
                product.SetCount(count);
        }

        public void Clear()
        {
            if (State != ShoppingCartState.Operable)
                return; //TODO: Throw

            Products.Clear();
        }

        public void Lock()
        {
            State = ShoppingCartState.Locked;
        }
    }
}