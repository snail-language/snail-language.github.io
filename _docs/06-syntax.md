---
layout: single
title: Snail Syntax
permalink: /docs/syntax

# theme settings
toc: true
# toc_sticky: true
sidebar:
    nav: "docs"
  
page_css:
  - /assets/css/rr.css
---

## Snail Syntax

The snail language syntax is provided below using an EBNF grammar.  Tokens are
indicated by single quotes and are named using [SL-Lex token
names](/docs/interchange-formats#sl-lex-format) or character constants.
Parentheses are used for grouping, and regular expression operators have the
usual meanings (i.e., `*` means zero or more times, `+` means one or more times,
and `?` means zero or one times).

{% highlight conf %}
program ::= (class)+
class   ::= 'class' 'ident' (':' 'ident')? '{' (feature)* '}' ';'
feature ::= 'let' 'ident' ('=' expr)? ';'
          | 'ident' '(' ('ident' (',' 'ident')*)? ')' block ';'
expr    ::= 'ident' '=' expr
          | expr '[' expr ']' '=' expr
          | (expr ('@' 'ident')? '.')? 'ident' '(' (expr (',' expr)*)? ')'
          | 'if' '(' expr ')' block 'else' block 
          | 'while' '(' expr ')' block
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

It is a parse error for a method parameter to be named `self`.

### Expressions
![](/assets/svg/expression.svg){: .expression-rr}

Expressions make up the majority of the snail grammar.  The individual behavior
of each expression type is described on the [Language
Basics](/docs/language-basics) page.  

It is a parse error to name a local variable `self`. It is also a parse error to
assign a value to `self`.

It is a parse error for the identifier following the square brackets in a
`new-array` expression to be anything but `Array` (case sensitive).  Similarly,
it is a parse error for a `new` expression to construct an `Array` (case
sensitive).

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

### Line Numbers
The line number for an expression is the line number of the first token that is
part of that expression.

For example:
{% highlight js linenos %}
while ( x <=
              99 ) {
  x = x + 1;
}
{% endhighlight %}

The `while` expression is on line 1, the `x <= 99` expression is on line 1, the
`99` expression is on line 2, the `{ x = x + 1; }` block expression is on line
2, and both the `x = x + 1` and `x + 1` expressions are on line 3.
