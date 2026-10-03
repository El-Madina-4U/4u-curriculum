Container query height (cqh) and container query width (cqw) are units that specify a size relative to the dimensions of an element's container element.

`1cqh` is 1% of the container's height. For example, if the container's height is 300px, then a value of `10cqh` on a property will be 30px.

One benefit of using `cqh` units rather than `px` (pixel units) for sizing elements is that elements will resize along with their container. This usually happens when you resize a browser window, or view a webpage on a different screen.

Here is an example:

![A gif showing font sizes changing when the browser changes height and width.](images/cqh_cqw.gif)

In the example, the font size of the the main story text has been set to use `cqh`, so it changes with the browser's height.

The font size of the text in the navbar has been set to use `cqw`, so it changes with the browser's width.
