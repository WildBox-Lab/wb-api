import createError from 'http-errors'
import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import session from 'express-session'
import _MemoryStore from 'memorystore'
import bodyParser from 'body-parser'

import indexRouter from './routes/index'
import sceneRouter from './routes/scene'
import adminRouter from './routes/admin'
import sitemapRouter from './routes/sitemapRouter'
import eventRouter from './routes/event'

const MemoryStore = _MemoryStore(session)

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ type: 'application/*+json' }))

const sess = {
  secret: 'keyboard cattttttt',
  store: new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 5 * 24 * 60 * 60 * 1000 },
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(session(sess))

app.use('/', indexRouter)
app.use('/api', indexRouter)
app.use('/api/scene', sceneRouter)
app.use('/api/admin', adminRouter)
app.use('/api/_sitemap', sitemapRouter)
app.use('/api/event', eventRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err: any, req: any, res: any) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send({ code: err.status || 500 })
})

export default app
