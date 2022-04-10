---
layout: single
title: Interchange Formats
permalink: /docs/interchange-formats

# theme settings
toc: true
# toc_sticky: true
sidebar:
    nav: "docs"
  
---
The snail specification provides formats for serializing tokens and abstract
syntax trees.  These formats designed to be simple to parse either manually or
using common tools.

## SL-LEX Format
The SL-LEX format is used to save a sequence (stream) of tokens to a file.
Files with the `.sl-lex` suffix follow a simple serialization format.

Each token is represented by a triple (or quadruple) of lines. The first line
holds the line number.  The second line holds the column number. The third line
gives the name of the token. The optional fourth line holds additional
information (i.e., the lexeme) for identifiers, integers, and strings.

### Line and Column Numbers
The first line in a file is line 1. Each successive newline character (`\n`)
increments the line count. Column numbers begin with column 1 and resets on each
newline.

### Example
Given the following input:

{% highlight js linenos %}
Backslash !
   "allowed"
{% endhighlight %}

The corresponding SL-LEX output is:
```
1
1
ident
Backslash
1
11
not
2
5
string
allowed
```

Note that the lexeme for a string literal does not include the double quotes,
and thus the column number is that of the first character of the string itself.

The table below maps tokens to their SL-LEX name.

| SL-LEX name         | Token    |
| -----------         | -------- |
| at                  | `@`      |
| assign              | `=`      |
| class$$^\dagger$$   | `class`  |
| colon               | `:`      |
| comma               | `,`      |
| divide              | `/`      |
| dot                 | `.`      |
| else$$^\dagger$$    | `else`   |
| equals              | `==`     |
| false$$^\dagger$$   | `false`  |
| ident$$^*$$         | identifier |
| if$$^\dagger$$      | `if`     |
| int$$^*$$           | integer literal |
| isvoid$$^\dagger$$  | `isvoid` |
| lbrace              | `{`      |
| lbracket            | `[`      |
| let$$^\dagger$$     | `let`    |
| lparen              | `(`      |
| lt                  | `<`      |
| lte                 | `<=`     |
| minus               | `-`      |
| new$$^\dagger$$     | `new`    |
| not                 | `!`      |
| plus                | `+`      |
| rbrace              | `}`      |
| rbracket            | `]`      |
| rparen              | `)`      |
| semi                | `;`      |
| string$$^*$$        | string literal |
| times               | `*`      |
| true$$^\dagger$$    | `true`   |
| uminus              | `~`      |
| while$$^\dagger$$   | `while`  |

$$^*$$ Contains fourth line with contents of lexeme<br>
$$^\dagger$$ Case insensitive

## SL-AST Format
The SL-AST format is used to save an abstract syntax tree representing a
syntactically valid snail program to a file.  Files with the `.sl-ast` suffix
are formatted using [JSON](https://www.json.org), a common data interchange
format supported by many programming languages.

A snail AST is structured as an `array` of JSON `object` elements, each
representing a class in the source program.  Beyond requiring proper nesting of
object (and the correct ordering of arguments and parameters), SL-AST does not
specify a particular ordering of parameters in objects, order of features in
classes, or order of classes in a program.  It is generally good practice to 
maintain the same order as the source snail program, however.

### Formal Specification
SL-AST is formally specified by a JSON *schema*.  The most recent version of the
schema is available [here](/assets/sl-ast.schema.json).  Any number of JSON
schema validator tools may be used to verify the conformity of an SL-AST file to
this specification.

### Informal Specification
The following is an informal discussion of each of the object types found in an
SL-AST file.  The formal specification should be referenced for precise
descriptions.

#### Classes

The following object structure is used to define a class:

```json
{
    "class_name": < name of class >,
    "inherits": < name of class to inherit from >,
    "members": [ < array of member objects > ],
    "methods": [ < array of method objects > ]
}
```

The `class_name`, `members`, and `methods` properties are required.

#### Members

The following object structure is used to define a member variable:

```json
{
    "name": { < identifier object of the variable name > },
    "type": "member",
    "init": { < expression object of the initializer value > }
}
```

The `name` and `type` properties are required.

#### Methods

The following object structure is used to define a method:

```json
{
    "name": { < identifier object of the method name > },
    "type": "method",
    "parameters": [ < array of identifier objects > ],
    "body": { < expression object of the body > }
}
```

All properties are required.  Note that
the `body` property will always be a `block` expression.


#### Identifiers

The following object structure is used to define an identifier:

```json
{
    "line": < integer line number >,
    "col": < integer column number >,
    "value": < string of the identifier name >
}
```

All properties are required.  The line and column numbers are positive and
one-indexed.  They always refer to the first character in the lexeme associated
with the token.

#### Expressions

The following object structure is used to define an expression:

```json
{
    "line": < integer line number >,
    "col": < integer column number >,
    "value": { < expression_value object > }
}
```

All properties are required.  The line and column numbers are positive and
one-indexed.  They always refer to the first character of the first lexeme
associated with the expression.  The `value` property will be one of several
valid objects described below.

#### Expression Values

The following expression values are supported.  All properties are required
unless otherwise noted.

* Assignment Expression (`id = exp`)
  ```json
  {
      "type": "assign",
      "lhs": { < identifier object of id > },
      "rhs": { < expression object of exp > }
  }
  ```
* Array Assignment Expression (`e1[e2] = e3`)
  ```json
  {
      "type": "array-assign",
      "lhs": { < expression object of e1 > },
      "index": { < expression object of e2 > }, 
      "rhs": { < expression object of e3 > }
  }
  ```
* Dynamic Dispatch Expression (`e1.id(args)`)
  ```json
  {
      "type": "dynamic-dispatch",
      "object": { < expression object of e1 > },
      "method": { < identifier object of id > }, 
      "args": [ < array of argument expression objects > ]
  }
  ```
* Static Dispatch Expression (`e1@id1.id2(args)`)
  ```json
  {
      "type": "static-dispatch",
      "object": { < expression object of e1 > },
      "class": { < identifier object of id1 > },
      "method": { < identifier object of id2 > }, 
      "args": [ < array of argument expression objects > ]
  }
  ```
* Self Dispatch Expression (`id(args)`)
  ```json
  {
      "type": "self-dispatch",
      "method": { < identifier object of id > }, 
      "args": [ < array of argument expression objects > ]
  }
  ```
* If Expression (`if(e1) e2 else e3`)
  ```json
  {
      "type": "if",
      "guard": { < expression object of e1 > },
      "then": { < expression object of e2 > },
      "else": { < expression object of e3 > }
  }
  ```
  Note that the `then` and `else` properties will always be `block` expressions
  in snail.
* While Expression (`while(e1) e2`)
  ```json
  {
      "type": "while",
      "guard": { < expression object of e1 > },
      "body": { < expression object of e2 > },
  }
  ```
  Note that the `body` property will always be a `block` expression in snail.
* Block Expression (`{ e1; e2; ... }`)
  ```json
  {
      "type": "block",
      "body": [ < array of expression objects > ]
  }
  ```
* Let Expression (`let id [= exp]?`)
  ```json
  {
      "type": "let",
      "lhs": { < identifier object of id > },
      "rhs": { < expression object of exp > }
  }
  ```
  Note that property `rhs` is optional and is only provided if the local
  variable is initialized.
* New Expression (`new Class`)
  ```json
  {
      "type": "new",
      "class": { < identifier object of Class > }
  }
  ```
* New Array Expression (`new[exp] Array`)
  ```json
  {
      "type": "new-array",
      "size": { < expression object of exp > }
  }
  ```
* Is Void Expression (`isvoid(exp)`)
  ```json
  {
      "type": "isvoid",
      "body": { < expression object of exp > }
  }
  ```
* Addition Expression (`e1 + e2`)
  ```json
  {
      "type": "plus",
      "lhs": { < expression object of e1 > },
      "rhs": { < expression object of e2 > }
  }
  ```
* Subtraction Expression (`e1 - e2`)
  ```json
  {
      "type": "minus",
      "lhs": { < expression object of e1 > },
      "rhs": { < expression object of e2 > }
  }
  ```
* Multiplication Expression (`e1 * e2`)
  ```json
  {
      "type": "times",
      "lhs": { < expression object of e1 > },
      "rhs": { < expression object of e2 > }
  }
  ```
* Division Expression (`e1 / e2`)
  ```json
  {
      "type": "divide",
      "lhs": { < expression object of e1 > },
      "rhs": { < expression object of e2 > }
  }
  ```
* Equals Comparison Expression (`e1 == e2`)
  ```json
  {
      "type": "equals",
      "lhs": { < expression object of e1 > },
      "rhs": { < expression object of e2 > }
  }
  ```
* Less-Than Comparison Expression (`e1 < e2`)
  ```json
  {
      "type": "lt",
      "lhs": { < expression object of e1 > },
      "rhs": { < expression object of e2 > }
  }
  ```
* Less-Than-Or-Equal-To Comparison Expression (`e1 <= e2`)
  ```json
  {
      "type": "lte",
      "lhs": { < expression object of e1 > },
      "rhs": { < expression object of e2 > }
  }
  ```
* Not Expression (`!exp`)
  ```json
  {
      "type": "not",
      "body": { < expression object of exp > }
  }
  ```
* Negative Expression (`~exp`)
  ```json
  {
      "type": "negate",
      "body": { < expression object of exp > }
  }
  ```
* Array Access Expression (`e1[e2]`)
  ```json
  {
      "type": "array-access",
      "object": { < expression object of e1 > },
      "index": { < expression object of e2 > }
  }
  ```
* Identifier Expression (`id`)
  ```json
  {
      "type": "identifier",
      "value": { < identifier object of id > }
  }
  ```
* Number Expression (`int`)
  ```json
  {
      "type": "number",
      "line": < integer line number >,
      "col": < integer column number >,
      "value": < integer value of literal >
  }
  ```
  Note that `line` and `col` properties are non-zero, one-indexed integers
  representing the line and column of the first digit in the number lexeme.
* String Expression (`string`)
  ```json
  {
      "type": "string",
      "line": < integer line number >,
      "col": < integer column number >,
      "value": < string value of literal >
  }
  ```
  Note that `line` and `col` properties are non-zero, one-indexed integers
  representing the line and column of the first digit in the string lexeme.
* Boolean Expression (`bool`)
  ```json
  {
      "type": "bool",
      "value": < boolean value of bool >
  }
  ```