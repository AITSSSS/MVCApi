using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Query;
using MVCApi.Application;
using MVCApi.Domain;
using MVCApi.Domain.Consts;
using MVCApi.Domain.Entites;
using MVCApi.Services.Exceptions;
using Newtonsoft.Json;

namespace MVCApi.Services
{
    public class CurrencyService : ICurrencyService
    {
        private readonly IDomainRepository<Currency> _currencyRepository;
        private readonly IDomainRepository<Product> _productRepository;
        private readonly IExchangeProvider _exchangeProvider;

        public CurrencyService(IDomainRepository<Currency> currencyRepository, IDomainRepository<Product> productRepository, IExchangeProvider exchangeProvider)
        {
            _currencyRepository = currencyRepository;
            _productRepository = productRepository;
            _exchangeProvider = exchangeProvider;
        }

        public async Task<CurrencyProduct> AddConversion(Product product, string currencyCode)
        {
            Currency currency = (await _currencyRepository.GetAllAsync(x => x.Code == currencyCode)).FirstOrDefault() ?? throw new CurrencyNotFoundException(currencyCode);
            decimal convertedValue = await GetConvertedValue(product, currencyCode);

            CurrencyProduct newConversion = new CurrencyProduct(product, currency, convertedValue);
            product.AddConversion(newConversion);
            await _productRepository.EditAsync(product);

            return newConversion;
        }

        public async Task<decimal> GetConvertedValue(Product product, string currencyCode)
        {
            decimal originalValue = product?.Prices?.FirstOrDefault(x => x.Currency.Code == EShopConsts.DefaultCurrency)?.Value
                ?? throw new PriceNotFoundException();
            decimal rate = await _exchangeProvider.GetRate(currencyCode) ?? throw new NullCurrencyException();

            return originalValue / rate;
        }
    }
}