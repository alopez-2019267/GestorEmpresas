import express from 'express'
import { validateJwt, isAdmin } from '../middlewares/validate.jwt.js'
import { test, registerCompany, listCompanys, searchCompanyYears, searchCompanyCategory, listCompanysAToZ, listCompanysZToA, updateCompany, generateExcel } from './company.controller.js'

const api = express.Router()

api.get('/test', [validateJwt, isAdmin], test)
api.post('/registerCompany', [validateJwt, isAdmin], registerCompany)
api.get('/listCompanys', [validateJwt, isAdmin], listCompanys)
api.post('/searchCompanyYears', [validateJwt, isAdmin], searchCompanyYears)
api.post('/searchCompanyCategory', [validateJwt, isAdmin], searchCompanyCategory)
api.get('/listCompanysAToZ', [validateJwt, isAdmin], listCompanysAToZ)
api.get('/listCompanysZToA', [validateJwt, isAdmin], listCompanysZToA)
api.put('/updateCompany/:id', [validateJwt, isAdmin], updateCompany) 
api.get('/generateExcel', [validateJwt, isAdmin], generateExcel)

export default api