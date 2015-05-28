var Sequelize = require('sequelize');

var orm;
if (process.env.DATABASE_URL) {
  // The DATABASE_URL variable should already include the username, password, host, port, and database name
  orm = new Sequelize(process.env.DATABASE_URL);
} else {
  orm = new Sequelize('joseki', {
    host: 'localhost',
    dialect: 'postgres'
  });
}

var User = orm.define('User', {
  username: Sequelize.STRING,
  facebook_id: Sequelize.STRING
});

var Event = orm.define('Event', {
  eventName: Sequelize.STRING,
  start: Sequelize.DATE,
  end: Sequelize.DATE,
  location: Sequelize.STRING,
  minParticipants: Sequelize.INTEGER,
  maxParticipants: Sequelize.INTEGER,
  action: Sequelize.STRING
});

var Observation = orm.define('Observation', {
  content: Sequelize.STRING,
  completed: Sequelize.BOOLEAN
});

/**
 * MODEL RELATIONS
 * belongsToMany connects a source with multiple targets, and the targets can connect to multiple sources
 * Using a `through` option will create a new model with foreign keys for the source and target
 *
 * Example:
 * User.belongsToMany(Event, {as: 'ShepherdEvents', through: 'ShepherdEvent'});
 * Event.belongsToMany(User, {as: 'Shepherds', through: 'ShepherdEvent'});
 *
 * We create a many-to-many relationship between users and events, and the join table is called ShepherdEvent.
 * The ShepherdEvent table will have a foreign key for EventId and UserId.
 * The User and Event models will have get, set, and add methods. For example, user.getShepherdEvents() 
 * will return all instances of a ShepherdEvent belonging to that user, and each instance would reference the 
 * Event the user is a shepherd for.
 * 
 * See http://sequelize.readthedocs.org/en/latest/docs/associations/#belongs-to-many-associations
 *
 * hasMany connects a source with multiple targets, but the targets can only connect to one source
 *
 * See http://sequelize.readthedocs.org/en/latest/docs/associations/#one-to-many-associations
 */

User.belongsToMany(Event, {as: 'ShepherdEvents', through: 'ShepherdEvent'});
Event.belongsToMany(User, {as: 'Shepherds', through: 'ShepherdEvent'});
User.belongsToMany(Event, {as: 'SheepEvents', through: 'SheepEvent'});
Event.belongsToMany(User, {as: 'Sheep', through: 'SheepEvent'});
User.hasMany(Observation); // UserId on Observation
Event.hasMany(Observation); // EventId on Observation

/* EXAMPLE OF HOW TO CREATE A USER, THEN AN EVENT, AND FINALLY AN OBSERVATION TIED TO THE USER AND EVENT:
User.create({
  username: 'Kev'
}).then(function(user) {
  Event.create({
    eventName: 'Dance party',
    location: 'San Francisco'
  }).then(function(event) {
    Observation.create({
      content: 'It is poppin in herrr',
      completed: false
    }).then(function(observation) {
      // Associate the observation to the event
      return event.addObservation(observation);
    }).then(function(observation) {
      // Associate the observation to the user
      user.addObservation(observation);
    });
  });
});
*/

// sync all models
orm.sync();

// export all models
exports.User = User;
exports.Event = Event;
exports.Observation = Observation;
