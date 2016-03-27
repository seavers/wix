var express = require('express');
var router = express.Router();
var monk = require('monk');
var db = monk('localhost/test');
var ObjectID = require('mongodb').ObjectID;

/* GET listing. */
router.get('/:model', function(req, res, next) {
  console.log('[GET] ' + JSON.stringify(req.query));
  var entity = db.get(req.params.model);
  var query = req.query;
  if(query.q) {
    query = eval("(" + query.q + ")");
  }
  entity.find(query, function(err, docs) {
    res.json(docs);
  });
});

/* GET by id */
router.get('/:model/:id', function(req, res) {
  var entity = db.get(req.params.model);
  entity.find({id: parseInt(req.params.id)}, function(err, docs) {
    res.json(docs);
  });
});

/* search listing. */
router.search('/:model', function(req, res, next) {
  console.log('[GET] ' + JSON.stringify(req.query));
  var entity = db.get(req.params.model);
  entity.find(req.body, function(err, docs) {
    res.json(docs);
  });
});

router.post('/:model', function(req, res) {
  var entity = db.get(req.params.model);
  entity.find({}, {sort: {'id': -1}}, function(err, docs) {
    var nid = 1;
    if(docs.length) {
      nid = docs[0].id + 1;
    }
    
    var obj = req.body;
    console.log('[post] ' + JSON.stringify(obj));

    obj.id = nid;
    entity.insert(obj);

    res.json({success: true})
  })
});

router.put('/:model/:id', function(req, res) {
  req.body.id = parseInt(req.params.id);
  var entity = db.get(req.params.model);
  entity.update({id: req.body.id}, req.body, function() {
    res.json({success: true});
  });
});

router.delete('/:model/:id', function(req, res) {
  req.body.id = parseInt(req.params.id);                                     
  var entity = db.get(req.params.model);
  entity.remove({id: req.body.id}, function() {                     
    res.json({success: true});                                               
  }); 
});

module.exports = router;
