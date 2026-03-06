using System.Collections.Concurrent;
using System.Collections.Generic;
using MVCApi.Domain.Exceptions;

namespace MVCApi.Domain.Entites
{
    public class Currency : BaseEntity
    {
        public string Code { get; private set; }
        public int DecimalPlaces { get; private set; }
        public virtual ICollection<CurrencyProduct> Products { get; private set; }

        protected Currency()
        {

        }

        protected Currency(string code, int decimalPlaces)
        {
            Code = code;
            DecimalPlaces = decimalPlaces;
        }

        public static Currency Create(string code, int decimalPlaces)
        {
            if (code.Length != 3) // ISO 4217
                throw new InvalidCurrencyCodeException(code);

            if (decimalPlaces > 6 || decimalPlaces < 0)
                throw new InvalidDecimalPlacesException(decimalPlaces);

            return new Currency(code, decimalPlaces);
        }

        public override bool Equals(object obj)
        {
            return obj is Currency currency && currency.Code.Equals(this.Code);
        }
    }
}