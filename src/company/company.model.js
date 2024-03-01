import mongoose from "mongoose"

const companySchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    founder: {
        type: String,
        require: true
    },
    impactLevel: {
        type: String,
        require: true
    },
    yearsOfExperience: {
        type: String,
        require: true
    },
    businessCategory: {
        type: String,
        require: true
    }
})

export default mongoose.model('company', companySchema)