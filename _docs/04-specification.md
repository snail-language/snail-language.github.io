---
layout: single
title: Specification
permalink: /docs/specification

# theme settings
toc: true
# toc_sticky: true
sidebar:
    nav: "docs"
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

Strings are enclosed in double quotes (i.e., "..."). Snail only recognizes one
*escape sequence*: `\"` during lexing.  This allows double quotes to be embedded
in a string literal.

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
are not allowed.

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

### Precedence

## Data Representation


## Operational Semantics

### Environment and Store

### Typing Rules

### Operational Rules

## Interchange Formats

### SL-LEX Format
The SL-LEX format is used to save a sequence (stream) of tokens to a file.
Files with the `.sl-lex` suffix follow a simple serialization format.

Each token is represented by a triple (or quadruple) of lines. The first line
holds the line number.  The second line holds the column number. The third line
gives the name of the token. The optional fourth line holds additional
information (i.e., the lexeme) for identifiers, integers, and strings.

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
