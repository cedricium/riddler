How to parse `<li>` elements and build an array of riddle / answer objects:

```js
/**
 * Site used: https://savagelegend.com/misc-resources/classic-riddles-1-100/
 */

var items = document.querySelectorAll('.entry-content ol li');
var riddles = [];

items.forEach((item) => {
  var answer = item.lastChild.textContent;
  var matchAnswer = `\n${answer}`;
  var re = new RegExp(matchAnswer, 'g');
  var riddle = {
    "riddle": item.textContent.replace(re, ''),
    "answer": answer.trim()
  };
  riddles.push(riddle);
});
```
