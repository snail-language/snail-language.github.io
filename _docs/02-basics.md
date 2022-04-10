---
layout: single
title: Language Basics
permalink: /docs/language-basics

# theme settings
toc: true
# toc_sticky: true
sidebar:
    nav: "docs"
---

## Overview

### Expression-Based Language
Snail is an *expression-based* language.  Most constructs in snail are
expressions, and every expression has a value and an associated type.  This can
be a little confusing for programmers with familiarity of languages with
*statements* (such as C, Java, or Python) where certain control structures do
not have values.  For example, an `if` expression in snail produces a value and
can thus be used as part of an assignment expression (akin to the [ternary
operator](https://en.wikipedia.org/wiki/%3F:) in other languages).

```js
// name will either have the value of preDefinedName 
// or prompt the user for a name
let name = if (predefined) {
    preDefinedName;
} else {
    print_string("Enter your name: ");
    read_string();
};
```

### Implicit Returns
There is no `return` keyword in snail.  The last expression in a block
or method definition is the returned value.

```js
let fourteen = {
    let x = 7;
    let y = 2;
    // x * y is the implicit return of this block
    x * y;
};
```

### Dynamic Typing
Snail programs are *dynamically typed*.  This means that the type of any
variable in a snail program is the type of the value most recently assigned to
it.  This can make for more rapid prototyping, but it can also lead to unusual
errors when programming.  For example, attempting to add an integer and string
will result in a runtime error:

```js
let foo = 3 + "hello";
// runtime error
```

## Classes
All values in snail are objects that are defined by some class.  Snail programs
may contain multiple classes, but all names must be unique.  Create a class with
the `class` keyword:


```javascript
class Person {
    let first_name = "";
    let last_name = "";

    init(first, last) {
        first_name = first;
        last_name = last;
        self;
    };

    get_first() {
        first_name;
    };

    get_last() {
        last_name;
    };
};
```

Values of the `Person` type may  now be constructed in other places in the code:

```javascript
{
    let p = new Person;
    p.init("Jane", "Doe");
}
```

By convention, class names begin with a capital letter, but any valid identifier
may be used.  Note that classes may not have the same name as a built-in type.

The body of a class definition consists of a list of member variable and method
definitions.  Member variables and methods may share the same names; snail
differentiates between these two features of a class.

Note that there is no *initializer* method that is called automatically when an
object is constructed.  Only the member variables are initialized (either to
default values or to the value of the expression in the declaration).  In the
example above, the `init` method must be called explicitly.  Note that this
method returns a reference to itself thereby allowing an object to be created,
initialized, and assigned in one line of code:

```js
let p = (new Person).init("Dorothy", "Vaughan");
```

### Member Variables
Member variables are prefixed by the `let` keyword.  They may be
given an initial value (using an assignment expression) or may be left
uninitialized.  Uninitialized variables have a value of `void` and generally 
cannot be used.

An object may refer to itself using the `self` identifier.

### Methods 
A method is a function that has access to the member variables
of an instance of the class (i.e., a particular object).  Methods consist of a 
name, a list of *parameters*, and a body.  Method names must be unique within 
a class.

Given an value p of type Person (from the example above), we can set values for
the first- and last-names by calling the `init` method of `p`:

```javascript
p.init("Jane", "Doe")
```

This is an *object-oriented dispatch* on object `p`.  There may be different
implementations of `init` in various classes of the snail program.  Snail looks
up the class of object `p` and executes the version most closely associated with
this class.

In this particular example, the values of `"Jane"` and `"Doe"` and passed to the
method and are bound to variables `first` and `last`, respectively.  Methods are
called *by value* in snail, meaning a *shallow copy* of each value is made and
provided to the method.

### Inheritance
Classes may form a hierarchy in snail.  To *inherit* all of the member variables
and methods from another class in the program, add the parent class's name
following a colon after the class definition:

```javascript
class Student : Person {
    let id = 0;

    init(first, last, s_id) {
        self@Person.init(first, last);
        id = s_id;
    };

    get_id() {
        id;
    };
};
```

In this example, `Student` values will have all of the data and methods of a
`Person`.  In addition, they store information about an `id`.  If a member
variable or method in a *deriving* class shares the same name as feature in the
*parent* class, then the feature in the derived class takes precedence.

If a class does not specify its parent, then that class inherits from `Object`,
which is a special class (that has no parent).  A class may only inherit from a
single class.  The parent-child relationship forms a graph.  Program behavior is
*undefined* if this graph contains cycles.

### Main Class

All snail programs must contain a `Main` class that defines a `main()` method.
The `main` method may be inherited from a parent of `Main`, but this is not
common.

Program execution begins by evaluating `(new Main).main()`.

### Built-In Classes

Snail comes with several built-in classes to provide basic functionality.
Programs may not redefine these classes. For detailed information about provided classes, see [Built-In Classes](/classes).



## Basic Expression Types

Snail supports many of the expression types found in modern programming
languages.  All expression types are described below.

### Arithmetic
Arithmetic is supported on values of type `Int` (64-bit integers) in snail.
First `exp1` is evaluated and then `exp2`.  These two values are then combined
using the standard arithmetic operation and this result is the result of the
expression. Arithmetic produces a value of type `Int`.  Note that snail only has
integer division.

```js
exp1 + exp2 // addition
exp1 - exp2 // subtraction
exp1 * exp2 // multiplication
exp1 / exp2 // division
```

### Comparisons
Snail has three comparison operations: `<`, `<=`, and `==`.  These comparisons
apply to sub-expressions of any types using the following rules:

* If both sub-expressions are `Int`, then standard arithmetic comparison is used
* If both sub-expressions are `String`, then lexicographic comparison is used
* If both sub-expressions are `Bool`, then `false < true`
* If both sub-expressions are `void`, they are equal

On all other types, equality is decided by pointer value.  If two values share
the same space in memory, they are equal.

Comparisons produce `Bool` values.

```js
exp1 < exp2
exp1 <= exp2
exp1 == exp2
```

### Unary Expressions

To negate a number in snail, the `~` operator is used.  This may only be used 
on a value of type `Int`.

To negate a value of type `Bool` use the `!` operator.  This will produce a
`Bool` of the opposite value.

```js
{
    // Integer negation
    print_int(~12);

    // Boolean negation

    if (!false) {
        print_string("this will print");
    } else {
        abort();
    }
}
```

### Local Variables

The `let` keyword is used to declare variables in snail.  If `let` is used in
the body of a method (or on the right side of a member variable declarations),
it creates a *local variable*.  The value of a `let` expression is the value of
the right hand side.

```javascript
{
    let salutation = "hello";
    let points = 10;
}
```

A local variable is in scope from its declaration to the end of the scope.
Scopes in snail are created using blocks (denoted by curly braces). Scopes can
nest, meaning that an inner block has access to all of the local variables of
the outer block.  

Variables may also be redefined within an inner scope.  As soon as control
leaves this scope, however, the previous value is restored.  This is known as
*variable shadowing*.

```javascript
{
    let x = 10;
    let y = 2;
    {
        let y = 34;
        print_int(x + y);
    };
    print_int(x + y);

    // will output: 4412
}
```

### Variable Assignment
Once a variable has been declared (either as a member variable or locally), its
value may be updated using an assignment expression.  The right hand side of the
expression is evaluated and replaces the original value for the variable. It is
an error to assign to a variable that has not previously been declared. Because
snail is dynamically typed, the variable will have the type of the most recent
assignment.

```js 
{
    let x = 3;
    x = "foo";
}
```

### Constructing Objects
The `new` keyword constructs a value of the specified type.  This expression
returns the newly-constructed value.  Snail separates out constructor method
from the initial creation of an object, so only the default values for members
variables are set initially.

```js
new Person
```

### Checking if an Object is `void`
Programs may use an `isvoid` expression to determine if an value is `void`.  The
expression evaluates to `true` if the contained expression is `void` and evaluates
to `false` otherwise.

```js
isvoid(exp)
```

### Blocks
Sequences of expressions may be grouped together with a block expression.  These
are also used for the body of methods, conditionals, and loops.  Expressions are
evaluated from top-to-bottom (left-to-right).  The value of a block is the value
of the last expression in the block.  Each expression in a block is terminated
by a semicolon. Note that this means that `if` and `while` expressions are also 
terminated by semicolons.

```js
{
    exp1;
    exp2;
    exp3;
}
```

### Conditionals
The semantics of conditional expressions is standard.  The predicate is
evaluated first.  If the predicate is `true`, then the `then` branch is
evaluated, otherwise the `else` branch is evaluated.  The value produced by the
conditional is the value of the evaluated branch.  Both branches of the `if`
expression are treated as blocks of code (and thus each expression contained
within the braces needs a semicolon).

```js
if (condition predicate) {
    a;
} else {
    b;
}
```

### Loops
Snail supports `while`-style loops.  The loop guard (predicate) is evaluated
before each iteration of the loop.  If the predicate is ever `false`, the loop
terminates and a `void` value is produced.  If the predicate is `true`, the body
of the loop is evaluated and the process repeats.  The body of the `while`
expression is treated as a block of code (and thus each expression needs to be
terminated with a semicolon).

```js
while (guard) {
    a;
}
```

### Dispatch
Dispatch, or method calls, have three supported formats. *Dynamic* dispatch
calls a method on another value.  The number of arguments in a dispatch must
match the number of parameters in the method definition.

First, the value is determined.  Then, each of the arguments is evaluated from
left to right.  These values are then stored in the parameters of the target
value's method.  Inheritance rules are used to determine the method that is
selected. Finally, the body of this method is evaluated, producing the value of
this dispatch.

If the reference implementation detects an inheritance cycle during a dispatch,
it will exit with an error.

```js
exp.method(arg1, ..., argn);
```

*Static* dispatch allows the programmer to select a method from a specific class
in a value's inheritance chain.  Class `B` must be in the inheritance graph of
`exp`.

```js
// Assuming exp inherits from type B, 
// call method that is defined in class B
exp@B.method(arg1, ..., argn);
```

*Self* dispatch is a shortcut to allow calling a method on the current self
object.

```js
// Call method on the current object
method(arg1, ..., argn);
```

## Arrays
Snail also supports an *array* data type for storing contiguous blocks of values
in memory.  Arrays are fixed-size---the size must be specified on instantiation
and cannot be changed.  To change the size of an array, a new array must be
created.

It is recommended that Arrays only store one type of data, but the type system
will allow for any type of data to be stored.

### Constructing Arrays
Arrays are constructed using a variation of the `new` expression, which includes
the size of the array in square brackets.  The following creates an array that
stores ten (10) values.  Note that this syntax is only valid for the `Array`
class.  Initially, an array is constructed with all void values.

```js
let myArray = new[10] Array;
```

### Accessing Values
Values are stored contiguously in an array and can be accessed by placing an
integer *index* value inside of square brackets after an identifier.  Arrays in
snail are *zero-indexed* meaning that the valid indices for an array of length
$$n$$ are $$ 0 \leqslant i < n $$.

```js
{
    myArray[0] = 10;
    myArray[9] = 9;
    print_int(myArray[0]);
}
```

## Unicode Support

The snail language supports [unicode](https://home.unicode.org) characters in
string and a subset of unicode for identifiers. The reference implementation
supports source files with UTF-8 encoding.

Snail supports "XID" identifiers per the [unicode
identifier](https://unicode.org/reports/tr31/) specification.  

```js
class Main : IO {
    let π = "3.14159";

    main() {
        print_string("The value of π is: ");
        print_string(π);
    };
};
```