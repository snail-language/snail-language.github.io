---
layout: single
title: Specification
permalink: /docs/specification

# theme settings
toc: false
classes: wide
# toc_sticky: true
sidebar:
    nav: "docs"
  
page_css:
  - /assets/css/rr.css
---

This section of the snail documentation provides a specification for the
language.  It is divided into several sections:

* [Lexical Structure](/docs/lexical-structure): describes valid lexemes and
  tokens in the language.
* [Syntax](/docs/syntax): presents a formal grammar for the snail language. This
  section also describes static checks that are performed while validating
  syntax.
* [Runtime Semantics](/docs/runtime-semantics): describes the execution of snail
  programs. Rules for dynamically checking types and evaluating expressions are
  provided.
* [Interchange Formats](/docs/interchange-formats): describes two serialization
  formats (SL-LEX and SL-AST), which can be used to save sequences of snail
  tokens and snail abstract syntax trees, respectively, to disk.