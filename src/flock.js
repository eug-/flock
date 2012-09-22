/**
 * The most basic flock model you could ever dream of.
 * Maybe.
 */


/**
 * TODO: Maybe replace this with something real later?
 */
var logger = function() {
  var args = Array.prototype.slice.call(arguments);
  if (window.console && window.console.log) {
    window.console.log.apply(window.console, args);
  }
};

logger.error = logger.log = logger.warn = function() {
  logger.apply(null, arguments);
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


PubSub.prototype.publish = function(evt, data) {
  this.forEachInEvent(evt, function(listener) {
    listener[0].call(listener[1], evt, data);
  });
};



/**
 * Constructs a flock out of a leader and an array of followers.
 * @param {!Array<!FlockMember>|number} membersOrMemberCount The
 *     members of the flock in order of importance, or the count
 *     of members to be created for this flock.
 * @constructor
 */
var Flock = function(membersOrMemberCount) {
  PubSub.call(this);

  if (typeof membersOrMemberCount == 'number') {
    membersOrMemberCount = Flock.generateMembers(membersOrMemberCount);
  }
  this.members = membersOrMemberCount;
  this.registerMembers(membersOrMemberCount);
};
Flock.prototype = new PubSub();


/**
 * Flock action constants.
 * @type {string}
 */
Flock.NEW_ACTION = 'new_action';


/**
 * Delay between leader and follower message in ms.
 * @type {number}
 */
Flock.TRANSMISSION_DELAY = 300;


/**
 * Creates new flock members.
 * @param {number} count The number of new flock members to generate.
 * @return {!Array<!FlockMember>} An array containing new flock members.
 */
Flock.generateMembers = function(count) {
  var members = [];
  for (;count >= 0; count --) {
    members.push(new FlockMember());
  }
  return members;
};


/**
 * Sets up members of the flock with leaders and flock ids.
 * @param {!Array<!FlockMember>} members All flock members.
 */
Flock.prototype.registerMembers = function(members) {
  for(var i=0, l=members.length; i < l; i++) {
    members[i].setId(i);
    members[i].registerLeader(this.getLeaderForNodeAt(i));
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
  var leader = this.members[leaderIndex];
  if (!leader) {
    logger.error('You done boken something. Leader index is out of bounds');
  }
  return leader;
};



/**
 * Constructs a flock member.
 */
var FlockMember = function() {
  PubSub.call(this);
  this.leader = null;
};
FlockMember.prototype = new PubSub();


/**
 * A unique identifier for this flock member in a flock.
 * @type {number|string}
 */
FlockMember.prototype.id = 0;


/**
 * Sets a unique identifier for this member.
 * @param {number|string} id The identifier of this member.
 */
FlockMember.prototype.setId = function(id) {
  this.id = id;
};


/**
 * Sets up a reference to this flock member's leader.
 * @param {FlockMember|Flock} leader This member's leader.
 *
 * TODO: Is a pubsub too heavy?
 */
FlockMember.prototype.registerLeader = function(leader) {
  this.leader = leader;
  this.leader.subscribe(Flock.NEW_ACTION, this.onNewAction, this);
};


/**
 * Responds to an action event.
 * @param {string} event The event type that was published.
 * @param {string} action The action type published.
 */
FlockMember.prototype.onNewAction = function(event, action) {
  logger.log('Member ', this.id, ' is performing ', action);
  var self = this;
  window.setTimeout(function() {
    self.publish(event, action);
  }, Flock.TRANSMISSION_DELAY);
};
