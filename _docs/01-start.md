---
layout: single
title: Getting Started
permalink: /docs/getting-started
redirect_from: /docs

# theme settings
sidebar:
    nav: "docs"
classes: wide
---

Snail source files have the extension `.sl`. The *reference implementation* also
defines several other formats for representing intermediate program
representations.

# Obtaining and Running the Interpreter

Go to the [Downloads](/downloads) page to obtain a copy of the reference
interpreter. To run a snail program with the interpreter, pass the file in as a
command line argument:

```shell
snail file.sl
```

The snail interpreter has several command-line options:

* `--lex` (`-l`) the interpreter will stop after tokenizing (lexing) the input
  program and will output an `.sl-lex` file containing tokens in a simple
  interchange format.<br><br>
* `--unlex` (`-L`) the interpreter will undo lexing and produce an `.unlex.sl`
  source file containing the original snail tokens.<br><br>
* `--parse` (`-p`) the interpreter will stop after parsing tokens from the input
  program and output an `.sl-ast` file containing the abstract syntax tree of
  the program in JSON format.<br><br>
* `--unparse` (`-P`) the interpreter will undo parsing and produce an
  `.unparse.sl` sourcefile containing a snail program equivalent to a given
  AST.<br><br>
* `--trace` (`-t`) the interpreter will output additional debugging information
  while executing the program.

Note that the reference interpreter can also read well-formed `.sl-lex` and
`.sl-ast` files in addition to the basic `.sl` program source code.

# Where to Go from Here

* If you are just getting started with snail, have a look at the [Language
  Basics](/docs/language-basics) page for an introduction to snail syntax and
  language features.
* Check out [this
  repository](https://github.com/snail-language/snail-examples){:target="_blank"}
  for some example programs written in snail.
* For language implementers, please refer to the [Specification](/docs/specification)
  page for a formal specification of the language.