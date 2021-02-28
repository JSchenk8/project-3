import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getLoggedInUserId, isCreator } from '../lib/auth'
import { Link } from 'react-router-dom'
import EventUpdateForm from './EventUpdate'
import ShareButton from './ShareButton'

export default function singleEventPage({ match, history }) {
  // const [locations, getLocations] = useState([])
  const [event, getEvent] = useState({})
  const [newComment, updateNewComment] = useState({
    text: ''
  })
  const [attendee, updateAttendee] = useState(false)
  // * This is the event ID
  const id = match.params.id
  //* This is the logged in user's token
  const token = localStorage.getItem('token')
  const [editState, changeEditState] = useState(false)
  const [formData, updateFormData] = useState({
    name: '',
    location: {},
    time: '',
    details: '',
    image: ''
  })

  // const [errors, updateErrors] = useState({
  //   name: '',
  //   location: {},
  //   time: '',
  //   details: '',
  //   image: ''
  // })

  function isLoggedInUserAttending(data) {
    return data.attendees.map((attendee) => {
      if (attendee.user._id === getLoggedInUserId()) {
        updateAttendee(true)
      }
    })
  }
  useEffect(() => {
    async function fetchData() {
      const { data } = await axios.get(`/api/event/${id}`)
      getEvent(data)
      const mappedData = { ...data }
      updateFormData(mappedData)
      // console.log('data', data)
      isLoggedInUserAttending(data)
    }
    fetchData()
  }, [attendee])

  // useEffect(() => {
  //   axios.get('/api/location')
  //     .then(({ data }) => {
  //       getLocations(data)
  //     })
  // }, [])

  // console.log(formData)

  function handleChange(e) {
    updateNewComment({ ...newComment, text: e.target.value })
  }

  async function handleCommentSubmit(e) {
    e.preventDefault()
    // console.log(id)
    try {
      await axios.post(`/api/event/${id}/`, newComment, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      location.reload()
    } catch (err) {
      console.log(err.response)
    }
  }

  async function handleDelete() {
    try {
      axios.delete(`/api/event/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      history.push('/event')
    } catch (err) {
      console.log(err.response)
    }
  }

  async function handleCommentDelete(commentId) {
    try {
      axios.delete(`/api/event/${id}/comment/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      location.reload()
    } catch (err) {
      console.log(err.response)
    }
  }

  function attendeeButton() {
    if (!attendee) {
      return <div>
        <button className="button is-hovered is-info mb-2" onClick={attendEvent}>
          Attend Event
        </button>
      </div>
    } else {
      return <div>
        <button className="button is-hovered is-info mb-2" onClick={leaveEvent}>
          Leave Event
        </button>
      </div>
    }
  }

  async function attendEvent() {
    try {
      await axios.post(`/api/event/${id}/attendee`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      updateAttendee(true)
    } catch (err) {
      console.log(err.response)
    }

  }

  async function leaveEvent() {
    try {
      await axios.delete(`/api/event/${id}/attendee`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      updateAttendee(false)
    } catch (err) {
      console.log(err.response.data)
    }

  }

  if (!event.user) {
    return null
  }

  return <div className='container mt-4'>
    <div className="columns is-centered">
      <div className="column">
        <Link className='button is-warning is-hovered mb-2' to={'/events'}>Back</Link>
        <img src={event.image} />



        <div><ShareButton
          eventId={id}
        /></div>
      </div>
      <div className="column is-half">
        <div className="columns is-centered">
          <div className="column">
            <div className="box mt-6">
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
                  updateFormData={updateFormData}
                  changeEditState={changeEditState}
                  id={id}
                />
              }
            </div>
            {getLoggedInUserId() &&
              <div>
                {event.comments.length > 0 &&
                  <div><h3>Comments:</h3>
                    {event.comments.map(comment => {
                      return <div key={comment._id} className='notification is-size-7'>
                        {isCreator(comment.user._id) && <button
                          className='delete is-small is-pulled-right'
                          onClick={() => handleCommentDelete(comment._id)}
                        ></button>}
                        {comment.text}
                      </div>
                    })}
                  </div>}
                {getLoggedInUserId() &&
                  attendeeButton()
                }
                <form className="box mt-3" onSubmit={handleCommentSubmit}>
                  <label className='label'>Add a comment!</label>
                  <textarea
                    className="textarea"
                    placeholder='Your comment here...'
                    type="text"
                    value={newComment.text}
                    onChange={handleChange}
                    name={'newComment'}
                  />
                  <button className='button is-info is-hovered mt-3'>Post</button>
                </form>
              </div>}
            <div className='columns mt-2'>
              {isCreator(event.user._id) && <div className='column is-two-quarters'><button
                className='button is-danger is-hovered'
                onClick={handleDelete}
              >Delete & Cancel Event</button></div>}
              {isCreator(event.user._id) && <div className='column is-one-quarters'><button
                className='button is-warning is-hovered is-pulled-right'
                onClick={() => changeEditState(true)}
              >Edit Event</button></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


}