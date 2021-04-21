const express = require('express')
const router = express.Router()

const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const uploadProfile = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }])

// authenticated
const passport = require('../config/passport')
const authenticated = passport.authenticate('jwt', { session: false })

const userController = require('../controllers/userController')
const tweetController = require('../controllers/tweetController')

// routes: login & register
router.post('/login', userController.login)
router.post('/users', userController.register)
// routes : users
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/tweets', authenticated, userController.getTweetsOfUser)
router.put('/users/:id', authenticated, uploadProfile, userController.putUser)
router.get('/users/:id/replied_tweets', authenticated, userController.getRepliedTweetsOfUser)
router.get('/users/:id/likes', authenticated, userController.getLikedTweetsOfUser)
router.get('/users/:id/followers', authenticated, userController.getFollowers)
router.get('/users/:id/followings', authenticated, userController.getFollowings)
// route : tweets
router.get('/tweets', authenticated, tweetController.getTweets)
router.post('/tweets', authenticated, tweetController.postTweet)
router.get('/tweets/:tweet_Id', authenticated, tweetController.getTweet)

module.exports = router
