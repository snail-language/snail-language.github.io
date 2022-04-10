---
layout: single
title: Snail Lexical Structure
permalink: /docs/lexical-structure

# theme settings
toc: true
# toc_sticky: true
sidebar:
    nav: "docs"
---
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
Refer to [Langauge Basics](/docs/language-basics) or [SL-LEX
Format](/docs/interchange-formats#sl-lex-format) for additional lexemes in the
language.