var express = require('express');
var router = express.Router();
//var sender = require('./mailsender');
var nodemailer = require('nodemailer');
var monk = require('monk');
var db = monk('localhost/test');

/* GET users listing. */
router.get('/login/sendmail', function(req, res, next) {
  console.log('[mail] ' + JSON.stringify(req.query));
  send(req.query.address);
  res.json({success: true});
  console.log('[send]');
});

function send(address) {
  console.log('[login] sendmail ' + address);  

  // create reusable transporter object using the default SMTP transport
  //var transporter = nodemailer.createTransport('smtps://55307885:glbmqevhcgdkbidc@smtp.qq.com');
  var transporter = nodemailer.createTransport('smtps://lianghaijun001:hello1234@smtp.163.com');

  var passcode = Math.floor(Math.random() * 900000) + 100000;

  //write to db
  putToDb(address, passcode);

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: '"lianghaijun" <lianghaijun001@163.com>', // sender address
    to: address, // list of receivers
    subject: '零代码验证码', // Subject line
    text: '零代码验证码', // plaintext body
    html: '你的验证码是 ' + passcode // html body
  };

  // create reusable transporter object using the default SMTP transport
  //var transporter = nodemailer.createTransport('smtps://55307885:glbmqevhcgdkbidc@smtp.qq.com');
  var transporter = nodemailer.createTransport('smtps://lianghaijun001:hello1234@smtp.163.com');

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}

/* GET users listing. */
router.get('/login/verify', function(req, res, next) {
  console.log('[login] verify' + JSON.stringify(req.query));
  var passcode = req.query.passcode;
  var address = req.query.address;
  
  //read from db
  var entity = db.get('login');
  entity.find({address:address}, {}, function(err, docs) {
    if(docs && docs[0]) {
      console.log('[login] verify ' + address + ' ' + passcode + ' ' + docs[0].passcode); 

      if(docs[0].passcode == passcode) {
        res.json({success: true});
        entity.update({id: docs[0].id}, req.query, function() {                      
          console.log('[login] update ' + docs[0].id + ' ' + req.body);  
        });  
      } else {
        res.json({success: false});
      }
    }
  });

  //res.json({success: true});
  //console.log('[send]');
});

function putToDb(address, passcode) {
  var entity = db.get('login'); 
  
  var obj = {address: address, passcode: passcode};
  
  entity.find({address:address}, {}, function(err, docs) {
    if(docs && docs[0]) {
      docs[0].passcode = passcode;
      entity.update({id: docs[0].id}, docs[0], function() {
        console.log('[login] update passcode ' + address + ' ' + passcode);
      });
    }
  });

  entity.find({}, {sort: {'id': -1}}, function(err, docs) {
    var nid = 1;
    if(docs.length) {
      nid = docs[0].id + 1;
    }

    var obj = {address: address, passcode: passcode};
    console.log('[login] putdb' + JSON.stringify(obj));

    obj.id = nid;
    entity.insert(obj);
    console.log('[login] insert passcode ' + address + ' ' + passcode);
  });
}


/* GET users listing. */
router.get('/login/login', function(req, res, next) {
  var entity = db.get('login');

  console.log('[login] verify' + JSON.stringify(req.query));
  var password = req.query.password;
  var address = req.query.address;

  entity.find({address:address}, {}, function(err, docs) {
    console.log('[login] find ' + address + ' ' + JSON.stringify(docs));

    if(docs && docs[0] && docs[0].password == password) {

         docs[0].token = '' + new Date().getTime();

         loginSuccess(res, docs[0]);

         entity.update({id: docs[0].id}, docs[0]);

         res.json({
           success: true,
           result: {
             email: docs[0].address,
             nick: docs[0].nick
           }
         });
    } else {
      res.json({success: false});
    }
    
  });
});

//refresh cookie
function loginSuccess(res, record) {
  res.cookie('email', record.address);
  res.cookie('nick', record.nick);
  res.cookie('token',record.token, {httpOnly: true, maxAge: 24*60*60*1000});
}

router.get('/login/logout', function(req, res, next) {
  console.log('[login] logout' + JSON.stringify(req.query));
  res.clearCookie('token');
  res.json({success: true});
});





module.exports = router;

