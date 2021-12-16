const createError = require('http-errors')

const User = require('./../models/user')
const Photo = require('./../models/photo')
const Config = require('./../config/config')[env]
const Helper = require('./../util/helper')

module.exports = {
  create: (req, res, next) => {
    const currentUser = res.locals.current_user
    const src = req.body.src

    return Photo.create({ 
      src:     src, 
      user_id: currentUser.id 
    }).then((photo) => {
      if (photo.error) throw new createError(400, photo.error)

      res.send(photo.toJson(["url"]))
    }).catch(next)
  },

  index: (req, res, next) => {
    const user_id  = req.params.user_id
    const pageIndex = 0

    if (!user_id) throw new createError(400, "Missing user_id.")

    return Photo
      .where({ user_id: user_id })
      .orderBy('created_at', 'DESC')
      .fetchPage({ 
      pageSize: 30, 
      page: pageIndex, 
    }).then((photos) => {
      const photoList = photos.map((photo) => {
        return photo.toJSON()
      })

      res.send(photoList)
    }).catch(next)
  },

  destroy: (req, res, next) => {
    const currentUser = res.locals.current_user
    const photo_id = req.params.id

    return Photo.where({ 
      id:     photo_id, 
      user_id: currentUser.id 
    }).fetch().then((photo) => {
      if (!photo) throw new createError(400, "Photo doesnt exist or doesnt belong to user")

      return photo.destroy()
    }).then(() => {
      res.send({})
    }).catch(next)
  },

}
