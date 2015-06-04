var EventEmitter = require('events').EventEmitter,
    assign = require('object-assign'),
    AppDispatcher = require('../dispatcher/AppDispatcher'),
    AppConstants = require('../constants/AppConstants');

var _shepherdEvents = [];
var _notShepherdEvents = [];
var _currentEvent = {name: '', location: ''};

var EventStore = assign({}, EventEmitter.prototype, {
  getAllEventsByShepherd: function() {
    return _shepherdEvents;
  },

  getAllEventsNotByShepherd: function(){
    return _notShepherdEvents;
  },

  getCurrentEvent: function() {
    return _currentEvent;
  },

  /**
   * Trigger an event
   * @param {string} eventName The name of the event
   */
  emitEvent: function(eventName) {
    this.emit(eventName);
  },

  /**
   * Register a callback to invoke when an event is triggered
   * @param {string} eventName The name of the event
   * @param {function} callback The callback function to invoke when the event is triggered
   */
  addEventListener: function(eventName, callback) {
    this.on(eventName, callback);
  },

  /**
   * Prevent a callback from being invoked when an event is triggered
   * @param {string} eventName The name of the event
   * @param {function} callback Stops the callback function from being invoked when the event is triggered
   */
  removeEventListener: function(eventName, callback) {
    this.removeListener(eventName, callback);
  }

});


// Register callback to handle all updates
AppDispatcher.register(function(payload) {
  switch(payload.actionType) {
    // When events are fetched
    case AppConstants.SHEPHERD_EVENT_GET:
      // Set current events collection to the fetched results
      _shepherdEvents = payload.events;
      // console.log('inside of eventstore Shepherd get', _shepherdEvents);
      EventStore.emitEvent('shepherd_events_get');
      break;

    case AppConstants.NOT_SHEPHERD_EVENT_GET:
      // Set current events collection to the fetched results
      _notShepherdEvents = payload.events;
      // console.log('inside of eventstore not Shepherd get', _notShepherdEvents);
      EventStore.emitEvent('not_shepherd_events_get');
      break;

    case AppConstants.EVENT_CREATE:
      // Add new event to the current collection of events
      _shepherdEvents.push(payload.event);
      EventStore.emitEvent('create');
      // TODO: DO SOMETHING ELSE IF THERE WAS AN ERROR DURING EVENT CREATION
      break;

    // TODO: NEED TO IMPLEMENT HANDLER FOR DELETING EVENTS
    case AppConstants.EVENT_DELETE:
      EventStore.emitEvent('delete');
      break;

    default:
      // no op
  }
});

module.exports = EventStore;
