using System;
using System.Collections.Generic;
using MVCApi.Domain.Exceptions;

namespace MVCApi.Domain.Entites
{
    public class Product : BaseEntity
    {
        protected Product()
        {
            ShoppingCarts = new List<ProductCart>();
            Prices = new List<CurrencyProduct>();
            Categories = new List<Category>();
        }

        public string Name { get; private set; }
        public string Description { get; private set; }
        public string Image { get; private set; }
        public virtual ICollection<Category> Categories { get; private set; }
        public virtual ICollection<ProductCart> ShoppingCarts { get; private set; }
        public virtual ICollection<CurrencyProduct> Prices { get; private set; }

        public static Product Create(string name, string description, string image, decimal price, Currency currency)
        {
            var product = new Product();
            product.ChangeName(name);
            product.ChangeDescription(description);
            product.ChangeImage(image);
            product.AddConversion(new CurrencyProduct(product, currency, price));

            return product;
        }

        public void AddConversion(CurrencyProduct cp)
        {
            CheckNull(cp, nameof(Prices));

            Prices.Add(cp);
        }

        public void ChangeName(string name)
        {
            CheckNull(name, nameof(Name));
            CheckLength(name, nameof(Name), 3, 32);

            Name = name;
        }

        public void ChangeDescription(string description)
        {
            CheckNull(description, nameof(Description));
            CheckLength(description, nameof(Description), 10, 255);

            Description = description;
        }

        public void ChangeImage(string image)
        {
            CheckNull(image, nameof(Image));
            try
            {
                new Uri(image);
            }
            catch (Exception)
            {
                throw new InvalidImageLinkException(image);
            }


            Image = image;
        }
    }
}