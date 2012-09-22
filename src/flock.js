/**
 * The most basic flock model you could ever dream of.
 * Maybe.
 */


/**
 * TODO: Maybe replace this with something real later?
 */
var debugger = function() {
  if (window.console && window.console.log) {
    window.console.log.apply(window.console.log, arguments);
  }
};

debugger.error = debugger.log = debugger.warn = function() {
  debugger.apply(debugger, arguments);
};



/**
 * A simple pubsub.
 * Maybe a maintained one of these already exists somewhere?
 */
var PubSub = function() {
  this.listeners = {};
};


PubSub.prototype.subscribe = function(evt, callback, context) {
  if (!(evt in this.listeners)) {
    this.listeners[evt] = [];
  }
  this.listeners[evt].push([callback, context]);
};

PubSub.prototype.forEachInEvent = function(evt, action) {
  var listeners = this.listeners[evt];
  if (!listeners) {
    return;
  }

  listeners.forEach(action);
};


PubSub.prototype.unsubscribe = function(evt, callback, context) {
  this.forEachInEvent(evt, function(listener, id, arrayObj) {
    if (listener[0] == callback && listener[1] == context) {
      arrayObj.splice(id, 1);
    }
  });
};


PubSub.prototype.publish = function(evt) {
  this.forEachInEvent(evt, function(listener) {
    listener[0].call(listener[1], evt);
  });
};



/**
 * Constructs a flock out of a leader and an array of followers.
 * @param {!Array<!FlockMember>} members The members of the flock
 *     in order of importance.
 * @constructor
 */
var Flock = function(members) {
  this.members;
  this.registerMembers(members);
};


Flock.prototype.registerMembers = function(members) {
  for(var i=0, l=members.length; i < l; i++) {
    this.registerMember(member, this.getLeaderForNode(i));
  }
};


/**
 * Calculates the index of the leader for the current follower
 * based on the formation of the flock.
 * @param {number} index The index into this flock's follower array.
 * @return {number} The index of the leader node.
 */
Flock.prototype.getLeaderIndexForNodeAt = function(index) {
  return Math.ceil(index / 2) - 1;  
};


/** 
 * Returns the leader of the follower at the given index.
 * @param {number} index The index into this flock's follower array.
 * @return {FlockMember} The member that is leading the node at
 *     given index.
 */
Flock.prototype.getLeaderForNodeAt = function(index) {
  var leaderIndex = this.getLeaderIndexForNodeAt(index);
  if (leaderIndex < 0) {
    return this;
  }
  var leader = this.followers[leaderIndex];
  if (!leader) {
    debugger.error('You done boken something. Leader index is out of bounds');
  }
  return leader;
};


Flock.prototype.registerMember = function(member, leader) {
  member.registerLeader(leader);
};



/**
 * Constructs a flock member.
 */
var FlockMember = function() {

};


FlockMember.prototype.leader;


FlockMember.prototype.registerLeader = function(leader) {
  this.leader = leader;
};



