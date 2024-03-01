'use strict'

import User from './user.model.js'
import { encrypt, checkPassword, checkUpdate} from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'

export const test = (req, res) =>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const userDefault = async(req,res) =>{
    try{
        const userExists = await User.findOne({username: 'admin'})
        if(userExists){
            console.log('Ya existe el Admin Maestro')
        }else{
            const encryptPassword =  await encrypt('admin123')
            const nuevoUsuario = new User({
                name: 'admin',
                surname: 'admin',
                username: 'admin',
                password: encryptPassword,
                email: 'admin@gmail.com',
                phone: '12345678',
                role: 'ADMIN'
            })
            await nuevoUsuario.save()
        }
    }catch(err){
        console.error(err)
    }
}

export const createAdmin = async(req, res)=>{
    try{
        //Captura el formulario (body)
        let data = req.body
        //Encriptamos contraseña
        data.password = await encrypt(data.password)
        //Asignar el rol por defecto (CLIENT)
        data.role = 'ADMIN'
        //Guardar la información en la db
        let user = new User(data)
        await user.save()
        //Responde al usuario
        return res.send({message: `Register seccessfully, can be logged with email use ${user.username}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error registering user', err: err})
    }
}

export const login = async(req, res) =>{
    try{
        //Capturamos los datos (body)
        let {username, password} = req.body
        //validamos que el usuario exista
        let user = await User.findOne({username: username})//Busca un solo registro
        //verifica que la contraseña coincida
        if(user && await checkPassword(password, user.password)){
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            //Generate token 
            let token = await generateJwt(loggedUser)
            //responder al usuario
            return res.send(
                {message: `Welcome ${loggedUser.name}`,
                loggedUser,
                token})
        }
        return res.status(400).send({message: `User not found`})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error to login'})
    }
}

export const updateUser = async(req, res) => {//Sirve para datos generales, menos contraseña
    try{
        //Obtener el id del usuario para actualizar
        let { id } = req.params
        //obtener los datos a actualizar
        let data = req.body
        //validar que data no este vacío
        let update = checkUpdate(data, id)
        if(!update) return res.status(400).send({message: `Have submitted some data that cannot be updated`})
        //Validar si tiene permisos (tokenización) X hoy no lo vemos X
        //Actualizar la db
        let updatedUser = await User.findOneAndUpdate(
            //va a buscar un solo registro
            {_id: id},  //ObjectId <- hexadecimales(hora sys, version mongo, llave privada...)
            data, //los datos que se van a actualizar 
            {new: true}
        )
        //Validar la actualización
        if(!updatedUser) return res.status(401).send({message: 'User not found and not update'})
        //Responde al usuario
        return res.send({message: `Update user`, updatedUser})
    }catch(err){
        console.error(err)
        if(err.keyValue.username)return res.status(400).send({message: `Username ${err.keyValue.username} is alredy exists`})
        return res.status(500).send({message: `Error updating account`})
    }
}

export const deleteUser = async(req, res)=>{
    try{
        //Obtener el Id
        let { id } = req.params
        //validar si esta logeado y es el mismo
        //Eliminamos (deleteOne(solo elimina), findeOneAndDelete(me devuelve el documento eliminado))
        let deletedUser = await User.findOneAndDelete({_id: id})
        //Verificamos que se elimino
        if(!deletedUser) return res.status(404).send({message: 'Account not found and not delete'})
        //Responder al usuario
        return res.send({message: `Account with username ${deletedUser.username} delete successfully`}) //seeimpre que envio solo el send, envia un status(200)
    }catch(err){
        console.error(err)
        return res.status(500).send({message: `Error deleting account`})
    }
}