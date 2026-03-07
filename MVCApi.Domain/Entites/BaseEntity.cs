using System;
using MVCApi.Domain.Exceptions;

namespace MVCApi.Domain.Entites
{
    public abstract class BaseEntity
    {
        protected BaseEntity()
        {
            Id = Guid.NewGuid();
            DateCreated = DateTime.Now;
        }

        protected BaseEntity(Guid id)
        {
            Id = id;
            DateCreated = DateTime.Now;
        }

        public Guid Id { get; protected set; }
        public DateTime DateCreated { get; protected set; }

        protected void CheckNull<T>(T value, string field)
        {
            if (value == null)
            {
                throw new NullFieldException(field, this.GetType());
            }
        }

        protected void CheckNull(string value, string field)
        {
            if (string.IsNullOrEmpty(value))
            {
                throw new NullFieldException(field, this.GetType());
            }
        }

        protected void CheckLength(string value, string field, int? min, int? max)
        {
            if (value.Length < min || value.Length > max)
            {
                throw new LengthException(field, this.GetType(), min, max);
            }
        }
    }
}