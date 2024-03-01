'use strict'

import Company from './company.model.js'
import ExcelJS from 'exceljs';
import { encrypt, checkPassword, checkUpdate} from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'//borrar si no se usa

export const test = (req, res) =>{
    console.log('test is running')
    return res.send({message: 'Test is running'})
}

export const registerCompany = async (req, res) =>{
    try{
        let data = req.body

        const existingCompany = await Company.findOne({ name: data.name });
        if (existingCompany) {
            return res.status(400).send({message: `A company with the same name already exists.`});
        }
        // Crear una nueva instancia de Course solo con el nombre
        let company = new Company( data );
        // Guardar el curso
        await company.save();
        // Responder al usuario
        return res.send({ message: `Company ${data.name} has been successfully registered` });
    } catch(err){
        console.error(err);
        return res.status(500).send({ message: 'Could not save company', err: err });
    }
}

export const listCompanys = async(req, res) => {
    try {
        let companys = await Company.find().populate(['name', 'description', 'founder', 'impactLevel', 'yearsOfExperience', 'businessCategory']);

        if (!companys || companys.length === 0) {
            return res.status(404).send({ message: 'No companys found' });
        }
        return res.send({ message: 'Companys found', companys });
    } catch(err) {
        console.error(err);
        return res.status(500).send({ message: 'Error listing companys' });
    }
}

export const searchCompanyYears = async(req, res) => {
    try{
        //Obtener el parámetro de búsqueda
        let { search } = req.body
        //Bsucar
        let companys = await Company.find(
            {yearsOfExperience: search}
        ).populate(['name', 'description'])

        //validar la respuesta
        if (companys.length === 0) {
            return res.status(404).send({ message: 'There is no company with those years of experience or you are entering incorrect data.' });
        }
        if(!companys) return res.status(404).send({message: 'Companys not found '})
        //responder si todo sale bien 
        return res.send({message: 'Companys found', companys})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error searching Companys'})
    }
}

export const searchCompanyCategory = async(req, res) => {
    try{
        //Obtener el parámetro de búsqueda
        let { search } = req.body
        //Bsucar
        let companys = await Company.find(
            {businessCategory: search}
        ).populate(['name', 'description'])

        //validar la respuesta
        if (companys.length === 0) {
            return res.status(404).send({ message: 'There is no company with that category or you are entering incorrect information' });
        }
        if(!companys) return res.status(404).send({message: 'Companys not found '})
        //responder si todo sale bien 
        return res.send({message: 'Companys found', companys})
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error searching Companys'})
    }
}

export const listCompanysAToZ = async(req, res) => {
    try {
        let companys = await Company.find().populate(['name', 'description', 'founder', 'impactLevel', 'yearsOfExperience', 'businessCategory']);

        if (!companys || companys.length === 0) {
            return res.status(404).send({ message: 'No companys found' });
        }
        //sort() para ordenar los objetos de empresa en función de sus nombres. El método localeCompare() se utiliza para realizar una comparación sensible a la localización
        companys.sort((a, b) => a.name.localeCompare(b.name));
        return res.send({ message: 'Companys found', companys });
    } catch(err) {
        console.error(err);
        return res.status(500).send({ message: 'Error listing companys' });
    }
}

export const listCompanysZToA = async (req, res) => {
    try {
        let companys = await Company.find().populate(['name', 'description', 'founder', 'impactLevel', 'yearsOfExperience', 'businessCategory']);

        if (!companys || companys.length === 0) {
            return res.status(404).send({ message: 'No companys found' });
        }
        
        // Ordenar los nombres de las empresas de Z a A
        companys.sort((a, b) => b.name.localeCompare(a.name));

        return res.send({ message: 'Companys found', companys });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error listing companys' });
    }
}

export const updateCompany = async(req, res) => {//Sirve para datos generales, menos contraseña
    try{
       
        let { id } = req.params
       
        let data = req.body
        //ver si lo necesito o no
        //let update = checkUpdate(data, id)
        //if(!update) return res.status(400).send({message: `Have submitted some data that cannot be updated`})
        //Validar si tiene permisos (tokenización) X hoy no lo vemos X
        //Actualizar la db
        let updatedCompany = await Company.findOneAndUpdate(
            //va a buscar un solo registro
            {_id: id},  //ObjectId <- hexadecimales(hora sys, version mongo, llave privada...)
            data, //los datos que se van a actualizar 
            {new: true}
        )
        //Validar la actualización
        if(!updatedCompany) return res.status(401).send({message: 'Company not found and not update'})
        //Responde al usuario
        return res.send({message: `Company user`, updatedCompany})
    }catch(err){
        console.error(err)
        if(err.keyValue.username)return res.status(400).send({message: `Company ${err.keyValue.username} is already exists`})
        return res.status(500).send({message: `Error updating account`})
    }
}

export const generateExcel = async (req, res) => {
    try {
        // Obtener datos de las compañías
        let companies = await Company.find().populate(['name', 'description', 'founder', 'impactLevel', 'yearsOfExperience', 'businessCategory']);

        // Crear un nuevo libro de Excel
        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Companies');

        // Agregar encabezados con estilo
        const headerRow = worksheet.addRow(['Name', 'Description', 'Founder', 'Impact Level', 'Years of Experience', 'Business Category']);
        headerRow.eachCell(cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF00FF00' } // Color verde para el fondo
            };
            cell.font = { bold: true }; // Texto en negrita
        });

        // Agregar datos de las compañías
        companies.forEach(company => {
            worksheet.addRow([
                company.name,
                company.description,
                company.founder,
                company.impactLevel,
                company.yearsOfExperience,
                company.businessCategory
            ]);
        });

        // Ajustar el ancho de las columnas automáticamente
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const length = cell.value ? cell.value.toString().length : 10;
                if (length > maxLength) {
                    maxLength = length;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
        });

        // Escribir el libro de Excel en un archivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=companys.xlsx');
        await workbook.xlsx.write(res);

        return res.end();
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error generating Excel' });
    }
}