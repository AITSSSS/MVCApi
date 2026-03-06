using System;

namespace MVCApi.Domain.Exceptions;

public class NullFieldException : Exception
{
    public string Field {get; init;}
    public Type Class {get;init;}

    public NullFieldException(string field, Type _class)
        : base($"Field {field} of {_class.Name} cannot be null or empty.")
    {
        Field = field;
        Class = _class;
    }
}