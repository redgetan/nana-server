const createError = require('http-errors')

const User = require('./../models/user')
const Review = require('./../models/review')
const Config = require('./../config/config')[env]
const Helper = require('./../util/helper')


module.exports = {
  create: (req, res, next) => {
    const reviewer = res.locals.current_user
    const user_id  = req.body.user_id
    const rating   = req.body.rating
    const text     = req.body.text

    if (!user_id) throw new createError(400, "Missing user_id.")

    return User.where({ id: user_id}).fetch().then((user) => {
      if (!user) throw new createError(400, "User not found")

      return Review.create({ 
        rating:      rating, 
        text:        text, 
        user_id:     user_id, 
        reviewer_id: reviewer.id 
      })
    }).then((review) => {
      if (review.error) throw new createError(400, review.error)

      res.send(review.toJson(["rating","text","created_at"]))
    }).catch(next)
  },

  index: (req, res) => {
    const pageIndex = 0

    return Review.fetchPage({ 
      pageSize: 30, 
      page: pageIndex, 
      withRelated: ["reviewer"] 
    }).then((reviews) => {
      let reviewList = reviews.models.map((review) => { 
        return review.toJsonWithReviewer()
      })
      res.send(reviewList)
    })
  }
}

