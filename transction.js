// very good example of mongodb, see part 3
// http://cwbuecheler.com/web/tutorials/2013/node-express-mongo/

var _ = require('underscore');
var L = require('./logger');
var scraper = require('./scraper');

var transction = function(param) {
    L.debug("In transction");
    this.id = param.id; //unique id for this transction. The id is also used to identify name of the zip file.
    this.url=param.url;
    this.selector=param.selector;
    this.period=param.period;

    this.add_time = new Date(new Date().getTime());
    this.fetched_data = param.fetched_data || [];
    return this;
};

var fs = require('fs');
transction.G = {};
transction.G.expireDuration = 15 * 24 * 60 * 60 * 1000;  // unit: ms. It's 15 days
transction.G.remideDuration = 13 * 24 * 60 * 60 * 1000;  // unit: ms.

// transction.G.expireCheckPeriod = 8*60*60*1000; //unit:ms. It's 8 hours
transction.G.expireCheckPeriod = 10*1000;

//save this transction to DB
transction.dbpath = __dirname + '/data/transction.db';
transction.expiredDbpath = __dirname + '/data/expired-transction.db';
transction.db = [];
transction.expiredDb = [];
if (fs.existsSync(transction.dbpath)) {
    var db = JSON.parse(fs.readFileSync(transction.dbpath), function (key, value) {
        if (key === 'time'){
            return new Date(value);
        } else {
            return value;
        }
    });
    _.each(db, function(trans) {
        var t = new transction(trans);
        t.add_time = trans.add_time;
        transction.db.push(t);
    });
}

console.log(transction.db);
transction.read_from = false;

var _ = require('underscore');

//add this in db
transction.prototype.addToDB = function() {
    console.log('save called.');
    var that = this;
    if (_.contains(_.map(transction.db, function(t) {return t.url;}), that.url)) {
        L.debug("trans already exists: ", that);
    } else {
        L.debug("add trans to db: ", that);
        transction.db.push(this);

        //TODO: this need to be writeFile. But current there are concurrency problems, so this is a workaround
        fs.writeFileSync(transction.dbpath, JSON.stringify(transction.db));
    }
    return this;
};

//update this in db
transction.prototype.updateToDB = function() {
    console.log('update called');
    fs.writeFileSync(transction.dbpath, JSON.stringify(transction.db));
    return this;
};

//delete this in db
transction.prototype.deleteFromDB = function() {
    console.log('delete called');
    var that = this;
    console.log('db: ' + JSON.stringify(transction.db));
    transction.db = _.reject(transction.db, function (trans) {
        // console.log('trans.id: ' + trans.id + ', that.id:' + that.id);
        return trans.id === that.id;});

    console.log('after db: ' + JSON.stringify(transction.db));
    fs.writeFileSync(transction.dbpath, JSON.stringify(transction.db));
    return undefined;
};

transction.prototype.add_fetched_data_item = function(data) {
    this.fetched_data.push({time:new Date(new Date().getTime()),
                            data:data});

    return this;
};


//get a transction form DB given it's id or the receiver
transction.prototype.read = function(param, callback) {
    console.log('get called.');

    _.each(transction.db, function(val, idx, obj) {
        if (val.id === param.id) {
            callback(val);
        }
    });


    // fs.readFile(__dirname + 'transction.db', function (err, data) {
    //     if (err) throw err;
    //     console.log(data);
    //     var db = JSON.parse(data);

    //     _.each(db, function(val, idx, obj) {
    //         if (val.id === param.id) {
    //             callback(obj);
    //         }
    //     );
    //           });

    return this;
};

transction.read = transction.prototype.read;

transction.check = function () {
    L.debug('I will check expriration');
    _.each(transction.db, function(trans, idx, obj) {
        //transction expired.
        console.log('id: ' + trans.id);
        var fd = trans.fetched_data;

        new Date(new Date().getTime() + transction.G.expireDuration);

        if (!trans.fetching &&
            (fd.length == 0 ||
             new Date(fd[fd.length-1]['time'].getTime() + trans.period) < new Date())) {
            L.debug('get url: ', trans.url);
            trans.fetching=1;
            scraper.get(trans.url, trans.selector,
                        function (err, result) {
                            trans.add_fetched_data_item(result);
                            trans.fetching=0;
                            trans.updateToDB();
                            
                        });
        }
    });

    _.delay(transction.check, transction.G.expireCheckPeriod);
};



L.debug('transction.js loaed');
module.exports = transction;
