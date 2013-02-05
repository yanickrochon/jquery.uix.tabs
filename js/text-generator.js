
(function($, undefined) {

var words = [
    "aliquam","erat","volutpat","vivamus","sollicitudin","viverra","tellus","tristique","fermentum","nam","mattis",
    "nisl","et","orci","accumsan","turpis","dictum","etiam","ultricies","condimentum","massa","pulvinar","purus",
    "imperdiet","fringilla","morbi","cursus","est","mi","dignissim","quis","vulputate","dui","consectetur","nulla",
    "tempus","porttitor","donec","scelerisque","eget","nisi","dolor","convallis","elit","eu","risus","nibhnulla",
    "facilisi","felis","hendrerit","laoreet","nec","interdum","arcu","dapibus","libero","augue","euismod","vitae",
    "tincidunt","urna","mauris","at","sed","ut","velit","vestibulum","odio","porta","mollis","magna","maecenas",
    "lacus","sit","amet","praesent","facilisis","metus","tempor","leo","nibh","venenatis","quam","lorem","aenean",
    "ac","id","enim","scelerisqueproin","varius","non","congue","in","pharetra","phasellus","nunc","placerat","lectus",
    "hac","habitasse","platea","dictumst","gravida","consequat","ornare","luctus"
];
var statementSeparators = ["!\0","?\0",".\0",",",";"];

$.fn.generateText = function(wordCount, wordsOnly) {
    var text = [];
    var nextUpper = true;
    var p = .9;

    while (wordCount-- > 0) {
        var t = words[parseInt(Math.random() * words.length)];
        if (nextUpper) {
            t = t.substr(0, 1).toUpperCase() + t.substr(1);
            nextUpper = false;
        } else if (Math.random() > p && wordCount > 0 && !wordsOnly) {
            p = .9;
            var sep = statementSeparators[parseInt(Math.random() * statementSeparators.length)];
            nextUpper = sep.length > 1;
            t += sep.substring(0, 1);
        } else {
            p -= .07;
        }
        text.push(t);
    }

    return text.join(" ") + (wordsOnly ? "" : ".");
};

})(jQuery);
