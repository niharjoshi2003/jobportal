import mongoose from "mongoose";

const applicationAnswerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:['pending', 'shortlisted', 'accepted', 'rejected'],
        default:'pending'
    },
    applicationAnswers: [applicationAnswerSchema]
},{timestamps:true});
export const Application  = mongoose.model("Application", applicationSchema);