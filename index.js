const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
const rp = require('request-promise')
const moment = require("moment")
const { SUBWAY_LINES, STATIONS_TO_TRACK, API_ID } = require('./constants')

// M -> 21
// G -> 31
const reqs = Promise.all(makeMtaRequests(SUBWAY_LINES))
const timesToShow = []

reqs
  .then(handleRequest)
  .catch(e => {
    console.log('Error fetching mta info', e)
  })


// request(requestSettings, (error, response, body) => {
//   if (!error && response.statusCode === 200) {
//     const feed = GtfsRealtimeBindings.FeedMessage.decode(body)
//     feed.entity.forEach(entity => { // <- each entity is just a train
//       if (entity.trip_update) {
//         // console.log('ENTRY', entity.trip_update)
//         // console.log('SUBWAY', entity)
//         // console.log('STOP TIME UPDATES', entity.trip_update.stop_time_update)
//         entity.trip_update.stop_time_update.forEach((stop) => {
//           const { stop_id, arrival } = stop
//           // console.log('STOP ID', stop_id)
//           if (/G31/i.test(stop_id)) {
//             console.log('MY STOP', stop_id)
//             const arrivalTs = arrival.time.low * 1000
//             console.log('ARRIVAL', moment(arrivalTs).format())
//           }
//         })
//       }
//     })
//   }
// })

function getFeed () {

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
    console.log('FEED', feed)
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
        if (/G31/i.test(stop_id)) {
          console.log('MY STOP', stop_id)
          const arrivalTs = arrival.time.low * 1000
          console.log('ARRIVAL', moment(arrivalTs).format())
        }
      })
    }
  })
}
