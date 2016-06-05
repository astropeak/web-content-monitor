var scraper = require('./scraper');
scraper.get("http://www.baidu.com", "p", function (err, result) {
    console.log("err: ", err);
    console.log("result: ", result);
});

