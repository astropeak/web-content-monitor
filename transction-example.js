var transction = require('./transction.js');
new transction({url: 'http://item.jd.com/1070355.html',
                selector:'#jd-price, #p-ad',
                period:60*60*1000})
    .addToDB();

new transction({url: 'http://www.cnblogs.com',
                selector:'h3',
                period:100*1000})
    .addToDB;

transction.check();