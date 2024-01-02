# genuary 2024

[Advent of Code 2023](https://github.com/jeredw/advent2023) was fun but not
very creative.  So this year I am going to try out this [Genuary
2024](https://genuary.art/) thing, a daily generative art programming prompt
for January.

## Day 1 - particles, lots of them

[Black hole sun](https://jeredw.github.io/genuary2024/day1.html) type thing?  I
could probably make many more particles if I moved the update loop out of JS...
hmm.  Warning makes noise if you click.

*Update*: I tried commenting out the `update()` calls and cranking particles up
to a million and I only get 2-3 fps!  So canvas rasterizing is bottlenecking
here.  Just switching to `putImageData` gets me up to 400-500k particles with
comfortable fps.  Added some angular velocity and more general fooling around,
this was super fun.

*PS*: I commented out the sound because it was too annoying.
