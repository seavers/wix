var express = require('express');
var router = express.Router();
var monk = require('monk');
var db = monk('localhost/test');
var users = db.get('users');
var ObjectID = require('mongodb').ObjectID;

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log('[GET] ' + JSON.stringify(req.query));
  users.find(req.query, function(err, docs) {
    res.json(docs);
  });
});

router.get('/:id', function(req, res) {
  users.find({id: parseInt(req.params.id)}, function(err, docs) {
    res.json(docs);
  });
});

router.post('/', function(req, res) {
  users.find({}, {sort: {'id': -1}}, function(err, docs) {
    var nid = 1;
    if(docs.length) {
      nid = docs[0].id + 1;
    }
    
    var obj = req.body;
    console.log('[post] ' + JSON.stringify(obj));

    obj.id = nid;
    users.insert(obj);

    res.json({success: true})
  })
});

router.put('/:id', function(req, res) {
  req.body.id = parseInt(req.params.id);
  users.update({id: req.body.id}, req.body, function() {
    res.json({success: true});
  });
});

router.delete('/:id', function(req, res) {
  req.body.id = parseInt(req.params.id);                                     
  users.remove({id: req.body.id}, function() {                     
    res.json({success: true});                                               
  }); 
});

module.exports = router;
