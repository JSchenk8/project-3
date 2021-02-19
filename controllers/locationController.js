import Location from '../models/location.js'
//populate comment


//list of all Locations
async function getAllLocation(req, res, next) {
  try {
    const locationList = await Location.find().populate('comment').populate('user')
    res.send(locationList)
  } catch (err) {
    next(err)
  }
}


// create location
async function makeLocation(req, res, next) {
  const body = req.body
  try {
    const newLocation = await Location.create(body)
    res.status(201).send(`hi, you successfully new game location ${newLocation}`)

  } catch (err) {
    next(err)
  }
}

//find one location by id
async function getSingleLocation(req, res, next) {
  const locationId = req.params.id
  try {
    const location = await Location.findById(locationId).populate('comment').populate('user')
    res.send(`your search is: ${location}`)
  } catch (err) {
    next(err)
  }
}
// finding location by name
async function getLocationByName(req, res, next) {
  const locationName = req.body.name
  try {
    const location = await Location.findById(locationName).populate('comment').populate('user')
    res.send(`your search is: ${location}`)

  } catch (err) {
    next(err)
  }
}

//udpate single location
async function updateLocation(req, res, next) {
  const locationId = req.params.id
  const body = req.body
  const currentUser = req.currentUser
  try {
    const locationToUpdate = await Location.findById(locationId)

    if (!locationToUpdate.user.equals(currentUser._id)) {
      return res.status9401
        .send('Unauthorized')
    }
    locationToUpdate.set(body)
    locationToUpdate.save()
  } catch (err) {
    next(err)
  }
}

//delet location 
async function deleteLocation(req, res, next) {
  const locationId = req.params.id
  const currentUser = req.currentUser
  try {
    const locationToDelete = await Location.findById(locationId)
    if (!locationToDelete.user.equals(currentUser._id)) {
      return res.status(401).send('Unauthorized')
    }
    await locationToDelete.deleteOne()
    res.send(`your successfully deleted this location, ${locationToDelete}`)
  } catch (err) {
    next(err)
  }

}


export default {
  getAllLocation,
  makeLocation,
  getSingleLocation,
  updateLocation,
  deleteLocation,
  getLocationByName
}