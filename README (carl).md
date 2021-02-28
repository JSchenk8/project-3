## Challenges

We faced a number of challenges throughout the project, below were the main pain points we encountered. These were mostly client-side, as our group struggled more with front-end page interaction.

1. Geocoding
2. Mapbox navigation
3. Processing PUT requests in the client

Through overcoming these challenges, we would consider these as some of our biggest wins of the project!

### 1. Geocoding locations

This was a major pain point during the project, and took a significant amount of time to create a solution. 

The challenge was how we would take a search query from the client, and auto-populate search results below the search bar. These results would need to be clickable and store data in order to change the viewport on the map once the user clicks and proceeds on the search journey.

Carl worked through this functionality throughout the projct and created the used solution.

The final search journey: 

![searchjourney1](./images/searchjourney1.png)
![searchjourney2](./images/searchjourney2.png)
![searchjourney3](./images/searchjourney3.png)

Initially, Carl attempted to find a library/plugin which we could simply "plug-and-play". However we were limited to using a non-Google API solution (due to costs), and the react-map-gl library we opted to use did not have any apparent examples for a geocoding search box which was of interest.

Therefore, Carl opted to simply use the search query retrived from the client in a simple GET request to the Mapbox Geocoding API. This forward geocoding request retrieved location data based on the query, and sent back a response with search results. 

```Javascript
// ! Code for search bar on the homepage
<div className="field is-grouped">
  <div className="control">
    <input
      className="input is-info is-rounded is-focused is-medium"
        id="input-width"
        type="text"
        placeholder="Search for a location near you!"
        onChange={createSearchQuery}
        value={search}
     />
     <div className="control">
       <button className="button is-info is-medium">Search</button>
     </div>

// ! functions to handle query creation

function createSearchQuery(event) {
  updateQuery(event.target.value)
  updateSearch(event.target.value)
}

// ! useEffect utilised to ensure a GET request would be sent each time the query was changed, put into a debounce in order to ensure requests to the API were limited.

// ! Response from Geocoding API was mapped over to retrieve required data.

const debouncedSave = debounce((query, updateSearchResults) => {
  axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=gb&access_token=${process.env.MAPBOX_TOKEN}`)
    .then(({ data }) => {
      const search = data.features.map(location => {
        return {
          id: location.id,
          placeName: location.place_name,
          location: {
            lat: location.center[1],
            long: location.center[0]
          }
        }
      })
      updateSearchResults(search)
    })
}, 500)

useEffect(() => {
  debouncedSave(query, updateSearchResults)
}, [query])
```

This response array was then mapped over to create a series of elements, each of which have an onClick function to take the coordinates of that specific result which can then be passed through to the locations/map page as state.

```Javascript
// ! Only rendering if there was data in the searchResults state, the below code populates each name, and calls a function on click.

{searchResults.length > 0 &&
  <div className='dropdown is-active is-fullwidth'>
    <div className='dropdown-menu'>
      <div className='dropdown-content'>
        {searchResults.map((place) => {
          return <div key={place.id}>
          <div className='dropdown-item' id='cardHover' onClick={() => handlePlaceSelect(place)}>{place.placeName}</div>
          <hr className="dropdown-divider"></hr></div>
        })}
      </div>
    </div>
  </div>}

// ! Below function called on each click above. It stores the information for that result in state, clears the search results from rendering, and populates the full place name in the search bar.

function handlePlaceSelect({ placeName, location }) {
  updateselectedLocation(location)
  updateSearchResults([])
  updateSearch(placeName)
}
```

Finally, this state could then be used to change the viewpoint of the map.

```Javascript
// ! State variables for the map page, with defaults set (in case user navigates to page without a search).

const [long, getLong] = useState(-0.118)
const [lat, getLat] = useState(51.519)
const [zoom, setZoom] = useState(12)

// ! setReady used to prevent state being read if there is no state (user navigates to page without searching).

const [ready, setReady] = useState(false)

// ! Below function fetches coordinates from state in order to setViewport on Mapbox component.

if (location.state && !ready) {
  getLong(location.state.place.long)
  getLat(location.state.place.lat)
  setZoom(13)
  setReady(true)
}

```
This functionality was also put to use elsewhere, on the location update pages!

### 2. Mapbox

Using and implementing react-mapbox-gl was quite challenging, and also took our group more time than other features. Yusuf took on most of this work, while James advised as he had some experience of using the library. Carl finalised the map through the geocoding challenge (above), while Joe finalised the styling and icon customisation.

![finalmap](./images/finalmap.png)

One main challenge was getting the map to render properly, which required a suite of custom styles in-line. The other challenge was how to display the locations using the coordinate data we seeded our database with.

```Javascript
//! Mapbox component inserted in the locations page, our seeded locations were provided here as "coordinate" by mapping through our locations data.

<Map
  long={long}
  lat={lat}
  zoom={zoom}
  coordinate={locations.map((coordinate) => {
  return { coordinate: coordinate.location, id: coordinate._id }
  })}
/>

// ! Code for Map below, with custom styling in the parent container.

// ! Coordinates (passed from locations page) again mapped through to create Marker compontents at the correct points on the map

<>
  <div className="map-container mg-large" style={{ width: '93vw', height: '80vh', display: 'flex', justifyContent: 'center', borderRadius: '20px', margin: '100px auto 0 auto ', boxShadow: '0 5px 8px -2px black' }}>
    <ReactMapGL
      {...viewport}
      onViewportChange={(viewport) => setViewport(viewport)}
      mapboxApiAccessToken={process.env.MAPBOX_TOKEN}
    >
      {coordinate.map((coor) =>
        <Marker
          key={coor.id}
          latitude={coor.coordinate.lat}
          longitude={coor.coordinate.long}
        >
          <Link to={`/location/${coor.id}`}><img width={30} src={imgUrl} /></Link>
        </Marker>
      )}
    </ReactMapGL >
  </div>
</>
```

### 3. Processing PUT requests in the client

Editing a location, event, or profile was central features of our website. In order to do this, we had our PUT endpoints on our back-end, which were all up and running. However, how we went about managing this in the front-end was quite challenging.

We wanted to have a seamless experience in the client, with the update/edit feature found on the same page as the single event/location/profile page. This was opposed to a separate page for update/edit, which we reserved for if we could not make the same-page functionality work.

James was able to work through all the implementation of these features, with some debugging help from Carl!

![singleevent](./images/singleevent.png)
![singleeventupdate](./images/singleeventupdate.png)

Due to the complexity and size of the single event/location/profile files, we needed to separate the update code into separate files. This brought additional issues of having different state variables which were out of scope. 

Firstly, James was able to use a ternary and a piece of state to manage the rendering of the update pane.

```Javascript
// ! The editState variable was changed by clicking on the 'update info' button on the page

// ! Either the info would be displayed, or the update form would

{editState === false
  ? <div>
    <div>{event.name}</div>
    <div><span>Location: </span>{<Link to={`/location/${event.location._id}`}>{event.location.name}</Link>}</div>
    <div><span>Host: </span>{<Link to={`/user/${event.user._id}`}>{event.user.username}</Link>}</div>
    <div><span>Time: </span>{event.time}</div>
    <div><h3>Details:</h3><div>{event.details}</div></div>
    {event.attendees.length > 0 &&
      <div><h3>Attendees:</h3>
        {event.attendees.map(attendee => {
          return <Link key={attendee._id} to={`/user/${event.user._id}`}>{attendee.user.username}</Link>
        })}
      </div>}
  </div>
  : <EventUpdateForm
    formData={formData}
    changeEditState={changeEditState}
    id={id}
  />
}
```

The current data would then be passed through into the update form component, as well as the id of the document. This then allowed James to populate the update form with the current data in the other file.

James was then able to handle the form in the same way as on the create document pages. Key to making this work was to have separate formData state variables, one on each file, which made it more straightforward to pass the data between the main page and the component (instead of passing this as props).

## Other wins

### Well functioning back-end
Overall, our back-end was well set up and was easy to work with. This was especially satisfying given that we had 29 different endpoints (and we used 28 of them!). We accomplished this through good planning, and setting this up in full before we started any work on the client. 

We shared responsibility of working on the back-end, which meant that we were all very familiar and comfortable with all parts of the MVC design of our back-end. Finally, Carl did extensive endpoint testing, and the whole group wrote a series of tests to ensure that we were all very confident of the functionality.

### High level of interactivity and connectivity
When we got to the front-end development, we were able to create a lot of interactivity with all of our back-end endpoints throughout the site. As mentioned above we were able to use 28 of 29 endpoints created. In addition, several of our models nest other models and schemas within themselves, with no issues when associating them to each other (e.g. connecting an event to a location, or attendee to an event)

### Security and error handling
While our error handling is definitely incomplete, we were able to ensure that the majority of our pages include user-friendly error handling. Error messages are provided in line on the specific fields which contain the various errors. In addition, we ensured that our back-end error handler and controllers were set up for us to be able to do this.

## Future features

Overall, we created a good-looking site which was styled nicely. However there are definitely opportunities to add polish to the appearance of the site. Both layout of pages, backgrounds, and general styling could use small improvements, particularly the map. Apart from that, we identified a few extra features we would have liked to complete/implement.

### Social media share buttons
James looked to add Facebook share buttons to the single event pages, however these no longer work after deployment

### Event results
One of the key features we really wanted to implement was a results section for each event. We even coded in placeholder objects within our event models. Unfortunately we ran out of time and were unable to work on this. 

What we wanted to have was a view built in the client which the user (an event host) would be able to interact with to record scores of their particular event. Scores and wins would then be attributed to specific user profiles, which could be viewed on their profiles.

### Ratings & rankings
Finally we did plan to include a rating system for our models, in order for users to give e.g. a location a rating. Users could then also search for or sort locations by their rating, to find the best quality locations.