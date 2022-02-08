---
layout: single
title: Built-In Classes
permalink: /docs/classes

# theme settings
toc: true
# toc_sticky: true
sidebar:
    nav: "docs"
---

Several classes are built into the snail language.  These cannot be redefined
in a program.

## Object

The `Object` class is the root of the class inheritance graph.  All basic
classes inherit from `Object`, and classes without an explicit parent inherit
from `Object`.  It is an error to redefine `Object`.

### Methods

* `abort()`: flushes all output and halts program execution with the
  error message "abort\n".

* `copy()`: produces a *shallow* copy of the object.[^1] This method will fail
  for an `Array`.

* `get_type()`: returns a `String` with the name of the class of the object.

* `is_a(t)`: returns `true` if the class name, `t`, is in the inheritance graph
  of the object or `false` otherwise.

## Array

The `Array` class represents a contiguous sequence of objects.  Arrays have a
fixed size.

### Methods

* `length()`: returns an `Int` of the fixed size of the `Array`.

## Bool

The `Bool` class provides `true` and `false`.  The default initialization for
variables of type `Bool` is `false` (not `void`).  It is an error to inherit
from or redefine `Bool`.

## Int

The `Int` class provides integers with 64 bits of precision.  There are no
methods specific to `Int`.  The default initialization for variables of type
`Int` is 0 (not `void`).  It is an error to inherit from or redefine `Int`.

## IO
The `IO` class provides several methods for performing simple input and output.

### Methods

* `print_string(s)`: print the `String`, `s`, and flush standard output.  This
  returns the `self` object.  Every sequence of `\t` and `\n` is converted to a
  tab and newline, respectively.  Note that snail stores these two characters
  separately, unlike most languages where these two characters are combined into
  an *escape sequence*.

* `print_int(i)`: print the `Int`, `i`, and flush standard output.  This returns
  the `self` object.

* `read_string()`: reads a string from the standard input, up to---but not
  including---the newline character or end of file.  The newline character is
  consumed and discarded.  If there is an error trying to read a line from
  standard input, the empty string is returned.  Common errors include:
    + no input before the end of file
    + the read string contains the null character---with unicode/ASCII value 0)

* `read_int()`: reads a single (possibly signed) integer, which may be preceded by
  whitespace.  Any characters following the integer, up to and including the
  next newline, are discarded.  If an error occurs, then 0 is returned.  Common
  errors include:
    + no input found before the end of file
    + malformed input (there is no integer to read)
    + integer read in is less than $$-2^{63}$$
    + integer read in is greater than $$2^{63}-1$$

## String
The `String` class provides strings, or sequences of characters.  Note, however,
that there is no character class in snail.  The default initialization of a
`String` is `""` (not `void`).  It is an error to inherit or redefine `String`.

### Methods

* `concat(s)`: returns a `String` formed by concatenating the `String` `s` after
  `self`.

* `length()`: returns the length of the string as an `Int`.

* `substr(start, length)`: returns a subsequence of the given `String` starting
  from position `start` and containing `length` characters.  Character positions
  begin with 0.  A runtime error is generated if the specified substring is out
  of range.

[^1]: A shallow copy of `a` copies `a` itself (creating new locations for each
    member variable), but does not recursively copy objects that `a` refers to.