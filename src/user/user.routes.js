import express from 'express'
import { validateJwt, isAdmin } from '../middlewares/validate.jwt.js'
import { test, createAdmin, login, updateUser, deleteUser } from './user.controller.js'

const api = express.Router()

api.get('/test', [validateJwt, isAdmin], test)
api.post('/createAdmin', [validateJwt, isAdmin], createAdmin)
api.post('/login', login)
api.put('/updateUser/:id', [validateJwt, isAdmin], updateUser) 
api.delete('/deleteUser/:id', [validateJwt, isAdmin], deleteUser)

export default api