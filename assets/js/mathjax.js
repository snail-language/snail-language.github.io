
var script = document.createElement('script');
script.onload = function () {
  MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    svg: {
      fontCache: 'global'
    }
  };
};
script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
script.async = true;

document.body.appendChild(script); //or something of the likes



