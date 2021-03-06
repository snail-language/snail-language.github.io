---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home 
title: Strings Numbers Arrays and Inheritance Language (snail)
# theme settings
# sidebar:
#     nav: "docs"
author_profile: true
classes: wide

header:
    overlay_image: /assets/images/snail.jpg
    caption: "Photo credit: [**Kevin Angstadt**](https://github.com/kevinaangstadt)"
    actions:
        - label: "Getting Started"
          url: "/docs/getting-started"
        - label: "Download"
          url: "/downloads"
    overlay_filter: linear-gradient(rgba(123,114,86,0.5), rgba(0,0,0,0.5))
---
# Introduction :snail:

Snail[^1] (or more formally, the *Strings Numbers Arrays and Inheritance Language*),
is a dynamically typed, expression-based, object-oriented programming language
that is simple enough to be implemented in a one-semester course. 

Snail programs consist of a set of *classes*, each of which encapsulates a
collection of *member variables* and *methods* that define a data type.
*Objects* are instances of these classes.  In snail, every piece of data is an
object (that is defined by a class).  As suggested by the name of the language,
it is possible for one class to *inherit* the variables and methods of another
class, thereby extending the behavior of a given type.

To simplify the language syntax, snail is an expression-based language.  Thus,
nearly every snail construct is an expression that produces some value (object)
when evaluated.

# Hello World


```reasonml
class Main : IO {
    main() {
        print_string("Hello, world.\n");
    };
};
```

More examples of snail programs are available
[here](https://github.com/snail-language/snail-examples){:target="_blank"}.

# Work in Progress
This documentation (along with the snail language itself) is a current work in
progress.  Please submit a [bug
report](https://github.com/snail-language/snail-language.github.io/issues) if
you have a question or find a problem.

[^1]: Officially, the **snail** acronym is written using all lower-case letters;
    however, the first letter may be capitalized at the beginning of sentences.
    Despite the last letter standing for "language", it is entirely acceptable
    to say "snail language".