var driver = require('node-phantom-simple');

driver.create({ path: require('phantomjs').path }, function (err, browser) {
    return browser.createPage(function (err, page) {
        // return page.open("http://tilomitra.com/repository/screenscrape/ajax.html", function (err,status) {
        return page.open("http://phantomjs.org/examples", function (err,status) {
            console.log("opened site? ", status);
            page.injectJs('./js/jquery.min.js', function (err) {
                // jQuery Loaded.
                // Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
                setTimeout(function () {
                    return page.evaluate(function () {
                        //Get what you want from the page using jQuery. A good way is to populate an object with all the jQuery commands that you need and then return the object.
                        var h2Arr = [],
                            pArr = [];

                        $('h2').each(function () { h2Arr.push($(this).html()); });
                        $('p').each(function () { pArr.push($(this).html()); });

                        return {
                            h2: h2Arr,
                            p: pArr
                        };
                    }, function (err,result) {
                        console.log(result);
                        browser.exit();
                    });
                }, 2000);
            });
        });
    });
});