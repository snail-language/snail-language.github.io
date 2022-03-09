---
layout: single
title: Specification
permalink: /docs/specification

# theme settings
toc: true
# toc_sticky: true
sidebar:
    nav: "docs"
  
page_css:
  - /assets/css/rr.css
---

{: .notice--info}
This page is still under active development.

## Lexical Structure
The lexical structure is designed to be fairly simple to implement.  There are
some deviations from popular programming languages (e.g., handling of escape
sequences); these are typically to reduce the burden of implementing lexical
analysis.

### Integers
Integers are non-empty strings of digits 0-9.  It is a lexer error if the a
literal integer constant is too big to be represented as a 64-bit signed
integer. 64-bit signed integers range from $$-2^{63}$$ to $$2^{63}-1$$.

### Identifiers
Identifiers are strings (other than keywords) that conform to [Unicode's
identifier specification](https://unicode.org/reports/tr31/).  In particular,
snail uses the "XID" identifier specification.

Both variable names and class names are treated as identifiers in snail.
Notably, keywords, are treated separately from identifiers.

### String Literals

Strings are enclosed in double quotes (i.e., "..."). Snail only recognizes two
*escape sequences*, `\"` and `\\`, during lexing.  This allows double quotes to
be embedded in a string literal and a backslash to be the last character in a
string.

```js
"Grace Hopper said, \"A ship in port is safe, but that’s not what ships are built for.\""
```

Two escape sequences are handled by the `IO` module: `\n` and `\t`.  These are
not interpreted or transformed by the lexer in any way.

Note that escape sequences *are not converted* to a single character.  They are
left as a `\` followed by the next character.  This will simplify lexing and
interpretation, but differs from other languages.

```js 
class Main : IO {
    main() {
        print_string("She said, \"What?\"");
    };
};

// outputs: She said, \"What?\"
```

Strings may not contain the null character (with integer value 0).  Newline
characters and carriage returns are also not allowed.  All other characters 
are allowed.

Strings must have an opening and closing quote.  The lexer must reject source
code that contains malformed strings.

### Comments
Line comments begin with `//` and continue to the next newline (or end of file).

Block comments are also supported using `/* ... */` syntax.  Block comments may
be nested and must be terminated before the end of file.

### Keywords
The following identifiers are treated as keywords in snail:
* `class`
* `else`
* `if`
* `isvoid`
* `let`
* `new`
* `while`
* `true`
* `false`

All keywords in snail are *case insensitive*. That is, any capitalization of a 
keyword is still treated as a keyword.  

### Whitespace
Snail follows the definition of whitespace provided by the [Unicode
specification](https://unicode.org/charts/collation/chart_Whitespace.html).

### Operators and Punctuation
Refer to [Langauge Basics](/docs/language-basics) or [SL-LEX Format](#sl-lex-format) for additional lexemes in the language.

## Snail Syntax

The snail language syntax is provided below using an EBNF grammar.  Tokens are
indicated by single quotes and are named using [SL-Lex token
names](#sl-lex-format) or character constants.  Parentheses are used for
grouping, and regular expression operators have the usual meanings (i.e., `*`
means zero or more times, `+` means one or more times, and `?` means zero or one
times).

{% highlight conf %}
program ::= (class)+
class   ::= 'class' 'ident' (':' 'ident')? '{' (feature)* '}' ';'
feature ::= 'let' 'ident' ('=' expr)? ';'
          | 'ident' '(' ('ident' (',' 'ident')*)? ')' '{' block '}' ';'
expr    ::= 'ident' '=' expr
          | expr '[' expr ']' '=' expr
          | (expr ('@' 'ident')? '.')? 'ident' '(' (expr (',' expr)*)? ')'
          | 'if' '(' expr ')' '{' block '}' 'else' '{' block '}'
          | 'while' '(' expr ')' '{' block '}'
          | block
          | 'let' 'ident' ('=' expr)?
          | 'new' 'ident'
          | 'new' '[' expr ']' 'ident'
          | 'isvoid' '(' expr ')'
          | expr '+' expr
          | expr '-' expr
          | expr '*' expr
          | expr '/' expr
          | expr '==' expr
          | expr '<' expr
          | expr '<=' expr
          | '!' expr
          | '~' expr
          | '(' expr ')'
          | expr '[' expr ']'
          | 'ident'
          | 'int'
          | 'string'
          | 'true'
          | 'false'
block   ::= '{' (expr ';')+ '}'

{% endhighlight %}

Next, we describe each section of this grammar in detail. The snail grammar may
also be represented using [syntax
diagrams](https://en.wikipedia.org/wiki/Syntax_diagram) as shown below.


[//]: #  https://www.bottlecaps.de/rr/ui
[//]: #  
[//]: #  Color is: #64B5CE
[//]: #  
[//]: #  add viewBox="0 0 width height" preserveAspectRatio="xMinYMin meet"
[//]: #  set max-width in rr.css to 2x width


### Programs

![](/assets/svg/program.svg){: .program-rr}

Programs consist of one or more classes.

### Classes
![](/assets/svg/class.svg){: .class-rr}

Classes are named by an identifier, contain zero or more features wrapped in
curly braces, and are terminated by a semicolon.  
Additionally, an optional identifier may be provided to indicate inheritance.

It is a parse error if any of the following identifiers (case sensitive) are
used for a class name:
- `Array`
- `Bool`
- `Int`
- `IO`
- `String`
- `Object`

It is also a parse error if any of the following identifiers (case sensitive)
are used for an inherited class name:
- `Array`
- `Bool`
- `Int`
- `String`

Inheritance parse errors should be reported on the colon (`:`) rather than the 
identifier.

### Features
![](/assets/svg/feature.svg){: .feature-rr}

Features can be either be *member variables* or *methods*.  A member variable
may either be initialized or uninitialized.  All features are terminated by
semicolons.

It is a parse error to name a member variable `self`.  

### Expressions
![](/assets/svg/expression.svg){: .expression-rr}

Expressions make up the majority of the snail grammar.  The individual behavior
of each expression type is described on the [Language
Basics](/docs/language-basics) page.  

It is a parse error to name a local variable `self`.

It is a parse error for the identifier following the square brackets in a `new-array` expression to be anything but `Array` (case sensitive).

### Blocks
![](/assets/svg/block.svg){: .block-rr}

Blocks wrap a sequence of expressions---each terminated by a semicolon---in
curly braces.  Blocks are defined separately in the grammar because they are
used in method definitions, `if` expressions, and `while` expressions.

It is a parse error for a block to be empty.
  
### Precedence
The precedence of operations, from highest to lowest, is given in the following
table.

| Operator(s)   | Associativity | Precedence |
| ------------- | ------------- | ---------- |
| `.`           | none          | *highest*  |
| `@`           | none          |            |
| `~`           | none          |            |
| `[`           | left          |            |
| `*` `/`       | left          |            |
| `+` `-`       | left          |            |
| `<` `<=` `==` | none          |            |
| `!`           | none          |            |
| `=`           | none          | *lowest*   |


## Data Representation


## Operational Semantics

### Environment and Store

### Typing Rules

### Operational Rules

## Interchange Formats
The snail specification provides formats for serializing tokens and abstract
syntax trees.  These formats designed to be simple to parse either manually or
using common tools.

### SL-LEX Format
The SL-LEX format is used to save a sequence (stream) of tokens to a file.
Files with the `.sl-lex` suffix follow a simple serialization format.

Each token is represented by a triple (or quadruple) of lines. The first line
holds the line number.  The second line holds the column number. The third line
gives the name of the token. The optional fourth line holds additional
information (i.e., the lexeme) for identifiers, integers, and strings.

#### Line and Column Numbers
The first line in a file is line 1. Each successive newline character (`\n`)
increments the line count. Column numbers begin with column 1 and resets on each
newline.

#### Example
Given the following input:

{% highlight js linenos %}
Backslash !
   "allowed"
{% endhighlight %}

The corresponding SL-LEX output is:
```
1
1
identifier
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

### SL-AST Format
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

#### Formal Specification
SL-AST is formally specified by a JSON *schema*.  The most recent version of the
schema is available [here](/assets/sl-ast.schema.json).  Any number of JSON
schema validator tools may be used to verify the conformity of an SL-AST file to
this specification.

#### Informal Specification
The following is an informal discussion of each of the object types found in an
SL-AST file.  The formal specification should be referenced for precise
descriptions.

##### Classes

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

##### Members

The following object structure is used to define a member variable:

```json
{
    "name": { < identifier object of the variable name > },
    "type": "member",
    "init": { < expression object of the initializer value > }
}
```

The `name` and `type` properties are required.

##### Methods

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


##### Identifiers

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

##### Expressions

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

##### Expression Values

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