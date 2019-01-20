const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
const rp = require('request-promise')
const moment = require("moment")
const { SUBWAY_LINES, STATIONS_TO_TRACK, API_ID } = require('./constants')

// Make regex to filter out only the lines we want to match
const makeRegex = stations => stations.reduce((str, station, index) => str + `${index ? '|' : ''}${station}`, '')
const stationsRegex = new RegExp(makeRegex(STATIONS_TO_TRACK), 'i')

/////////////////////////////
/////// Start Script! ///////
/////////////////////////////

getFeedAndPrint()

//////////////////////////////////
////// All Helper Functions //////
//////////////////////////////////

function getFeedAndPrint () {
  const reqs = Promise.all(makeMtaRequests(SUBWAY_LINES))
  const timesToShow = []

  reqs
    .then(handleRequest)
    .catch(e => {
      console.log('Error fetching mta info', e)
    })
  setTimeout(() => {
    getFeed()
  }, (1000 * 60))
}

function makeMtaRequests (lineIds) {
  return lineIds.map(id => {
    const options = {
      method: 'GET',
      url: `http://datamine.mta.info/mta_esi.php?key=${API_ID}&feed_id=${id}`,
      encoding: null
    }
    return rp(options)
  })
}

function handleRequest (responses) {
  console.log('RESPONSES', responses)
  responses.forEach(res => {
    const feed = GtfsRealtimeBindings.FeedMessage.decode(res)
    parseFeed(feed)
  })
}

function parseFeed (feed) {
  feed.entity.forEach(entity => { // <- each entity is just a train
    if (entity.trip_update) {
      // console.log('ENTRY', entity.trip_update)
      // console.log('SUBWAY', entity)
      // console.log('STOP TIME UPDATES', entity.trip_update.stop_time_update)
      entity.trip_update.stop_time_update.forEach((stop) => {
        const { stop_id, arrival } = stop
        // console.log('STOP ID', stop_id)
        if (stationsRegex.test(stop_id)) {
          console.log('MY STOP', stop_id)
          const arrivalTs = arrival.time.low * 1000
          console.log('ARRIVAL', moment(arrivalTs).format())
        }
      })
    }
  })
}
