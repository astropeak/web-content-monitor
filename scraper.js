var driver = require('node-phantom-simple');


function get(url, selector, cb) {
    // url: "http://phantomjs.org/examples"
    driver.create({ path: require('phantomjs').path }, function (err, browser) {
        return browser.createPage(function (err, page) {
            return page.open(url, function (err,status) {
                console.log("opened site? ", status);
                page.injectJs('./js/jquery.min.js', function (err) {
                    console.log("err: ", err);
                    console.log("1.selector: ", selector);
                    // jQuery Loaded.
                    // Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
                    setTimeout(function () {
                        return page.evaluate(function (selector1) {
                            //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
                            var eee = [];
                            $(selector1).each(function () { eee.push($(this).html()); });
                            return eee;
                        }, selector, function (err,result) {
                            cb(err, result);
                            browser.exit();
                        });
                    }, 1000);
                });
            });
        });
    });
}

// get("http://phantomjs.org/examples", "h2");
get("http://www.baidu.com", "p", function (err, result) {
    console.log("err: ", err);
    console.log("result: ", result);
});

module.exports = {'get':get};