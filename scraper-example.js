var scraper = require('./scraper');
// jd 洗碗机价格
var url = 'http://item.jd.com/1070355.html';
var selector='#jd-price, #p-ad';
scraper.get(url, selector, function (err, result) {
    console.log("err: ", err);
    console.log("result: ", result);
});
